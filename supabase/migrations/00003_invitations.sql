-- Phase 03: family_invitations
create table if not exists family_invitations (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  code text unique not null,
  created_by uuid references profiles(id),
  expires_at timestamptz,
  max_uses int,
  used_count int default 0,
  status text check (status in ('active','used','expired','revoked')) default 'active',
  created_at timestamptz default now()
);

alter table family_invitations enable row level security;

drop policy if exists "invite member read" on family_invitations;
create policy "invite member read" on family_invitations for select using (
  exists (select 1 from family_members where family_members.family_id = family_invitations.family_id and family_members.user_id = auth.uid())
);

drop policy if exists "invite owner create" on family_invitations;
create policy "invite owner create" on family_invitations for insert with check (
  exists (select 1 from family_members where family_members.family_id = family_id and family_members.user_id = auth.uid() and role in ('owner','admin'))
);

drop policy if exists "invite owner update" on family_invitations;
create policy "invite owner update" on family_invitations for update using (
  exists (select 1 from family_members where family_members.family_id = family_invitations.family_id and family_members.user_id = auth.uid() and role in ('owner','admin'))
);

create index if not exists idx_invitations_code on family_invitations(code);
create index if not exists idx_invitations_family on family_invitations(family_id);
