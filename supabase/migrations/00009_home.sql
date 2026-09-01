-- Phase 11: home_items
create table if not exists home_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  created_by uuid references profiles(id),
  title text not null,
  category text default 'other' check (category in ('utility','maintenance','appliance','other')),
  description text,
  created_at timestamptz default now()
);

alter table home_items enable row level security;

drop policy if exists "home_items family access" on home_items;
create policy "home_items family access" on home_items for all using (
  exists (select 1 from family_members where family_members.family_id = home_items.family_id and family_members.user_id = auth.uid())
);

create index if not exists idx_home_items_family on home_items(family_id);
