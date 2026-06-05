-- Esegui questo SQL nel SQL Editor di Supabase

create table if not exists leads (
  id                 uuid primary key default gen_random_uuid(),
  nome               text not null default '',
  cognome            text not null default '',
  azienda            text not null default '',
  email              text not null default '',
  telefono           text not null default '',
  note               text,
  data_registrazione timestamptz not null default now(),
  stato              text not null default 'bozza'
                       check (stato in ('bozza', 'completo', 'esportato'))
);

-- Row Level Security
-- Opzione A (più semplice, app senza autenticazione):
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Opzione B (RLS attivo ma accesso pubblico con anon key):
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "accesso pubblico leads" ON leads FOR ALL USING (true) WITH CHECK (true);
