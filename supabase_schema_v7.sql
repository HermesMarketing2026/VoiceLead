-- v7: rimozione Google Sheets, aggiornamento provisioning_tokens

-- Rimuovi google_sheet_id dai workspace (non più necessario)
ALTER TABLE workspaces DROP COLUMN IF EXISTS google_sheet_id;

-- Rimuovi google_sheet_id dai provisioning_tokens
ALTER TABLE provisioning_tokens DROP COLUMN IF EXISTS google_sheet_id;
