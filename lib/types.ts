export type StatoLead = 'bozza' | 'completo' | 'esportato'
export type StatoGestione = 'nuovo' | 'trattativa'
export type EsitoGestione = 'vinto' | 'perso'

export interface Workspace {
  id: string
  slug: string
  nome_azienda: string
  google_sheet_id: string
  logo_url?: string
  nome_referente?: string
  cognome_referente?: string
  pin: string
  creato_il: string
  has_gestisci: boolean
}

export interface Lead {
  id: string
  workspace_id: string
  nome: string
  cognome: string
  azienda: string
  email: string
  telefono: string
  note: string | null
  data_registrazione: string
  stato: StatoLead
  // Gestisci fields
  stato_gestione: StatoGestione
  in_gestione: boolean
  data_entrata_gestione: string | null
  data_esito: string | null
  esito: EsitoGestione | null
  durata_trattativa_giorni: number | null
}

export interface Azione {
  id: string
  lead_id: string
  testo: string
  scadenza: string
  scadenza_automatica: boolean
  completata: boolean
  data_completamento: string | null
  aggiornamento_dettato: string | null
  created_at: string
}

export interface LeadFormData {
  nome: string
  cognome: string
  azienda: string
  email: string
  telefono: string
  note: string
}

export const CAMPI_OBBLIGATORI: (keyof LeadFormData)[] = [
  'nome', 'cognome', 'azienda', 'email', 'telefono'
]

export const LABEL_CAMPI: Record<keyof LeadFormData, string> = {
  nome: 'Nome',
  cognome: 'Cognome',
  azienda: 'Azienda',
  email: 'Email',
  telefono: 'Telefono',
  note: 'Note',
}

export const STEP_GESTIONE: StatoGestione[] = ['nuovo', 'trattativa']

export const LABEL_STATO_GESTIONE: Record<StatoGestione, string> = {
  nuovo: 'Nuovo',
  trattativa: 'In trattativa',
}

export function calcolaCompletamento(lead: LeadFormData): number {
  const valori = CAMPI_OBBLIGATORI.map(c => lead[c]?.trim() || '')
  const compilati = valori.filter(v => v.length > 0).length
  return Math.round((compilati / CAMPI_OBBLIGATORI.length) * 100)
}

export function campiMancanti(lead: LeadFormData): string[] {
  return CAMPI_OBBLIGATORI
    .filter(c => !lead[c]?.trim())
    .map(c => LABEL_CAMPI[c])
}
