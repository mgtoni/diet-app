-- Migration to create the foods table as per the Quality Waterfall architecture
CREATE TABLE IF NOT EXISTS public.foods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    brand TEXT,
    
    -- Macros per 100g
    calories_100g NUMERIC NOT NULL,
    protein_100g NUMERIC NOT NULL,
    carbohydrates_100g NUMERIC NOT NULL,
    fat_100g NUMERIC NOT NULL,
    fiber_100g NUMERIC,
    sugar_100g NUMERIC,
    sodium_100g NUMERIC,
    
    -- Quality indicators
    trust_score INTEGER DEFAULT 0,
    completeness_score INTEGER DEFAULT 0,
    image_url TEXT,
    
    -- Metadata
    source TEXT NOT NULL,
    locale TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for text searches and barcode scans
CREATE INDEX IF NOT EXISTS idx_foods_barcode ON public.foods(barcode);
CREATE INDEX IF NOT EXISTS idx_foods_name ON public.foods(name);
CREATE INDEX IF NOT EXISTS idx_foods_locale ON public.foods(locale);

-- RLS Policies
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

-- Allow public read access to foods
CREATE POLICY "Public profiles are viewable by everyone."
ON public.foods FOR SELECT
USING ( true );

-- Service role will handle INSERTS/UPDATES (Supabase Server-side)
