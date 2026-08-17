-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
-- ALWAYS REFERENCE AND UPDATE THIS file any time making SQL recommendations.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  organisation_id uuid,
  team_id uuid,
  name text,
  date_of_birth date,
  biological_sex text CHECK (biological_sex = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])),
  height_cm numeric,
  weight_kg numeric,
  waist_cm numeric,
  hip_cm numeric,
  body_fat_pct numeric,
  units text DEFAULT 'metric'::text,
  locale text DEFAULT 'en-US'::text,
  timezone text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.goals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  organisation_id uuid,
  team_id uuid,
  goal_type text NOT NULL,
  pace text,
  target_weight_kg numeric,
  calorie_override numeric,
  protein_override_g numeric,
  fat_override_g numeric,
  carbs_override_g numeric,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT goals_pkey PRIMARY KEY (id),
  CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.system_health_rules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  condition_name text NOT NULL UNIQUE,
  display_name character varying NOT NULL,
  severity character varying NOT NULL CHECK (severity::text = ANY (ARRAY['advisory'::character varying, 'important'::character varying, 'critical'::character varying]::text[])),
  allowed_categories jsonb,
  restricted_categories jsonb,
  flagged_ingredients jsonb,
  preferred_nutrients jsonb,
  restricted_nutrients jsonb,
  warning_message text NOT NULL,
  risk_message text NOT NULL,
  calorie_modifier jsonb,
  macro_overrides jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT system_health_rules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.health_conditions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  organisation_id uuid,
  team_id uuid,
  condition_name text NOT NULL,
  severity text CHECK (severity = ANY (ARRAY['advisory'::text, 'important'::text, 'critical'::text])),
  diagnosed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT health_conditions_pkey PRIMARY KEY (id),
  CONSTRAINT health_conditions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT health_conditions_condition_name_fkey FOREIGN KEY (condition_name) REFERENCES public.system_health_rules(condition_name) ON UPDATE CASCADE ON DELETE RESTRICT
);
CREATE TABLE public.dietary_preferences (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  organisation_id uuid,
  team_id uuid,
  preference_name text NOT NULL,
  if_window_start time without time zone,
  if_window_end time without time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT dietary_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT dietary_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.allergies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  organisation_id uuid,
  team_id uuid,
  allergen_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT allergies_pkey PRIMARY KEY (id),
  CONSTRAINT allergies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.onboarding_state (
  user_id uuid NOT NULL,
  organisation_id uuid,
  team_id uuid,
  step_completed integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  started_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at timestamp with time zone,
  CONSTRAINT onboarding_state_pkey PRIMARY KEY (user_id),
  CONSTRAINT onboarding_state_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.foods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  barcode text UNIQUE,
  name text NOT NULL,
  brand text,
  calories_100g numeric NOT NULL,
  protein_100g numeric NOT NULL,
  carbohydrates_100g numeric NOT NULL,
  fat_100g numeric NOT NULL,
  fiber_100g numeric,
  sugar_100g numeric,
  sodium_100g numeric,
  trust_score integer DEFAULT 0,
  completeness_score integer DEFAULT 0,
  image_url text,
  locale text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  provider_id text,
  name_local text,
  preparation_state text,
  CONSTRAINT foods_pkey PRIMARY KEY (id)
);
CREATE TABLE public.serving_sizes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  food_id uuid NOT NULL,
  serving_name text NOT NULL,
  weight_g numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT serving_sizes_pkey PRIMARY KEY (id),
  CONSTRAINT serving_sizes_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id)
);
CREATE TABLE public.diary_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  organisation_id uuid,
  team_id uuid,
  entry_date date NOT NULL,
  meal_slot text NOT NULL,
  photo_urls ARRAY,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT diary_entries_pkey PRIMARY KEY (id),
  CONSTRAINT diary_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.diary_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  diary_entry_id uuid NOT NULL,
  food_id uuid NOT NULL,
  serving_size_id uuid,
  quantity numeric NOT NULL,
  nutrition_snapshot jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  food_name_logged text,
  CONSTRAINT diary_items_pkey PRIMARY KEY (id),
  CONSTRAINT diary_items_diary_entry_id_fkey FOREIGN KEY (diary_entry_id) REFERENCES public.diary_entries(id),
  CONSTRAINT diary_items_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id),
  CONSTRAINT diary_items_serving_size_id_fkey FOREIGN KEY (serving_size_id) REFERENCES public.serving_sizes(id)
);
