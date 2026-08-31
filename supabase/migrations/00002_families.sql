-- Phase 02: families + family_members + RLS
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text check (role in ('owner','admin','member','viewer')) not null,
  joined_at timestamptz default now(),
  unique(family_id, user_id)
);

alter table families enable row level security;
alter table family_members enable row level security;

drop policy if exists "families member read" on families;
create policy "families member read" on families for select using (
  exists (select 1 from family_members where family_members.family_id = families.id and family_members.user_id = auth.uid())
);

drop policy if exists "families owner insert" on families;
create policy "families owner insert" on families for insert with check (auth.uid() = created_by);

drop policy if exists "families owner update" on families;
create policy "families owner update" on families for update using (
  exists (select 1 from family_members where family_members.family_id = families.id and family_members.user_id = auth.uid() and role = 'owner')
);
drop policy if exists "families owner delete" on families;
create policy "families owner delete" on families for delete using (
  exists (select 1 from family_members where family_members.family_id = families.id and family_members.user_id = auth.uid() and role = 'owner')
);

drop policy if exists "family_members self read" on family_members;
create policy "family_members self read" on family_members for select using (
  exists (select 1 from family_members m where m.family_id = family_members.family_id and m.user_id = auth.uid())
);

drop policy if exists "family_members owner insert" on family_members;
create policy "family_members owner insert" on family_members for insert with check (
  exists (select 1 from family_members where family_members.family_id = family_members.family_id and family_members.user_id = auth.uid() and role in ('owner','admin'))
  or not exists (select 1 from family_members where family_members.family_id = family_members.family_id)
);
