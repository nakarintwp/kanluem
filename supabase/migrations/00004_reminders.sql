-- Phase 04: reminders + reminder_occurrences
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  created_by uuid references profiles(id),
  assignee uuid references profiles(id),
  title text not null,
  description text,
  category text default 'other' check (category in ('vehicle','medical','appointment','home','finance','other')),
  due_at timestamptz not null,
  timezone text default 'Asia/Bangkok',
  recurrence text,
  reminder_offsets int[] default '{60,1440}',
  priority text check (priority in ('low','medium','high')) default 'medium',
  status text check (status in ('pending','done','snoozed','skipped')) default 'pending',
  visibility text default 'family' check (visibility in ('family','private','specific')),
  linked_entity jsonb,
  created_at timestamptz default now()
);

create table if not exists reminder_occurrences (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid references reminders(id) on delete cascade,
  occurs_at timestamptz not null,
  status text default 'pending' check (status in ('pending','done','snoozed','skipped'))
);

alter table reminders enable row level security;
alter table reminder_occurrences enable row level security;

drop policy if exists "reminders family access" on reminders;
create policy "reminders family access" on reminders for all using (
  exists (select 1 from family_members where family_members.family_id = reminders.family_id and family_members.user_id = auth.uid())
);
drop policy if exists "reminders family insert" on reminders;
create policy "reminders family insert" on reminders for insert with check (
  exists (select 1 from family_members where family_members.family_id = reminders.family_id and family_members.user_id = auth.uid())
);

drop policy if exists "occurrences family access" on reminder_occurrences;
create policy "occurrences family access" on reminder_occurrences for all using (
  exists (select 1 from reminders join family_members on reminders.family_id = family_members.family_id where reminders.id = reminder_occurrences.reminder_id and family_members.user_id = auth.uid())
);

create index if not exists idx_reminders_family on reminders(family_id);
create index if not exists idx_reminders_due on reminders(due_at);
create index if not exists idx_occurrences_reminder on reminder_occurrences(reminder_id);
