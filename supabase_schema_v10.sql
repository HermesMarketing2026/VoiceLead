-- Migration v10: aggiunge stripe_subscription_id agli ordini
-- Eseguire su Supabase Dashboard > SQL Editor

ALTER TABLE ordini
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Indice per lookup veloce dal webhook
CREATE INDEX IF NOT EXISTS ordini_stripe_subscription_id_idx
  ON ordini (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
