-- Phase 21: audit_logs
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  user_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

alter table audit_logs enable row level security;

drop policy if exists "audit_logs family access" on audit_logs;
create policy "audit_logs family access" on audit_logs for select using (
  exists (select 1 from family_members where family_members.family_id = audit_logs.family_id and family_members.user_id = auth.uid())
);

create index if not exists idx_audit_logs_family on audit_logs(family_id);
create index if not exists idx_audit_logs_created on audit_logs(created_at);
