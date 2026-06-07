-- v9: gestione abbonamenti — scadenza, sospensione, piano su workspaces

-- Colonne abbonamento su workspaces
ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS fatturazione  text,        -- 'mensile' | 'annuale' | 'prova'
  ADD COLUMN IF NOT EXISTS scadenza_il   timestamptz,
  ADD COLUMN IF NOT EXISTS sospeso       boolean NOT NULL DEFAULT false;

-- Colonna fatturazione su provisioning_tokens (serve all'onboarding per calcolare la scadenza)
ALTER TABLE provisioning_tokens
  ADD COLUMN IF NOT EXISTS fatturazione  text;        -- 'mensile' | 'annuale' | 'prova' | NULL (manuale)

-- Indice per il cron di scadenza
CREATE INDEX IF NOT EXISTS workspaces_scadenza_idx ON workspaces(scadenza_il) WHERE sospeso = false;
