-- Migration v11: protezione workspace Stripe
-- Aggiunge stripe_subscription_id e stripe_subscription_status ai workspaces
-- Eseguire su Supabase Dashboard > SQL Editor

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT;

CREATE INDEX IF NOT EXISTS workspaces_stripe_subscription_id_idx
  ON workspaces (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
