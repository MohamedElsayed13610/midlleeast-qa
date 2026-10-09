-- Online legal consultations (booking, documents, availability, audit trail).
-- Apply ONCE after db/cms-schema.sql, as postgres (SQL editor or `supabase db push`).
-- Public visitors never read or write these tables directly: they only call the
-- SECURITY DEFINER functions at the bottom (anon key). Admins use RLS + cms_admins,
-- exactly like cms_team / cms_news.
begin;

-- ---------------------------------------------------------------- availability
create table public.consultation_settings (
  id boolean primary key default true check (id),
  working_days smallint[] not null default array[0,1,2,3,4]::smallint[] check (working_days <@ array[0,1,2,3,4,5,6]::smallint[]), -- 0 = Sunday
  start_time time not null default '09:00',
  end_time time not null default '17:00',
  slot_minutes smallint not null default 60 check (slot_minutes in (15,20,30,45,60,90,120)),
  min_notice_hours smallint not null default 4 check (min_notice_hours between 0 and 168),
  max_advance_days smallint not null default 60 check (max_advance_days between 1 and 180),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);
insert into public.consultation_settings(id) values (true);

create table public.consultation_blocked_dates (
  id uuid primary key default gen_random_uuid(),
  blocked_on date not null unique,
  reason text not null default '' check (length(reason) <= 200),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- consultations
create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  service_slug text not null check (service_slug ~ '^[a-z0-9][a-z0-9-]{1,59}$'),
  consultation_method text not null check (consultation_method in ('office','video','phone')),
  client_name text not null check (length(client_name) between 3 and 120),
  client_phone text not null check (length(client_phone) between 7 and 24),
  client_email text not null check (length(client_email) between 5 and 254),
  client_company text check (client_company is null or length(client_company) <= 150),
  preferred_language text not null default 'ar' check (preferred_language in ('ar','en')),
  subject text not null check (length(subject) between 5 and 150),
  description text not null check (length(description) between 20 and 4000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  duration_minutes smallint not null check (duration_minutes between 15 and 240),
  assigned_member_id uuid references public.cms_team(id) on delete set null,
  status text not null default 'new' check (status in ('new','pending_confirmation','confirmed','completed','cancelled')),
  -- Reserved for a future payment provider (MyFatoorah). Unused today: payment_status stays 'not_required'.
  consultation_fee numeric(10,2) check (consultation_fee is null or consultation_fee >= 0),
  currency text not null default 'QAR' check (currency ~ '^[A-Z]{3}$'),
  payment_status text not null default 'not_required' check (payment_status in ('not_required','pending','paid','failed','refunded')),
  payment_provider text check (payment_provider is null or length(payment_provider) <= 40),
  payment_reference text check (payment_reference is null or length(payment_reference) <= 120),
  client_ip_hash text check (client_ip_hash is null or length(client_ip_hash) <= 128),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  -- Race-free double-booking protection: two active consultations can never overlap.
  constraint consultations_no_overlap exclude using gist (tstzrange(starts_at, ends_at) with &&)
    where (status in ('new','pending_confirmation','confirmed'))
);
create index consultations_created_idx on public.consultations(created_at desc);
create index consultations_starts_idx on public.consultations(starts_at);
create index consultations_status_idx on public.consultations(status);
create index consultations_ip_idx on public.consultations(client_ip_hash, created_at desc) where client_ip_hash is not null;
create index consultations_email_idx on public.consultations(lower(client_email));
create index consultations_member_idx on public.consultations(assigned_member_id) where assigned_member_id is not null;

create table public.consultation_documents (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  storage_path text not null unique check (length(storage_path) <= 200),
  original_name text not null check (length(original_name) between 1 and 200),
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png')),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  created_at timestamptz not null default now()
);
create index consultation_documents_consultation_idx on public.consultation_documents(consultation_id);

-- Internal notes + status/schedule/assignment history. Never exposed to public endpoints.
create table public.consultation_events (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  kind text not null check (kind in ('created','status','reschedule','assign','note')),
  from_value text check (from_value is null or length(from_value) <= 200),
  to_value text check (to_value is null or length(to_value) <= 200),
  note text check (note is null or length(note) between 1 and 2000),
  actor_id uuid,
  actor_email text,
  created_at timestamptz not null default now()
);
create index consultation_events_consultation_idx on public.consultation_events(consultation_id, created_at desc);

-- ---------------------------------------------------------------- triggers
create function public.consultation_before_update() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.reference_number is distinct from old.reference_number then raise exception 'Reference number is immutable' using errcode='23514'; end if;
  if new.status is distinct from old.status then
    if old.status in ('completed','cancelled') then raise exception 'Closed consultations cannot change status' using errcode='23514'; end if;
    if new.status = 'new' then raise exception 'A consultation cannot return to new' using errcode='23514'; end if;
  end if;
  new.ends_at = new.starts_at + new.duration_minutes * interval '1 minute';
  new.updated_at = clock_timestamp();
  return new;
end;
$$;
create trigger consultations_before_update before update on public.consultations for each row execute function public.consultation_before_update();

create function public.consultation_after_update() returns trigger language plpgsql security definer set search_path='' as $$
declare
  v_email text := nullif(auth.jwt() ->> 'email', '');
  v_old_member text;
  v_new_member text;
begin
  if new.status is distinct from old.status then
    insert into public.consultation_events(consultation_id, kind, from_value, to_value, actor_id, actor_email)
    values (new.id, 'status', old.status, new.status, auth.uid(), v_email);
  end if;
  if new.starts_at is distinct from old.starts_at then
    insert into public.consultation_events(consultation_id, kind, from_value, to_value, actor_id, actor_email)
    values (new.id, 'reschedule', old.starts_at::text, new.starts_at::text, auth.uid(), v_email);
  end if;
  if new.assigned_member_id is distinct from old.assigned_member_id then
    select name into v_old_member from public.cms_team where id = old.assigned_member_id;
    select name into v_new_member from public.cms_team where id = new.assigned_member_id;
    insert into public.consultation_events(consultation_id, kind, from_value, to_value, actor_id, actor_email)
    values (new.id, 'assign', v_old_member, v_new_member, auth.uid(), v_email);
  end if;
  return null;
end;
$$;
create trigger consultations_after_update after update on public.consultations for each row execute function public.consultation_after_update();

-- Notes are stamped with the real caller; the client cannot spoof the author.
create function public.consultation_event_stamp() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if auth.uid() is not null then
    new.actor_id = auth.uid();
    new.actor_email = nullif(auth.jwt() ->> 'email', '');
  end if;
  return new;
end;
$$;
create trigger consultation_events_stamp before insert on public.consultation_events for each row execute function public.consultation_event_stamp();

create function public.consultation_settings_touch() returns trigger language plpgsql security invoker set search_path='' as $$
begin new.updated_at = clock_timestamp(); return new; end;
$$;
create trigger consultation_settings_touch before update on public.consultation_settings for each row execute function public.consultation_settings_touch();

revoke all on function public.consultation_before_update(), public.consultation_after_update(), public.consultation_event_stamp(), public.consultation_settings_touch() from public, anon, authenticated;

-- ---------------------------------------------------------------- row level security
alter table public.consultation_settings enable row level security;
alter table public.consultation_blocked_dates enable row level security;
alter table public.consultations enable row level security;
alter table public.consultation_documents enable row level security;
alter table public.consultation_events enable row level security;

revoke all on public.consultation_settings, public.consultation_blocked_dates, public.consultations, public.consultation_documents, public.consultation_events from anon, authenticated;
grant select on public.consultations, public.consultation_documents, public.consultation_events, public.consultation_settings, public.consultation_blocked_dates to authenticated;
grant update (status, starts_at, duration_minutes, assigned_member_id) on public.consultations to authenticated;
grant update (working_days, start_time, end_time, slot_minutes, min_notice_hours, max_advance_days) on public.consultation_settings to authenticated;
grant insert (blocked_on, reason), delete on public.consultation_blocked_dates to authenticated;
grant insert (consultation_id, kind, note) on public.consultation_events to authenticated;
grant all on public.consultation_settings, public.consultation_blocked_dates, public.consultations, public.consultation_documents, public.consultation_events to service_role;

create policy consultations_admin_read on public.consultations for select to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy consultations_admin_update on public.consultations for update to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled)) with check (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy consultation_documents_admin_read on public.consultation_documents for select to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy consultation_events_admin_read on public.consultation_events for select to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy consultation_events_admin_note on public.consultation_events for insert to authenticated with check (kind='note' and exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy consultation_settings_admin_read on public.consultation_settings for select to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy consultation_settings_admin_update on public.consultation_settings for update to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled)) with check (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy consultation_blocked_admin_read on public.consultation_blocked_dates for select to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy consultation_blocked_admin_insert on public.consultation_blocked_dates for insert to authenticated with check (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy consultation_blocked_admin_delete on public.consultation_blocked_dates for delete to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));

-- ---------------------------------------------------------------- public functions (anon key)
-- Single source of truth for which slots can be booked. Qatar has no DST: UTC+3 all year.
create function public.consultation_open_slots(p_from date, p_to date)
returns table (slot_start timestamptz, slot_end timestamptz, slot_date date, slot_time text)
language plpgsql stable security definer set search_path='' as $$
declare
  s public.consultation_settings%rowtype;
  v_today date := (now() at time zone 'Asia/Qatar')::date;
  v_from date;
  v_to date;
  v_earliest timestamptz;
begin
  select * into s from public.consultation_settings where id;
  if not found then return; end if;
  v_earliest := now() + s.min_notice_hours * interval '1 hour';
  v_from := greatest(p_from, v_today);
  v_to := least(p_to, v_today + s.max_advance_days, v_from + 92);
  if v_to < v_from then return; end if;
  return query
    select slot.at_ts, slot.at_ts + s.slot_minutes * interval '1 minute', d.day::date, to_char(g.local_ts, 'HH24:MI')
    from generate_series(v_from::timestamp, v_to::timestamp, interval '1 day') as d(day)
    cross join lateral generate_series(d.day + s.start_time, d.day + s.end_time - s.slot_minutes * interval '1 minute', s.slot_minutes * interval '1 minute') as g(local_ts)
    cross join lateral (select g.local_ts at time zone 'Asia/Qatar' as at_ts) as slot
    where extract(dow from d.day)::smallint = any (s.working_days)
      and not exists (select 1 from public.consultation_blocked_dates b where b.blocked_on = d.day::date)
      and slot.at_ts >= v_earliest
      and not exists (
        select 1 from public.consultations c
        where c.status in ('new','pending_confirmation','confirmed')
          and tstzrange(c.starts_at, c.ends_at) && tstzrange(slot.at_ts, slot.at_ts + s.slot_minutes * interval '1 minute')
      )
    order by slot.at_ts;
end;
$$;

create function public.consultation_public_settings()
returns table (slot_minutes smallint, min_notice_hours smallint, max_advance_days smallint, today date)
language sql stable security definer set search_path='' as $$
  select s.slot_minutes, s.min_notice_hours, s.max_advance_days, (now() at time zone 'Asia/Qatar')::date
  from public.consultation_settings s where s.id;
$$;

create function public.create_consultation(
  p_service_slug text, p_method text, p_name text, p_phone text, p_email text, p_company text,
  p_language text, p_subject text, p_description text, p_starts_at timestamptz, p_ip_hash text
) returns table (out_id uuid, out_reference text, out_starts_at timestamptz, out_ends_at timestamptz)
language plpgsql security definer set search_path='' as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_slot record;
  v_ref text;
  v_id uuid;
  v_attempt int := 0;
  v_minutes smallint;
begin
  if p_service_slug !~ '^[a-z0-9][a-z0-9-]{1,59}$'
     or p_method not in ('office','video','phone')
     or length(coalesce(p_name,'')) not between 3 and 120
     or length(coalesce(p_phone,'')) not between 7 and 24
     or length(coalesce(p_email,'')) not between 5 and 254 or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
     or length(coalesce(p_company,'')) > 150
     or p_language not in ('ar','en')
     or length(coalesce(p_subject,'')) not between 5 and 150
     or length(coalesce(p_description,'')) not between 20 and 4000 then
    raise exception 'invalid_request' using errcode = 'CS422';
  end if;

  -- Abuse limits: per network (hashed) and per client contact.
  if p_ip_hash is not null and (select count(*) from public.consultations c where c.client_ip_hash = p_ip_hash and c.created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited' using errcode = 'CS429';
  end if;
  if (select count(*) from public.consultations c where (lower(c.client_email) = lower(p_email) or c.client_phone = p_phone) and c.status in ('new','pending_confirmation','confirmed') and c.starts_at > now()) >= 3 then
    raise exception 'rate_limited' using errcode = 'CS429';
  end if;

  -- The server decides what is bookable; the client only chooses among open slots.
  select * into v_slot from public.consultation_open_slots((p_starts_at at time zone 'Asia/Qatar')::date, (p_starts_at at time zone 'Asia/Qatar')::date) o where o.slot_start = p_starts_at;
  if not found then raise exception 'slot_unavailable' using errcode = 'CS409'; end if;
  v_minutes := round(extract(epoch from (v_slot.slot_end - v_slot.slot_start)) / 60)::smallint;

  loop
    v_attempt := v_attempt + 1;
    v_ref := 'MEP-' || to_char(now() at time zone 'Asia/Qatar', 'YYMMDD') || '-';
    for i in 1..5 loop v_ref := v_ref || substr(v_alphabet, 1 + floor(random() * 32)::int, 1); end loop;
    begin
      insert into public.consultations(reference_number, service_slug, consultation_method, client_name, client_phone, client_email, client_company, preferred_language, subject, description, starts_at, ends_at, duration_minutes, client_ip_hash)
      values (v_ref, p_service_slug, p_method, p_name, p_phone, lower(p_email), nullif(p_company,''), p_language, p_subject, p_description, v_slot.slot_start, v_slot.slot_end, v_minutes, p_ip_hash)
      returning id into v_id;
      exit;
    exception
      when exclusion_violation then raise exception 'slot_unavailable' using errcode = 'CS409';
      when unique_violation then if v_attempt >= 6 then raise; end if;
    end;
  end loop;

  insert into public.consultation_events(consultation_id, kind, to_value) values (v_id, 'created', 'new');
  return query select v_id, v_ref, v_slot.slot_start, v_slot.slot_end;
end;
$$;

-- Uploaded files are private. A client may only add up to 3 files to a request it just created
-- (the random consultation UUID is the capability), within 30 minutes of creating it.
create function public.consultation_can_receive_upload(p_name text) returns boolean
language plpgsql stable security definer set search_path='' as $$
declare v_id uuid;
begin
  if p_name !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|png)$' then return false; end if;
  v_id := split_part(p_name, '/', 1)::uuid;
  return exists(select 1 from public.consultations c where c.id = v_id and c.created_at > now() - interval '30 minutes')
     and (select count(*) from storage.objects o where o.bucket_id = 'consultation-documents' and o.name like v_id::text || '/%') < 3;
end;
$$;

create function public.attach_consultation_document(p_consultation uuid, p_path text, p_name text, p_mime text, p_size bigint)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
  if not exists(select 1 from public.consultations c where c.id = p_consultation and c.created_at > now() - interval '30 minutes') then
    raise exception 'invalid_request' using errcode = 'CS422';
  end if;
  if p_path !~ ('^' || p_consultation::text || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|png)$')
     or p_mime not in ('application/pdf','image/jpeg','image/png')
     or p_size not between 1 and 10485760
     or length(coalesce(p_name,'')) not between 1 and 200
     or (select count(*) from public.consultation_documents d where d.consultation_id = p_consultation) >= 3 then
    raise exception 'invalid_request' using errcode = 'CS422';
  end if;
  insert into public.consultation_documents(consultation_id, storage_path, original_name, mime_type, size_bytes)
  values (p_consultation, p_path, p_name, p_mime, p_size) returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.consultation_open_slots(date, date), public.consultation_public_settings(),
  public.create_consultation(text,text,text,text,text,text,text,text,text,timestamptz,text),
  public.consultation_can_receive_upload(text), public.attach_consultation_document(uuid,text,text,text,bigint) from public;
grant execute on function public.consultation_open_slots(date, date), public.consultation_public_settings(),
  public.create_consultation(text,text,text,text,text,text,text,text,text,timestamptz,text),
  public.consultation_can_receive_upload(text), public.attach_consultation_document(uuid,text,text,text,bigint) to anon, authenticated, service_role;

-- ---------------------------------------------------------------- private document storage
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('consultation-documents', 'consultation-documents', false, 10485760, array['application/pdf','image/jpeg','image/png']);
-- Visitors may only add objects (never list, read, overwrite or delete). Staff read through the admin API.
create policy consultation_docs_client_upload on storage.objects for insert to anon
  with check (bucket_id = 'consultation-documents' and public.consultation_can_receive_upload(name));
create policy consultation_docs_admin_read on storage.objects for select to authenticated
  using (bucket_id = 'consultation-documents' and exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));

notify pgrst, 'reload schema';
commit;
