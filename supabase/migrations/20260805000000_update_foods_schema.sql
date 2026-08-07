-- Migration to update foods table schema to canonical structure

-- 1. Create provider enum type
DO $$ BEGIN
    CREATE TYPE provider_type AS ENUM ('USDA', 'COFID', 'CIQUAL', 'BEDCA', 'OFF');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add new columns
ALTER TABLE public.foods
ADD COLUMN IF NOT EXISTS provider_id provider_type,
ADD COLUMN IF NOT EXISTS name_local TEXT,
ADD COLUMN IF NOT EXISTS preparation_state TEXT;

-- 3. Migrate existing source data to provider_id (best effort mapping)
UPDATE public.foods
SET provider_id = 
    CASE 
        WHEN source = 'USDA' THEN 'USDA'::provider_type
        WHEN source = 'COFID' THEN 'COFID'::provider_type
        WHEN source = 'CIQUAL' THEN 'CIQUAL'::provider_type
        WHEN source = 'BEDCA' THEN 'BEDCA'::provider_type
        WHEN source = 'OpenFoodFacts' OR source = 'OFF' THEN 'OFF'::provider_type
        ELSE NULL
    END;

-- 4. Drop old source column to enforce single source of truth
ALTER TABLE public.foods DROP COLUMN IF EXISTS source;
