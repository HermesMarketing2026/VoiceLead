const DURATA_MS = 24 * 60 * 60 * 1000

interface Sessione {
  tipo: 'admin' | 'workspace'
  workspaceId?: string
  nomeAzienda?: string
  logoUrl?: string
  hasGestisci?: boolean
  utenteId?: string
  nomeUtente?: string
  ruoloUtente?: 'admin' | 'commerciale'
  scadenza: number
}

export function salvaSessione(
  tipo: 'admin' | 'workspace',
  workspaceId?: string,
  nomeAzienda?: string,
  logoUrl?: string,
  hasGestisci?: boolean,
  utenteId?: string,
  nomeUtente?: string,
  ruoloUtente?: 'admin' | 'commerciale',
) {
  const payload: Sessione = { tipo, workspaceId, nomeAzienda, logoUrl, hasGestisci, utenteId, nomeUtente, ruoloUtente, scadenza: Date.now() + DURATA_MS }
  localStorage.setItem('vl_sessione', JSON.stringify(payload))
}

export function leggiSessione(): Sessione | null {
  try {
    const raw = localStorage.getItem('vl_sessione')
    if (!raw) return null
    const payload: Sessione = JSON.parse(raw)
    if (Date.now() > payload.scadenza) {
      localStorage.removeItem('vl_sessione')
      return null
    }
    return payload
  } catch {
    return null
  }
}

export function cancellaSessione() {
  localStorage.removeItem('vl_sessione')
}
