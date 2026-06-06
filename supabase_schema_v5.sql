-- VoiceLead — migrazione v5: multi-utente per workspace

-- Tabella utenti (commerciali per workspace)
CREATE TABLE IF NOT EXISTS utenti (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  nome         text NOT NULL,
  cognome      text NOT NULL,
  pin          text NOT NULL,
  ruolo        text NOT NULL DEFAULT 'commerciale' CHECK (ruolo IN ('admin', 'commerciale')),
  creato_il    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE utenti DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS utenti_workspace_id_idx ON utenti(workspace_id);

-- Colonna utente_id sui lead (nullable: lead "di workspace" senza utente assegnato)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utente_id uuid REFERENCES utenti(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS leads_utente_id_idx ON leads(utente_id);
