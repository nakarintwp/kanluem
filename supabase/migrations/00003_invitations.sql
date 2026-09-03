-- Phase 03: family_invitations + join_family RPC
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
  exists (select 1 from family_members fm where fm.family_id = family_invitations.family_id and fm.user_id = auth.uid())
);

-- หมายเหตุ: ต้องเทียบ family_id กับ family_invitations.family_id (policy table) แบบมี qualifier
-- เพราะใน subquery ชื่อ family_id ที่ไม่มี qualifier จะชี้ไปที่ family_members.family_id
drop policy if exists "invite owner create" on family_invitations;
create policy "invite owner create" on family_invitations for insert with check (
  exists (select 1 from family_members fm where fm.family_id = family_invitations.family_id and fm.user_id = auth.uid() and fm.role in ('owner','admin'))
);

drop policy if exists "invite owner update" on family_invitations;
create policy "invite owner update" on family_invitations for update using (
  exists (select 1 from family_members fm where fm.family_id = family_invitations.family_id and fm.user_id = auth.uid() and fm.role in ('owner','admin'))
);

-- เข้าร่วมครอบครัวด้วย Invite Code
-- security definer: คนที่ยังไม่ใช่สมาชิกต้องอ่าน invitation ได้ และต้องบังคับว่ามี code จริง
-- ตรวจสอบ + insert + นับจำนวนใช้ ภายใน transaction เดียว (row lock ป้องกัน race)
create or replace function public.join_family(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inv family_invitations%rowtype;
begin
  select * into inv
  from family_invitations
  where code = upper(trim(invite_code))
  for update;

  if not found then
    raise exception 'ไม่พบรหัสเชิญ';
  end if;
  if inv.status <> 'active' then
    raise exception 'รหัสเชิญถูกยกเลิกหรือใช้แล้ว';
  end if;
  if inv.expires_at is not null and inv.expires_at < now() then
    raise exception 'รหัสเชิญหมดอายุแล้ว';
  end if;
  if inv.max_uses is not null and inv.used_count >= inv.max_uses then
    raise exception 'รหัสเชิญครบจำนวนครั้งแล้ว';
  end if;
  if exists (select 1 from family_members fm where fm.family_id = inv.family_id and fm.user_id = auth.uid()) then
    raise exception 'คุณเป็นสมาชิกครอบครัวนี้อยู่แล้ว';
  end if;

  insert into family_members (family_id, user_id, role)
  values (inv.family_id, auth.uid(), 'member');

  update family_invitations
  set used_count = used_count + 1
  where id = inv.id;

  return inv.family_id;
end;
$$;

create index if not exists idx_invitations_code on family_invitations(code);
create index if not exists idx_invitations_family on family_invitations(family_id);