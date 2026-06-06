-- VoiceLead — migrazione v4
-- Aggiunge has_gestisci ai workspace (default false = solo Pacchetto 1)
ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS has_gestisci boolean DEFAULT false;
