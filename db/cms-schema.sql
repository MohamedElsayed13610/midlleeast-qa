-- Initial setup for a dedicated law-office Supabase project. Run as postgres.
begin;
create table public.cms_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.cms_team (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,99}$'),
  name text not null check (length(name) between 3 and 150),
  role text not null check (length(role) between 2 and 200),
  office text not null check (office in ('قطر','الإمارات','لبنان','مصر','إقليمي')),
  category text not null check (length(category) between 2 and 150),
  practice text not null default '' check (length(practice)<=250),
  bio text not null check (length(bio) between 15 and 6000),
  image_url text not null check (length(image_url) between 1 and 1500),
  image_width integer not null check (image_width between 1 and 8000),
  image_height integer not null check (image_height between 1 and 8000),
  featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 100 check (sort_order between 0 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not featured or slug not in ('mohammed-essam-qabawa','omar-saqr')),
  check (not featured or office='قطر')
);
create table public.cms_news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,99}$'),
  title text not null check (length(title) between 5 and 200),
  excerpt text not null check (length(excerpt) between 15 and 500),
  content text not null check (length(content) between 30 and 50000),
  category text not null check (length(category) between 2 and 80),
  author text not null default '' check (length(author)<=150),
  image_url text not null default '' check (length(image_url)<=1500),
  image_alt text not null default '' check (length(image_alt)<=200),
  published_at date,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (image_url='' or length(image_alt)>0)
);
create index cms_team_active_order on public.cms_team(sort_order) where is_active;
create index cms_news_published_date on public.cms_news(published_at desc,created_at desc) where status='published';

create function public.cms_update_revision() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.slug is distinct from old.slug then raise exception 'Content slug is immutable' using errcode='23514'; end if;
  new.updated_at=clock_timestamp();
  return new;
end;
$$;
revoke all on function public.cms_update_revision() from public,anon,authenticated;
create trigger cms_team_revision before update on public.cms_team for each row execute function public.cms_update_revision();
create trigger cms_news_revision before update on public.cms_news for each row execute function public.cms_update_revision();

alter table public.cms_admins enable row level security;
alter table public.cms_team enable row level security;
alter table public.cms_news enable row level security;
-- Grant API access explicitly. Policies below restrict rows and mutations.
revoke all on public.cms_admins,public.cms_team,public.cms_news from anon,authenticated;
grant select on public.cms_team,public.cms_news to anon;
grant select on public.cms_admins to authenticated;
grant select,insert,update,delete on public.cms_team,public.cms_news to authenticated;
grant all on public.cms_admins,public.cms_team,public.cms_news to service_role;
create policy cms_admin_read_self on public.cms_admins for select to authenticated using (user_id=(select auth.uid()));
create policy cms_team_public on public.cms_team for select to anon,authenticated using (is_active);
create policy cms_news_public on public.cms_news for select to anon,authenticated using (status='published');
create policy cms_team_admin_read on public.cms_team for select to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy cms_team_admin_insert on public.cms_team for insert to authenticated with check (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy cms_team_admin_update on public.cms_team for update to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled)) with check (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy cms_team_admin_delete on public.cms_team for delete to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy cms_news_admin_read on public.cms_news for select to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy cms_news_admin_insert on public.cms_news for insert to authenticated with check (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy cms_news_admin_update on public.cms_news for update to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled)) with check (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));
create policy cms_news_admin_delete on public.cms_news for delete to authenticated using (exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled));

-- Public assets contain no secrets; each upload gets an immutable random path.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values ('law-cms','law-cms',true,3145728,array['image/png','image/jpeg','image/webp']);
create policy law_cms_upload on storage.objects for insert to authenticated with check (
  bucket_id='law-cms' and (storage.foldername(name))[1]=(select auth.uid())::text
  and exists(select 1 from public.cms_admins where user_id=(select auth.uid()) and enabled)
);
-- Setup marker prevents later seed runs from restoring deleted public records.
create table public.cms_setup (id boolean primary key default true check(id),seeded_at timestamptz);
alter table public.cms_setup enable row level security;
revoke all on public.cms_setup from anon,authenticated;
grant all on public.cms_setup to service_role;
insert into public.cms_setup(id) values(true);
commit;
