-- Green Torque Hybrid & EV Repair
-- Run this in the Supabase SQL editor when you connect a live backend.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'technician', 'advisor', 'admin');
create type public.ev_type as enum ('ev', 'hybrid', 'ice');
create type public.appointment_status as enum ('requested', 'confirmed', 'checked_in', 'cancelled', 'completed');
create type public.repair_status as enum ('checked_in', 'diagnosis', 'in_progress', 'inspection', 'ready', 'picked_up', 'cancelled');
create type public.estimate_status as enum ('draft', 'sent', 'approved', 'declined', 'expired');
create type public.media_kind as enum ('photo', 'video_clip', 'diagnostic_report', 'live_session');
create type public.video_kind as enum ('live', 'recorded_clip');

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  timezone text not null default 'America/Los_Angeles',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  shop_id uuid references public.shops (id),
  full_name text not null,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  vin text,
  year int not null,
  make text not null,
  model text not null,
  trim text,
  mileage int not null default 0,
  nickname text,
  ev_type public.ev_type not null default 'ev',
  photo_url text,
  created_at timestamptz not null default now()
);

create table public.vehicle_ev_data (
  vehicle_id uuid primary key references public.vehicles (id) on delete cascade,
  hv_battery_health_pct numeric,
  hv_battery_notes text,
  twelve_v_status text,
  last_diagnostic_at timestamptz
);

create table public.service_types (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops (id) on delete cascade,
  name text not null,
  category text,
  estimated_duration_min int,
  description text
);

create table public.work_bays (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  name text not null
);

create table public.cameras (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  name text not null,
  provider text,
  provider_stream_id text,
  is_active boolean not null default true
);

alter table public.work_bays
  add column camera_id uuid references public.cameras (id);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  service_type_id uuid references public.service_types (id),
  scheduled_at timestamptz not null,
  status public.appointment_status not null default 'requested',
  notes text,
  created_at timestamptz not null default now()
);

create table public.repair_orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  appointment_id uuid references public.appointments (id),
  vehicle_id uuid not null references public.vehicles (id),
  customer_id uuid not null references public.profiles (id),
  assigned_technician_id uuid references public.profiles (id),
  bay_id uuid references public.work_bays (id),
  camera_id uuid references public.cameras (id),
  status public.repair_status not null default 'checked_in',
  service_summary text,
  opened_at timestamptz not null default now(),
  ready_at timestamptz,
  picked_up_at timestamptz
);

create table public.repair_services (
  id uuid primary key default gen_random_uuid(),
  repair_order_id uuid not null references public.repair_orders (id) on delete cascade,
  description text not null,
  labor_hours numeric,
  labor_rate numeric
);

create table public.parts (
  id uuid primary key default gen_random_uuid(),
  repair_order_id uuid not null references public.repair_orders (id) on delete cascade,
  name text not null,
  part_number text,
  qty numeric not null default 1,
  unit_cost numeric
);

create table public.technician_notes (
  id uuid primary key default gen_random_uuid(),
  repair_order_id uuid not null references public.repair_orders (id) on delete cascade,
  author_id uuid references public.profiles (id),
  body text not null,
  visible_to_customer boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  repair_order_id uuid not null references public.repair_orders (id) on delete cascade,
  uploaded_by uuid references public.profiles (id),
  kind public.media_kind not null,
  storage_path text,
  caption text,
  visible_to_customer boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.estimates (
  id uuid primary key default gen_random_uuid(),
  repair_order_id uuid not null references public.repair_orders (id) on delete cascade,
  amount numeric not null,
  status public.estimate_status not null default 'draft',
  sent_at timestamptz,
  responded_at timestamptz,
  customer_message text
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  repair_order_id uuid not null references public.repair_orders (id) on delete cascade,
  estimate_id uuid references public.estimates (id),
  amount numeric not null,
  status text not null default 'draft',
  paid_at timestamptz
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  shop_id uuid references public.shops (id),
  repair_order_id uuid references public.repair_orders (id),
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  body text not null,
  media_id uuid references public.media (id),
  created_at timestamptz not null default now()
);

create table public.video_sessions (
  id uuid primary key default gen_random_uuid(),
  repair_order_id uuid not null references public.repair_orders (id) on delete cascade,
  camera_id uuid references public.cameras (id),
  bay_id uuid references public.work_bays (id),
  kind public.video_kind not null,
  allowed_customer_id uuid not null references public.profiles (id),
  access_starts_at timestamptz not null default now(),
  access_expires_at timestamptz not null
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_ev_data enable row level security;
alter table public.appointments enable row level security;
alter table public.repair_orders enable row level security;
alter table public.repair_services enable row level security;
alter table public.parts enable row level security;
alter table public.technician_notes enable row level security;
alter table public.media enable row level security;
alter table public.estimates enable row level security;
alter table public.invoices enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.video_sessions enable row level security;
alter table public.notifications enable row level security;
alter table public.service_types enable row level security;
alter table public.shops enable row level security;
alter table public.work_bays enable row level security;
alter table public.cameras enable row level security;

create policy "profiles are self readable" on public.profiles
  for select using (id = auth.uid() or role in ('technician', 'advisor', 'admin'));

create policy "customers update own profile" on public.profiles
  for update using (id = auth.uid());

create policy "customers insert own profile" on public.profiles
  for insert with check (id = auth.uid());

create policy "customers own vehicles" on public.vehicles
  for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());

create policy "customers own appointments" on public.appointments
  for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());

create policy "customers read own repair orders" on public.repair_orders
  for select using (customer_id = auth.uid());

create policy "customers read visible notes" on public.technician_notes
  for select using (
    visible_to_customer = true
    and exists (
      select 1 from public.repair_orders ro
      where ro.id = repair_order_id and ro.customer_id = auth.uid()
    )
  );

create policy "customers read visible media" on public.media
  for select using (
    visible_to_customer = true
    and exists (
      select 1 from public.repair_orders ro
      where ro.id = repair_order_id and ro.customer_id = auth.uid()
    )
  );

create policy "customers manage estimates" on public.estimates
  for select using (
    exists (
      select 1 from public.repair_orders ro
      where ro.id = repair_order_id and ro.customer_id = auth.uid()
    )
  );

create policy "customers update estimate response" on public.estimates
  for update using (
    exists (
      select 1 from public.repair_orders ro
      where ro.id = repair_order_id and ro.customer_id = auth.uid()
    )
  );

create policy "customers read own invoices" on public.invoices
  for select using (
    exists (
      select 1 from public.repair_orders ro
      where ro.id = repair_order_id and ro.customer_id = auth.uid()
    )
  );

create policy "customers own conversations" on public.conversations
  for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());

create policy "customers read conversation messages" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.customer_id = auth.uid()
    )
  );

create policy "customers send messages" on public.messages
  for insert with check (sender_id = auth.uid());

create policy "customers read own notifications" on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "customers read authorized video sessions" on public.video_sessions
  for select using (
    allowed_customer_id = auth.uid()
    and now() between access_starts_at and access_expires_at
  );

create policy "anyone authenticated can read service types" on public.service_types
  for select using (auth.role() = 'authenticated');

create policy "anyone authenticated can read shop" on public.shops
  for select using (auth.role() = 'authenticated');

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Customer'),
    new.raw_user_meta_data->>'phone',
    'customer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
