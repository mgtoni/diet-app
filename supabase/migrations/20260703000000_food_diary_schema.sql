-- 1. FOOD SOURCES
create table public.food_sources (
  id uuid default uuid_generate_v4() primary key,
  provider_name text not null,
  priority integer not null,
  adapter_class text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. FOODS
create table public.foods (
  id uuid default uuid_generate_v4() primary key,
  source_id uuid references public.food_sources(id),
  source_food_id text,
  brand text,
  barcode text,
  is_verified boolean default false,
  is_user_created boolean default false,
  user_id uuid references public.profiles(id),
  nova_group integer,
  is_supplement boolean default false,
  seasonality text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index foods_barcode_idx on public.foods(barcode);

-- 3. FOOD NAMES
create table public.food_names (
  id uuid default uuid_generate_v4() primary key,
  food_id uuid references public.foods(id) on delete cascade not null,
  locale text default 'en-US' not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index food_names_food_id_idx on public.food_names(food_id);
create index food_names_name_idx on public.food_names using gin(name gin_trgm_ops);

-- Enable pg_trgm for search if not exists
create extension if not exists pg_trgm;

-- 4. NUTRIENTS
create table public.nutrients (
  id uuid default uuid_generate_v4() primary key,
  nutrient_name text not null,
  unit text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. FOOD NUTRIENTS
create table public.food_nutrients (
  id uuid default uuid_generate_v4() primary key,
  food_id uuid references public.foods(id) on delete cascade not null,
  nutrient_id uuid references public.nutrients(id) on delete cascade not null,
  amount_per_100g numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(food_id, nutrient_id)
);

-- 6. SERVING SIZES
create table public.serving_sizes (
  id uuid default uuid_generate_v4() primary key,
  food_id uuid references public.foods(id) on delete cascade not null,
  serving_name text not null,
  weight_g numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. DIARY ENTRIES
create table public.diary_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  organisation_id uuid,
  team_id uuid,
  entry_date date not null,
  meal_slot text not null,
  photo_urls text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, entry_date, meal_slot)
);

-- 8. DIARY ITEMS
create table public.diary_items (
  id uuid default uuid_generate_v4() primary key,
  diary_entry_id uuid references public.diary_entries(id) on delete cascade not null,
  food_id uuid references public.foods(id) not null,
  serving_size_id uuid references public.serving_sizes(id),
  quantity numeric not null,
  nutrition_snapshot jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. RECIPES
create table public.recipes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  servings numeric not null,
  is_public boolean default false,
  source_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. RECIPE INGREDIENTS
create table public.recipe_ingredients (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  food_id uuid references public.foods(id) not null,
  serving_size_id uuid references public.serving_sizes(id),
  quantity numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. RECIPE NUTRITION
create table public.recipe_nutrition (
  id uuid default uuid_generate_v4() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  nutrition_totals jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. SAVED MEALS
create table public.saved_meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. SAVED MEAL ITEMS
create table public.saved_meal_items (
  id uuid default uuid_generate_v4() primary key,
  saved_meal_id uuid references public.saved_meals(id) on delete cascade not null,
  food_id uuid references public.foods(id) not null,
  serving_size_id uuid references public.serving_sizes(id),
  quantity numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. WEIGHT LOGS
create table public.weight_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  log_date date not null,
  weight_kg numeric not null,
  source text,
  source_device_id text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. BODY MEASUREMENTS
create table public.body_measurements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  log_date date not null,
  waist_cm numeric,
  hip_cm numeric,
  body_fat_pct numeric,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY

-- Foods
alter table public.food_sources enable row level security;
alter table public.foods enable row level security;
alter table public.food_names enable row level security;
alter table public.nutrients enable row level security;
alter table public.food_nutrients enable row level security;
alter table public.serving_sizes enable row level security;

-- Public foods are visible to everyone
create policy "Anyone can view food sources" on public.food_sources for select using (true);
create policy "Anyone can view foods" on public.foods for select using (is_user_created = false or auth.uid() = user_id);
create policy "Anyone can view food names" on public.food_names for select using (true);
create policy "Anyone can view nutrients" on public.nutrients for select using (true);
create policy "Anyone can view food nutrients" on public.food_nutrients for select using (true);
create policy "Anyone can view serving sizes" on public.serving_sizes for select using (true);

-- User created foods
create policy "Users can insert own foods" on public.foods for insert with check (auth.uid() = user_id);
create policy "Users can update own foods" on public.foods for update using (auth.uid() = user_id);
create policy "Users can delete own foods" on public.foods for delete using (auth.uid() = user_id);

-- Diary
alter table public.diary_entries enable row level security;
alter table public.diary_items enable row level security;

create policy "Users can view own diary entries" on public.diary_entries for select using (auth.uid() = user_id);
create policy "Users can insert own diary entries" on public.diary_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own diary entries" on public.diary_entries for update using (auth.uid() = user_id);
create policy "Users can delete own diary entries" on public.diary_entries for delete using (auth.uid() = user_id);

create policy "Users can view own diary items" on public.diary_items for select using (
  exists (select 1 from public.diary_entries where id = diary_entry_id and user_id = auth.uid())
);
create policy "Users can insert own diary items" on public.diary_items for insert with check (
  exists (select 1 from public.diary_entries where id = diary_entry_id and user_id = auth.uid())
);
create policy "Users can update own diary items" on public.diary_items for update using (
  exists (select 1 from public.diary_entries where id = diary_entry_id and user_id = auth.uid())
);
create policy "Users can delete own diary items" on public.diary_items for delete using (
  exists (select 1 from public.diary_entries where id = diary_entry_id and user_id = auth.uid())
);

-- Recipes
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_nutrition enable row level security;

create policy "Users can view own or public recipes" on public.recipes for select using (auth.uid() = user_id or is_public = true);
create policy "Users can manage own recipes" on public.recipes for all using (auth.uid() = user_id);

create policy "Users can view ingredients for accessible recipes" on public.recipe_ingredients for select using (
  exists (select 1 from public.recipes where id = recipe_id and (user_id = auth.uid() or is_public = true))
);
create policy "Users can manage own recipe ingredients" on public.recipe_ingredients for all using (
  exists (select 1 from public.recipes where id = recipe_id and user_id = auth.uid())
);

create policy "Users can view nutrition for accessible recipes" on public.recipe_nutrition for select using (
  exists (select 1 from public.recipes where id = recipe_id and (user_id = auth.uid() or is_public = true))
);
create policy "Users can manage own recipe nutrition" on public.recipe_nutrition for all using (
  exists (select 1 from public.recipes where id = recipe_id and user_id = auth.uid())
);

-- Saved Meals
alter table public.saved_meals enable row level security;
alter table public.saved_meal_items enable row level security;

create policy "Users can manage own saved meals" on public.saved_meals for all using (auth.uid() = user_id);
create policy "Users can manage own saved meal items" on public.saved_meal_items for all using (
  exists (select 1 from public.saved_meals where id = saved_meal_id and user_id = auth.uid())
);

-- Tracking
alter table public.weight_logs enable row level security;
alter table public.body_measurements enable row level security;

create policy "Users can manage own weight logs" on public.weight_logs for all using (auth.uid() = user_id);
create policy "Users can manage own body measurements" on public.body_measurements for all using (auth.uid() = user_id);
