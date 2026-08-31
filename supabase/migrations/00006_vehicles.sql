-- Phase 08: vehicles + vehicle_services
create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade,
  created_by uuid references profiles(id),
  brand text not null,
  model text not null,
  registration text not null,
  year int,
  vin text,
  current_mileage int,
  insurance_expiry date,
  tax_expiry date,
  created_at timestamptz default now()
);

create table if not exists vehicle_services (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references vehicles(id) on delete cascade,
  family_id uuid references families(id) on delete cascade,
  service_type text not null,
  mileage int,
  service_date date not null,
  cost numeric,
  notes text,
  created_at timestamptz default now()
);

alter table vehicles enable row level security;
alter table vehicle_services enable row level security;

drop policy if exists "vehicles family access" on vehicles;
create policy "vehicles family access" on vehicles for all using (
  exists (select 1 from family_members where family_members.family_id = vehicles.family_id and family_members.user_id = auth.uid())
);
drop policy if exists "vehicles family insert" on vehicles;
create policy "vehicles family insert" on vehicles for insert with check (
  exists (select 1 from family_members where family_members.family_id = vehicles.family_id and family_members.user_id = auth.uid())
);

drop policy if exists "vehicle_services family access" on vehicle_services;
create policy "vehicle_services family access" on vehicle_services for all using (
  exists (select 1 from family_members where family_members.family_id = vehicle_services.family_id and family_members.user_id = auth.uid())
);

create index if not exists idx_vehicles_family on vehicles(family_id);
create index if not exists idx_vehicle_services_vehicle on vehicle_services(vehicle_id);
