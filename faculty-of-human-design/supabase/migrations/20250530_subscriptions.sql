-- ─── SUBSCRIPTION SUPPORT MIGRATION ──────────────────────────────────────────
-- Run this once in Supabase SQL editor (or via supabase db push).
-- Adds Stripe tracking columns to orders and creates the subscriptions table.

-- 1. Add Stripe columns to orders table (safe to run multiple times)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_session_id      text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id     text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_invoice_id      text,
  ADD COLUMN IF NOT EXISTS is_renewal             boolean DEFAULT false;

-- 2. Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id     text,
  first_order_id         uuid REFERENCES orders(id) ON DELETE SET NULL,
  customer_email         text,
  status                 text NOT NULL DEFAULT 'active',  -- active | cancelled
  last_renewed_at        timestamptz,
  cancelled_at           timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

-- 3. Index for quick lookup by subscription ID
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id
  ON subscriptions (stripe_subscription_id);

-- 4. Index for customer email lookup (Customer Portal flow)
CREATE INDEX IF NOT EXISTS idx_subscriptions_email
  ON subscriptions (customer_email);

-- 5. Row Level Security — only service role can read/write
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "service_role_only" ON subscriptions
  USING (auth.role() = 'service_role');
