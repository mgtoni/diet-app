CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  entity_type text NOT NULL,
  action text NOT NULL,
  previous_state jsonb,
  new_state jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own logs
CREATE POLICY "Users can view their own audit logs" 
ON public.audit_logs FOR SELECT 
USING (auth.uid() = user_id);

-- System handles inserts, but for convenience we can allow users to insert their own logs
CREATE POLICY "Users can insert their own audit logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);
