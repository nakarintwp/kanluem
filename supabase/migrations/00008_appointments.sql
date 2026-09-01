-- Phase 10: appointments
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  created_by uuid references profiles(id),
  title text not null,
  appointment_date date not null,
  appointment_time time,
  location text,
  person text,
  assignee uuid references profiles(id),
  notes text,
  reminder_id uuid references reminders(id) on delete set null,
  created_at timestamptz default now()
);

alter table appointments enable row level security;

drop policy if exists "appointments family access" on appointments;
create policy "appointments family access" on appointments for all using (
  exists (select 1 from family_members where family_members.family_id = appointments.family_id and family_members.user_id = auth.uid())
);
drop policy if exists "appointments family insert" on appointments;
create policy "appointments family insert" on appointments for insert with check (
  exists (select 1 from family_members where family_members.family_id = appointments.family_id and family_members.user_id = auth.uid())
);

create index if not exists idx_appointments_family on appointments(family_id);
create index if not exists idx_appointments_date on appointments(appointment_date);
