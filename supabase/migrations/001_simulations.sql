-- Run this in your Supabase SQL editor to set up the database

create table if not exists public.simulations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  state       jsonb not null default '{}',
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Row Level Security: users can only access their own data
alter table public.simulations enable row level security;

create policy "Users can read own simulation"
  on public.simulations for select
  using (auth.uid() = user_id);

create policy "Users can upsert own simulation"
  on public.simulations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own simulation"
  on public.simulations for update
  using (auth.uid() = user_id);

create policy "Users can delete own simulation"
  on public.simulations for delete
  using (auth.uid() = user_id);
