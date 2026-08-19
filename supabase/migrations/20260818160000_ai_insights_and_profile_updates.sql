-- Add activity_level and pregnancy_status to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activity_level text DEFAULT 'sedentary';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pregnancy_status text DEFAULT 'none';

-- Create table for daily and weekly AI insights
CREATE TABLE public.ai_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  insight_type text NOT NULL CHECK (insight_type IN ('daily', 'weekly')),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT ai_insights_pkey PRIMARY KEY (id),
  CONSTRAINT ai_insights_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT ai_insights_unique_user_date_type UNIQUE (user_id, date, insight_type)
);
