-- Phase 12: finance_items
create table if not exists finance_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  created_by uuid references profiles(id),
  title text not null,
  amount numeric not null,
  due_date date,
  category text default 'other' check (category in ('credit','loan','subscription','utility','insurance','other')),
  created_at timestamptz default now()
);

alter table finance_items enable row level security;

drop policy if exists "finance_items family access" on finance_items;
create policy "finance_items family access" on finance_items for all using (
  exists (select 1 from family_members where family_members.family_id = finance_items.family_id and family_members.user_id = auth.uid())
);

create index if not exists idx_finance_items_family on finance_items(family_id);
create index if not exists idx_finance_items_due on finance_items(due_date);
