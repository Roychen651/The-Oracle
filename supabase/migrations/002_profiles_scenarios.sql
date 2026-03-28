-- Profiles table
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  avatar_url text,
  avatar_type text default 'google' check (avatar_type in ('google', 'preset', 'upload')),
  avatar_preset_id text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users own their profile" on public.profiles
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Scenarios table
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  params jsonb not null default '{}',
  is_active boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.scenarios enable row level security;

create policy "Users own their scenarios" on public.scenarios
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Ensure only one active scenario per user
create unique index if not exists scenarios_active_user_idx
  on public.scenarios (user_id) where (is_active = true);
