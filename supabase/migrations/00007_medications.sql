-- Phase 09: medications + medication_schedules + medication_logs
create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  created_by uuid references profiles(id),
  name text not null,
  dosage text not null,
  amount_remaining int,
  unit text,
  frequency text default 'daily',
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

create table if not exists medication_schedules (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid references medications(id) on delete cascade,
  family_id uuid references families(id) on delete cascade,
  time time not null,
  days int[] default '{0,1,2,3,4,5,6}',
  created_at timestamptz default now()
);

create table if not exists medication_logs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid references medications(id) on delete cascade,
  family_id uuid references families(id) on delete cascade,
  taken_at timestamptz default now(),
  status text check (status in ('taken','skipped','missed')) default 'taken',
  created_at timestamptz default now()
);

alter table medications enable row level security;
alter table medication_schedules enable row level security;
alter table medication_logs enable row level security;

drop policy if exists "medications family access" on medications;
create policy "medications family access" on medications for all using (
  exists (select 1 from family_members where family_members.family_id = medications.family_id and family_members.user_id = auth.uid())
);
drop policy if exists "med schedules family access" on medication_schedules;
create policy "med schedules family access" on medication_schedules for all using (
  exists (select 1 from family_members where family_members.family_id = medication_schedules.family_id and family_members.user_id = auth.uid())
);
drop policy if exists "med logs family access" on medication_logs;
create policy "med logs family access" on medication_logs for all using (
  exists (select 1 from family_members where family_members.family_id = medication_logs.family_id and family_members.user_id = auth.uid())
);

create index if not exists idx_medications_family on medications(family_id);
create index if not exists idx_med_schedules_med on medication_schedules(medication_id);
