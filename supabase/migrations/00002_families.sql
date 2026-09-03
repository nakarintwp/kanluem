-- Phase 02: families + family_members + RLS
--
-- หมายเหตุสำคัญ:
-- policy บนตารางใดห้าม SELECT ตารางนั้นเองโดยตรง (จะทำให้ infinite recursion)
-- ดังนั้นจึงใช้ helper function แบบ security definer สำหรับตรวจ membership แทน

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

-- helpers: เรียกจาก policy ได้โดยไม่เกิด recursion (security definer ข้าม RLS ภายใน)
create or replace function public.is_family_member(fid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from family_members fm
    where fm.family_id = fid and fm.user_id = auth.uid()
  );
$$;

-- อนุญาตให้ insert family_members ได้เมื่อ:
--   - ผู้สร้างครอบครัวเพิ่มตัวเองเป็น owner คนแรก (ยังไม่มีสมาชิก), หรือ
--   - ผู้ใช้ที่อยู่ในครอบครัวนั้นแล้วในฐานะ owner/admin เพิ่มสมาชิก (จัดการสมาชิก)
create or replace function public.can_insert_family_member(fid uuid, new_user_id uuid, new_role text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    (new_user_id = auth.uid() and new_role = 'owner' and not exists (
      select 1 from family_members fm where fm.family_id = fid
    ))
    or
    exists (
      select 1 from family_members fm
      where fm.family_id = fid and fm.user_id = auth.uid() and fm.role in ('owner','admin')
    );
$$;

alter table families enable row level security;
alter table family_members enable row level security;

-- creator มองเห็นครอบครัวที่เพิ่งสร้าง (จำเป็น: INSERT...RETURNING ในหน้า family ต้องผ่าน SELECT policy ด้วย)
drop policy if exists "families member read" on families;
create policy "families member read" on families for select using (
  is_family_member(id) or auth.uid() = created_by
);

drop policy if exists "families owner insert" on families;
create policy "families owner insert" on families for insert with check (auth.uid() = created_by);

drop policy if exists "families owner update" on families;
create policy "families owner update" on families for update using (
  exists (select 1 from family_members fm where fm.family_id = families.id and fm.user_id = auth.uid() and fm.role = 'owner')
);
drop policy if exists "families owner delete" on families;
create policy "families owner delete" on families for delete using (
  exists (select 1 from family_members fm where fm.family_id = families.id and fm.user_id = auth.uid() and fm.role = 'owner')
);

-- สมาชิกอ่านสมาชิกทุกคนในครอบครัวตัวเองได้ (ใช้ตอน assignee dropdown / หน้า family)
drop policy if exists "family_members self read" on family_members;
create policy "family_members self read" on family_members for select using (
  auth.uid() = user_id or is_family_member(family_id)
);

-- ห้ามแทรกสมาชิกตามอำเภอใจ: ต้องเป็นคนแรกของครอบครัว หรือเป็น owner/admin ของครอบครัวนั้น
-- (การเข้าร่วมด้วย Invite Code ใช้ฟังก์ชัน join_family() ใน 00003 แทน)
drop policy if exists "family_members owner insert" on family_members;
drop policy if exists "family_members insert" on family_members;
create policy "family_members insert" on family_members for insert with check (
  can_insert_family_member(family_id, user_id, role)
);

-- สมาชิกในครอบครัวเดียวกันเห็น profile กันได้
drop policy if exists "profiles family read" on profiles;
create policy "profiles family read" on profiles for select using (
  auth.uid() = id
  or exists (
    select 1 from family_members fm
    where fm.user_id = profiles.id and is_family_member(fm.family_id)
  )
);