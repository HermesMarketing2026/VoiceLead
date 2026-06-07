-- v8: tabella ordini per dati fatturazione e verifica bonifico

CREATE TABLE IF NOT EXISTS ordini (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Ordine
  piano             text NOT NULL,          -- 'registra' | 'registra_gestisci'
  fatturazione      text NOT NULL,          -- 'mensile' | 'annuale'
  max_commerciali   int  NOT NULL,
  totale            numeric(10,2) NOT NULL,
  -- Dati fatturazione
  ragione_sociale   text NOT NULL,
  partita_iva       text NOT NULL,
  codice_sdi        text,
  pec               text,
  indirizzo         text NOT NULL,
  cap               text NOT NULL,
  citta             text NOT NULL,
  provincia         text NOT NULL,
  -- Stato verifica
  stato             text NOT NULL DEFAULT 'in_attesa'
                      CHECK (stato IN ('in_attesa', 'verificato', 'fallito')),
  note_verifica     text,                   -- cosa ha rilevato l'AI
  -- Link al workspace creato
  provisioning_token_id uuid REFERENCES provisioning_tokens(id),
  creato_il         timestamptz DEFAULT now()
);

ALTER TABLE ordini DISABLE ROW LEVEL SECURITY;
