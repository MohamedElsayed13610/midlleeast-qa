-- Semi-automatic WhatsApp workflow (wa.me deep links only, no WhatsApp API):
--   1. internal, admin-only WhatsApp number per team member (NEVER on cms_team, which anonymous visitors can read)
--   2. temporary, revocable, hashed share links for a consultation's private documents
-- Apply ONCE after 001_online_consultations.sql, as postgres.
begin;

-- ---------------------------------------------------------------- internal lawyer WhatsApp number
-- cms_team is publicly readable and the public site selects every column, so the number lives in its own table.
-- Digits only, international format without "+" (Qatar: 974XXXXXXXX). No row = no number.
create table public.cms_team_private (
  member_id uuid primary key references public.cms_team(id) on delete cascade,
  internal_whatsapp_phone text not null check (internal_whatsapp_phone ~ '^[1-9][0-9]{7,14}$'),
  updated_at timestamptz not null default now()
);
alter table public.cms_team_private enable row level security;
revoke all on public.cms_team_private from anon, authenticated;
grant select, insert, update, delete on public.cms_team_private to authenticated;
grant all on public.cms_team_private to service_role;
create policy cms_team_private_admin_read on public.cms_team_private for select to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy cms_team_private_admin_insert on public.cms_team_private for insert to authenticated with check (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy cms_team_private_admin_update on public.cms_team_private for update to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled)) with check (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy cms_team_private_admin_delete on public.cms_team_private for delete to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create function public.cms_team_private_touch() returns trigger language plpgsql security invoker set search_path='' as $$
begin new.updated_at = clock_timestamp(); return new; end;
$$;
revoke all on function public.cms_team_private_touch() from public, anon, authenticated;
create trigger cms_team_private_touch before update on public.cms_team_private for each row execute function public.cms_team_private_touch();

-- ---------------------------------------------------------------- document share links
-- Only the SHA-256 hash of the link token is stored. The plain token exists once, in the admin's WhatsApp message.
create table public.consultation_document_shares (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid not null references public.consultations(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  revoked_at timestamptz,
  assigned_member_id uuid references public.cms_team(id) on delete set null,
  check (expires_at > created_at)
);
create index consultation_document_shares_active_idx on public.consultation_document_shares(consultation_id) where revoked_at is null;
alter table public.consultation_document_shares enable row level security;
revoke all on public.consultation_document_shares from anon, authenticated;
grant select on public.consultation_document_shares to authenticated; -- audit only; rows are written by the functions below
grant all on public.consultation_document_shares to service_role;
create policy consultation_shares_admin_read on public.consultation_document_shares for select to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));

-- Audit trail: two new event kinds. Message bodies are never stored.
alter table public.consultation_events drop constraint consultation_events_kind_check;
alter table public.consultation_events add constraint consultation_events_kind_check check (kind in ('created','status','reschedule','assign','note','share_link','whatsapp'));

-- Revoke links automatically when the lawyer changes or the request closes.
create or replace function public.consultation_after_update() returns trigger language plpgsql security definer set search_path='' as $$
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
  if new.assigned_member_id is distinct from old.assigned_member_id or (new.status is distinct from old.status and new.status in ('completed','cancelled')) then
    update public.consultation_document_shares set revoked_at = now() where consultation_id = new.id and revoked_at is null;
  end if;
  return null;
end;
$$;

-- Admin-only: create a fresh 24h link for a lawyer and revoke every earlier active link of that consultation.
create function public.issue_consultation_share(p_consultation uuid, p_token_hash text, p_member uuid)
returns timestamptz language plpgsql security definer set search_path='' as $$
declare v_expires timestamptz := now() + interval '24 hours';
begin
  if not exists(select 1 from public.cms_admins where user_id = auth.uid() and enabled) then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_token_hash !~ '^[0-9a-f]{64}$' then raise exception 'invalid_request' using errcode = 'CS422'; end if;
  if not exists(select 1 from public.consultations c where c.id = p_consultation and c.status in ('new','pending_confirmation','confirmed'))
     or not exists(select 1 from public.consultation_documents d where d.consultation_id = p_consultation) then
    raise exception 'invalid_request' using errcode = 'CS422';
  end if;
  update public.consultation_document_shares set revoked_at = now() where consultation_id = p_consultation and revoked_at is null;
  insert into public.consultation_document_shares(consultation_id, token_hash, expires_at, created_by, assigned_member_id)
  values (p_consultation, p_token_hash, v_expires, auth.uid(), p_member);
  insert into public.consultation_events(consultation_id, kind, to_value, actor_id, actor_email)
  values (p_consultation, 'share_link', 'مدة الصلاحية 24 ساعة', auth.uid(), nullif(auth.jwt() ->> 'email', ''));
  return v_expires;
end;
$$;

-- Admin-only audit marker ("WhatsApp message prepared for lawyer/client"); never stores the message text.
create function public.log_consultation_whatsapp(p_consultation uuid, p_target text)
returns void language plpgsql security definer set search_path='' as $$
begin
  if not exists(select 1 from public.cms_admins where user_id = auth.uid() and enabled) then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_target not in ('lawyer','client') or not exists(select 1 from public.consultations c where c.id = p_consultation) then raise exception 'invalid_request' using errcode = 'CS422'; end if;
  insert into public.consultation_events(consultation_id, kind, to_value, actor_id, actor_email)
  values (p_consultation, 'whatsapp', p_target, auth.uid(), nullif(auth.jwt() ->> 'email', ''));
end;
$$;

-- Used by the public share page (server side). A valid, unexpired, unrevoked hash returns that consultation's reference and files only.
create function public.resolve_consultation_share(p_hash text)
returns table (reference_number text, expires_at timestamptz, doc_id uuid, original_name text, mime_type text, size_bytes bigint, storage_path text)
language sql stable security definer set search_path='' as $$
  select c.reference_number, s.expires_at, d.id, d.original_name, d.mime_type, d.size_bytes, d.storage_path
  from public.consultation_document_shares s
  join public.consultations c on c.id = s.consultation_id
  join public.consultation_documents d on d.consultation_id = c.id
  where s.token_hash = p_hash and s.revoked_at is null and s.expires_at > now() and c.status <> 'cancelled'
  order by d.created_at;
$$;

-- Storage: anonymous callers may read an object ONLY when they present the hash of a valid share that covers exactly that file.
create function public.share_allows_object(p_name text) returns boolean language plpgsql stable security definer set search_path='' as $$
declare v_hash text := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json ->> 'x-share-hash';
begin
  if v_hash is null or v_hash !~ '^[0-9a-f]{64}$' then return false; end if;
  return exists(
    select 1 from public.consultation_document_shares s
    join public.consultations c on c.id = s.consultation_id
    join public.consultation_documents d on d.consultation_id = s.consultation_id
    where s.token_hash = v_hash and s.revoked_at is null and s.expires_at > now() and c.status <> 'cancelled' and d.storage_path = p_name);
end;
$$;
create policy consultation_docs_share_read on storage.objects for select to anon
  using (bucket_id = 'consultation-documents' and public.share_allows_object(name));

revoke all on function public.issue_consultation_share(uuid, text, uuid), public.log_consultation_whatsapp(uuid, text), public.resolve_consultation_share(text), public.share_allows_object(text) from public;
grant execute on function public.issue_consultation_share(uuid, text, uuid), public.log_consultation_whatsapp(uuid, text) to authenticated, service_role;
grant execute on function public.resolve_consultation_share(text), public.share_allows_object(text) to anon, authenticated, service_role;

notify pgrst, 'reload schema';
commit;
