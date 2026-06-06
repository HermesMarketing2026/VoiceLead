-- v6: provisioning tokens per onboarding automatico

CREATE TABLE provisioning_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token uuid UNIQUE DEFAULT gen_random_uuid(),
  piano text NOT NULL CHECK (piano IN ('registra', 'registra_gestisci')),
  max_commerciali integer NOT NULL DEFAULT 1,
  google_sheet_id text NOT NULL,
  usato boolean NOT NULL DEFAULT false,
  workspace_id_creato uuid REFERENCES workspaces(id) ON DELETE SET NULL,
  scadenza timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  creato_il timestamptz NOT NULL DEFAULT now()
);

-- Aggiungi campi extra al workspace per i dati raccolti in onboarding
ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS fatturato text,
  ADD COLUMN IF NOT EXISTS num_dipendenti text,
  ADD COLUMN IF NOT EXISTS settore text;
