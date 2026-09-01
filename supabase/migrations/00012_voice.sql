-- Phase 15: voice_inputs + ai_extractions
create table if not exists voice_inputs (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  user_id uuid references profiles(id),
  audio_path text,
  transcript text,
  created_at timestamptz default now()
);

create table if not exists ai_extractions (
  id uuid primary key default gen_random_uuid(),
  voice_input_id uuid references voice_inputs(id) on delete cascade,
  family_id uuid references families(id) on delete cascade,
  intent text,
  extracted jsonb,
  created_at timestamptz default now()
);

alter table voice_inputs enable row level security;
alter table ai_extractions enable row level security;

drop policy if exists "voice_inputs family access" on voice_inputs;
create policy "voice_inputs family access" on voice_inputs for all using (
  exists (select 1 from family_members where family_members.family_id = voice_inputs.family_id and family_members.user_id = auth.uid())
);
drop policy if exists "ai_extractions family access" on ai_extractions;
create policy "ai_extractions family access" on ai_extractions for all using (
  exists (select 1 from family_members where family_members.family_id = ai_extractions.family_id and family_members.user_id = auth.uid())
);
