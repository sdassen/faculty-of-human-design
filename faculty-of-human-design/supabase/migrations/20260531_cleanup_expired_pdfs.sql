-- ─── Cleanup expired PDFs after 30 days ──────────────────────────────────────
-- Runs nightly via pg_cron. Nulls pdf_blob_url on orders older than 30 days,
-- matching the TOKEN_EXPIRY_DAYS = 30 in api/get-download.js and the terms.
--
-- STEP 1: Enable pg_cron (only needed once per Supabase project).
-- Run this in the Supabase SQL Editor under Extensions if not already enabled:
--   CREATE EXTENSION IF NOT EXISTS pg_cron;

-- STEP 2: Create the cleanup function.
CREATE OR REPLACE FUNCTION cleanup_expired_pdf_blobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE orders
  SET pdf_blob_url = NULL
  WHERE delivered_at < NOW() - INTERVAL '30 days'
    AND pdf_blob_url IS NOT NULL;
END;
$$;

-- STEP 3: Schedule the function to run every night at 03:00 UTC.
-- If you need to change the schedule, run cron.unschedule first (see below).
SELECT cron.schedule(
  'cleanup-expired-pdf-blobs',   -- job name (unique)
  '0 3 * * *',                   -- every day at 03:00 UTC
  'SELECT cleanup_expired_pdf_blobs()'
);

-- ─── To verify the job is scheduled: ────────────────────────────────────────
-- SELECT * FROM cron.job WHERE jobname = 'cleanup-expired-pdf-blobs';

-- ─── To remove the job if needed: ───────────────────────────────────────────
-- SELECT cron.unschedule('cleanup-expired-pdf-blobs');
