-- Add pregnancy status to profiles
ALTER TABLE public.profiles ADD COLUMN pregnancy_status text CHECK (pregnancy_status IN ('none', 'pregnant', 'breastfeeding')) DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN pregnancy_updated_at timestamp with time zone;

-- Create health data consent logs table for compliance (GDPR/HIPAA)
CREATE TABLE public.health_data_consent_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    consent_type text NOT NULL,
    consent_text_version text NOT NULL,
    mechanism text NOT NULL,
    is_revoked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    revoked_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.health_data_consent_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Users can read and insert their own consent logs, but not delete/update them except to revoke)
CREATE POLICY "Users can view own consent logs" ON public.health_data_consent_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consent logs" ON public.health_data_consent_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own consent logs" ON public.health_data_consent_logs FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================================================
-- 1. COLUMN-LEVEL ENCRYPTION (pgsodium)
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS pgsodium;

-- Add a key_id column so each profile has a unique encryption key
ALTER TABLE public.profiles ADD COLUMN key_id uuid DEFAULT (pgsodium.create_key()).id;

-- Apply Transparent Column Encryption (TCE) to pregnancy_status
SECURITY LABEL FOR pgsodium ON COLUMN public.profiles.pregnancy_status IS 'ENCRYPT WITH KEY COLUMN key_id';

-- ==============================================================================
-- 2. TIME-TO-LIVE (TTL) 9-MONTH EXPIRATION via pg_cron
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.purge_stale_pregnancy_data()
RETURNS void AS $$
BEGIN
  -- Step 1: Revoke the consent logs automatically
  UPDATE public.health_data_consent_logs
  SET is_revoked = true, revoked_at = NOW()
  WHERE user_id IN (
    SELECT id FROM public.profiles
    WHERE pregnancy_status IN ('pregnant', 'breastfeeding')
      AND pregnancy_updated_at < NOW() - INTERVAL '9 months'
  ) AND is_revoked = false;

  -- Step 2: Reset the pregnancy status to 'none'
  UPDATE public.profiles
  SET pregnancy_status = 'none'
  WHERE pregnancy_status IN ('pregnant', 'breastfeeding')
    AND pregnancy_updated_at < NOW() - INTERVAL '9 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the function to run every day at midnight (UTC)
SELECT cron.schedule('purge_stale_pregnancy_data_job', '0 0 * * *', 'SELECT public.purge_stale_pregnancy_data();');
