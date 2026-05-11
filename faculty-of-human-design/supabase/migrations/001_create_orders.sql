-- Faculty of Human Design — Orders table
-- Run this in Supabase SQL editor or via CLI: supabase db push

CREATE TABLE IF NOT EXISTS orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id          TEXT NOT NULL,
  report_title       TEXT NOT NULL,
  customer_name      TEXT,
  customer_email     TEXT NOT NULL,
  birth_data         JSONB NOT NULL,
  partner_birth_data JSONB,
  prompt_sections    TEXT[] NOT NULL DEFAULT '{}',
  stripe_session_id  TEXT UNIQUE,
  stripe_payment_intent TEXT,
  status             TEXT NOT NULL DEFAULT 'pending',
    -- pending | paid | processing | delivered | failed
  download_token     UUID UNIQUE,
  pdf_blob_url       TEXT,
  inngest_event_id   TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at            TIMESTAMPTZ,
  delivered_at       TIMESTAMPTZ
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS orders_stripe_session_idx   ON orders (stripe_session_id);
CREATE INDEX IF NOT EXISTS orders_download_token_idx   ON orders (download_token);
CREATE INDEX IF NOT EXISTS orders_status_idx           ON orders (status);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx   ON orders (customer_email);

-- Row-level security: service role only (no anon access)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Only the service role (backend) can read/write orders
CREATE POLICY "service_role_only" ON orders
  USING (false)
  WITH CHECK (false);
