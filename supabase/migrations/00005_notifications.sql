-- Phase 07: notifications + notification_preferences
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  reminder_id uuid references reminders(id) on delete set null,
  title text not null,
  body text,
  status text check (status in ('scheduled','sent','delivered','read','failed','snoozed','dismissed')) default 'scheduled',
  channel text check (channel in ('in_app','web_push','line','telegram','email')) default 'in_app',
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade unique,
  in_app_enabled boolean default true,
  web_push_enabled boolean default true,
  line_enabled boolean default false,
  telegram_enabled boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;
alter table notification_preferences enable row level security;

drop policy if exists "notifications family access" on notifications;
create policy "notifications family access" on notifications for all using (
  exists (select 1 from family_members where family_members.family_id = notifications.family_id and family_members.user_id = auth.uid())
  or notifications.user_id = auth.uid()
);

drop policy if exists "notif_prefs self" on notification_preferences;
create policy "notif_prefs self" on notification_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_notifications_family on notifications(family_id);
create index if not exists idx_notifications_user on notifications(user_id);
create index if not exists idx_notifications_status on notifications(status);
