create table if not exists public.cms_partners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,99}$'),
  name_ar text not null check (char_length(name_ar) between 2 and 200),
  name_en text not null check (char_length(name_en) between 2 and 200),
  country_ar text not null check (char_length(country_ar) between 2 and 120),
  country_en text not null check (char_length(country_en) between 2 and 120),
  description_ar text not null default '' check (char_length(description_ar) <= 1200),
  description_en text not null default '' check (char_length(description_en) <= 1200),
  logo_url text not null check (char_length(logo_url) <= 1500),
  website_url text not null default '' check (char_length(website_url) <= 1500),
  is_active boolean not null default true,
  sort_order integer not null default 100 check (sort_order between 0 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cms_partners enable row level security;

grant select on public.cms_partners to anon;
grant select, insert, update, delete on public.cms_partners to authenticated;
grant select, insert, update, delete on public.cms_partners to service_role;

create policy "cms_partners_public"
on public.cms_partners for select
to anon, authenticated
using (is_active);

create policy "cms_partners_admin_read"
on public.cms_partners for select
to authenticated
using (exists (select 1 from public.cms_admins where cms_admins.user_id = (select auth.uid()) and cms_admins.enabled));

create policy "cms_partners_admin_insert"
on public.cms_partners for insert
to authenticated
with check (exists (select 1 from public.cms_admins where cms_admins.user_id = (select auth.uid()) and cms_admins.enabled));

create policy "cms_partners_admin_update"
on public.cms_partners for update
to authenticated
using (exists (select 1 from public.cms_admins where cms_admins.user_id = (select auth.uid()) and cms_admins.enabled))
with check (exists (select 1 from public.cms_admins where cms_admins.user_id = (select auth.uid()) and cms_admins.enabled));

create policy "cms_partners_admin_delete"
on public.cms_partners for delete
to authenticated
using (exists (select 1 from public.cms_admins where cms_admins.user_id = (select auth.uid()) and cms_admins.enabled));

create trigger cms_partners_revision
before update on public.cms_partners
for each row execute function public.cms_update_revision();
