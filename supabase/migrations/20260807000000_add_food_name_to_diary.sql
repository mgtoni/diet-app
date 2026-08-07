-- Migration to add food_name_logged to diary_items
ALTER TABLE public.diary_items 
ADD COLUMN food_name_logged text;

-- Backfill existing data
UPDATE public.diary_items di
SET food_name_logged = f.name
FROM public.foods f
WHERE di.food_id = f.id;
