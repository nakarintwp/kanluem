-- Phase 13: documents (private storage)
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  uploaded_by uuid references profiles(id),
  name text not null,
  category text default 'other' check (category in ('vehicle','medical','insurance','bills','school','personal','other')),
  document_number text,
  storage_path text not null,
  mime_type text,
  file_size int,
  expiry_date date,
  notes text,
  created_at timestamptz default now()
);

alter table documents enable row level security;

drop policy if exists "documents family access" on documents;
create policy "documents family access" on documents for all using (
  exists (select 1 from family_members where family_members.family_id = documents.family_id and family_members.user_id = auth.uid())
);
drop policy if exists "documents family insert" on documents;
create policy "documents family insert" on documents for insert with check (
  exists (select 1 from family_members where family_members.family_id = documents.family_id and family_members.user_id = auth.uid())
);

create index if not exists idx_documents_family on documents(family_id);
create index if not exists idx_documents_category on documents(category);

-- Storage bucket should be private: `documents` bucket with RLS (not public)
-- Policy: storage.objects RLS via supabase storage schema (to be applied via supabase dashboard or additional migration)
-- Note: private bucket enforcement is critical (Blueprint §15)
