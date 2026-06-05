export type StatoLead = 'bozza' | 'completo' | 'esportato'

export interface Lead {
  id: string
  nome: string
  cognome: string
  azienda: string
  email: string
  telefono: string
  note: string | null
  data_registrazione: string
  stato: StatoLead
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
