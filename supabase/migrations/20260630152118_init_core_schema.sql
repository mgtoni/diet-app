-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  organisation_id uuid,
  team_id uuid,
  name text,
  date_of_birth date,
  biological_sex text check (biological_sex in ('male', 'female', 'other')),
  height_cm numeric,
  weight_kg numeric,
  waist_cm numeric,
  hip_cm numeric,
  body_fat_pct numeric,
  units text default 'metric',
  locale text default 'en-US',
  timezone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. GOALS
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  organisation_id uuid,
  team_id uuid,
  goal_type text not null,
  pace text,
  target_weight_kg numeric,
  calorie_override numeric,
  protein_override_g numeric,
  fat_override_g numeric,
  carbs_override_g numeric,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. HEALTH CONDITIONS
create table public.health_conditions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  organisation_id uuid,
  team_id uuid,
  condition_name text not null,
  severity text check (severity in ('advisory', 'important', 'critical')),
  diagnosed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. DIETARY PREFERENCES
create table public.dietary_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  organisation_id uuid,
  team_id uuid,
  preference_name text not null,
  if_window_start time,
  if_window_end time,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ALLERGIES
create table public.allergies (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  organisation_id uuid,
  team_id uuid,
  allergen_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ONBOARDING STATE
create table public.onboarding_state (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  organisation_id uuid,
  team_id uuid,
  step_completed integer default 0,
  is_completed boolean default false,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.health_conditions enable row level security;
alter table public.dietary_preferences enable row level security;
alter table public.allergies enable row level security;
alter table public.onboarding_state enable row level security;

-- Basic RLS Policies (Users can read/update their own data)
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals for update using (auth.uid() = user_id);

create policy "Users can view own conditions" on public.health_conditions for select using (auth.uid() = user_id);
create policy "Users can insert own conditions" on public.health_conditions for insert with check (auth.uid() = user_id);
create policy "Users can delete own conditions" on public.health_conditions for delete using (auth.uid() = user_id);

create policy "Users can view own preferences" on public.dietary_preferences for select using (auth.uid() = user_id);
create policy "Users can insert own preferences" on public.dietary_preferences for insert with check (auth.uid() = user_id);
create policy "Users can delete own preferences" on public.dietary_preferences for delete using (auth.uid() = user_id);

create policy "Users can view own allergies" on public.allergies for select using (auth.uid() = user_id);
create policy "Users can insert own allergies" on public.allergies for insert with check (auth.uid() = user_id);
create policy "Users can delete own allergies" on public.allergies for delete using (auth.uid() = user_id);

create policy "Users can view own onboarding" on public.onboarding_state for select using (auth.uid() = user_id);
create policy "Users can insert own onboarding" on public.onboarding_state for insert with check (auth.uid() = user_id);
create policy "Users can update own onboarding" on public.onboarding_state for update using (auth.uid() = user_id);
