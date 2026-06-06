-- VoiceLead 2 — Gestisci: migration SQL
-- Run this in Supabase SQL editor

-- Add new columns to leads
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS stato_gestione text DEFAULT 'nuovo',
  ADD COLUMN IF NOT EXISTS in_gestione boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_entrata_gestione timestamptz,
  ADD COLUMN IF NOT EXISTS data_esito timestamptz,
  ADD COLUMN IF NOT EXISTS esito text,
  ADD COLUMN IF NOT EXISTS durata_trattativa_giorni integer;

-- Create azioni table
CREATE TABLE IF NOT EXISTS azioni (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  testo text NOT NULL,
  scadenza timestamptz NOT NULL,
  scadenza_automatica boolean DEFAULT false,
  completata boolean DEFAULT false,
  data_completamento timestamptz,
  aggiornamento_dettato text,
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookup by lead
CREATE INDEX IF NOT EXISTS azioni_lead_id_idx ON azioni(lead_id);
CREATE INDEX IF NOT EXISTS azioni_scadenza_idx ON azioni(scadenza) WHERE completata = false;
