-- Phase 01: profiles + trigger handle_new_user
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles self read" on profiles;
create policy "profiles self read" on profiles for select using (auth.uid() = id);

drop policy if exists "profiles self update" on profiles;
create policy "profiles self update" on profiles for update using (auth.uid() = id);

drop policy if exists "profiles self insert" on profiles;
create policy "profiles self insert" on profiles for insert with check (auth.uid() = id);

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
