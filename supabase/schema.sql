-- ==========================================================
-- SUPABASE DATABASE ARCHITECTURE FOR AI JOB SCRAPER & RESUME MATCHER
-- ==========================================================

-- 1. Enable vector math extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::UUID,
  full_name TEXT,
  title TEXT,
  skills TEXT[],
  raw_text TEXT,
  embedding VECTOR(768), -- Gemini gemini-embedding-2 output at 768 dimensions
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_hash TEXT UNIQUE NOT NULL, -- MD5(company + title + apply_url) to prevent duplicate rows
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  category TEXT NOT NULL,
  is_remote BOOLEAN DEFAULT FALSE,
  location TEXT,
  apply_url TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[],
  salary TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_is_predicted TEXT,
  contract_time TEXT,
  contract_type TEXT,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  embedding VECTOR(768), -- Embedded job text
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration snippets to ensure salary & posted_at columns exist on existing database instances:
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS posted_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_min NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_max NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS salary_is_predicted TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS contract_time TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS contract_type TEXT;

-- 4. IVFFlat Vector Index for Cosine Similarity Searches
CREATE INDEX IF NOT EXISTS idx_jobs_embedding ON public.jobs 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 5. RPC Function for Vector Similarity Searching
-- Note: Must drop existing function first if changing return table structure
DROP FUNCTION IF EXISTS public.match_jobs_for_user(uuid, double precision, integer);
DROP FUNCTION IF EXISTS public.match_jobs_for_user(UUID, FLOAT, INT);
DROP FUNCTION IF EXISTS match_jobs_for_user;

CREATE OR REPLACE FUNCTION match_jobs_for_user(
  target_user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::UUID,
  match_threshold FLOAT DEFAULT 0.0, -- Lowered to 0.0 to ensure jobs return even with low similarity
  match_count INT DEFAULT 30
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  company TEXT,
  category TEXT,
  is_remote BOOLEAN,
  location TEXT,
  apply_url TEXT,
  description TEXT,
  required_skills TEXT[],
  salary TEXT,
  salary_min NUMERIC,
  salary_max NUMERIC,
  contract_time TEXT,
  contract_type TEXT,
  posted_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if profile vector exists first; return empty if not embedded yet
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = target_user_id AND embedding IS NOT NULL
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    j.id,
    j.title,
    j.company,
    j.category,
    j.is_remote,
    j.location,
    j.apply_url,
    j.description,
    j.required_skills,
    j.salary,
    j.salary_min,
    j.salary_max,
    j.contract_time,
    j.contract_type,
    j.posted_at,
    -- Cosine similarity formula: 1 - cosine_distance
    COALESCE((1 - (j.embedding <=> p.embedding))::FLOAT, 0.0) AS similarity
  FROM public.jobs j
  CROSS JOIN public.profiles p
  WHERE p.id = target_user_id
    AND j.embedding IS NOT NULL
    AND p.embedding IS NOT NULL
    AND (1 - (j.embedding <=> p.embedding)) >= match_threshold
  ORDER BY j.embedding <=> p.embedding ASC
  LIMIT match_count;
END;
$$;

-- ==========================================================
-- 6. SERVERLESS 30-MINUTE EDGE CRON SCHEDULER (pg_cron + pg_net)
-- ==========================================================
-- Enable pg_cron and pg_net extensions for database-level scheduling:
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Unschedule previous job if re-running
DO $$
BEGIN
  PERFORM cron.unschedule('scrape-jobs-every-30-mins');
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Schedule the Supabase Edge Function to run every 30 minutes:
-- Replace <YOUR_PROJECT_REF> and <YOUR_SERVICE_ROLE_KEY> with your Supabase values.
/*
SELECT cron.schedule(
  'scrape-jobs-every-30-mins',
  '*/30 * * * *', -- every 30 minutes
  $$
  SELECT net.http_post(
    url := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/ingest-jobs',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <YOUR_SUPABASE_SERVICE_ROLE_KEY>'
    ),
    body := jsonb_build_object('source', 'supabase_pg_cron', 'interval', '30m')
  ) AS request_id;
  $$
);
*/

