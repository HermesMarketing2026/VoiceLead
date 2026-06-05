-- Esegui questo nel SQL Editor di Supabase

-- Tabella workspace
CREATE TABLE IF NOT EXISTS workspaces (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text NOT NULL UNIQUE,
  nome_azienda      text NOT NULL,
  google_sheet_id   text NOT NULL,
  pin               text NOT NULL,
  creato_il         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY;

-- Aggiungi workspace_id alla tabella leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;

-- Indice per filtrare velocemente per workspace
CREATE INDEX IF NOT EXISTS leads_workspace_id_idx ON leads(workspace_id);
