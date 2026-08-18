CREATE TABLE public.daily_scores_rollup (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  nutrition_score integer NOT NULL,
  diet_quality_score integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT daily_scores_rollup_pkey PRIMARY KEY (id),
  CONSTRAINT daily_scores_rollup_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT daily_scores_rollup_unique_user_date UNIQUE (user_id, date)
);

-- RLS Policies
ALTER TABLE public.daily_scores_rollup ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scores rollup"
  ON public.daily_scores_rollup
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores rollup"
  ON public.daily_scores_rollup
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores rollup"
  ON public.daily_scores_rollup
  FOR UPDATE
  USING (auth.uid() = user_id);
