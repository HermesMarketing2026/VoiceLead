const DURATA_MS = 24 * 60 * 60 * 1000

interface Sessione {
  tipo: 'admin' | 'workspace'
  adminToken?: string
  workspaceToken?: string   // token HMAC per autenticare le API del workspace
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
  adminToken?: string,
  workspaceToken?: string,
) {
  const payload: Sessione = {
    tipo, adminToken, workspaceToken,
    workspaceId, nomeAzienda, logoUrl,
    hasGestisci, utenteId, nomeUtente, ruoloUtente,
    scadenza: Date.now() + DURATA_MS,
  }
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

export function salvaSessioneAdmin(adminToken: string) {
  const payload: Sessione = { tipo: 'admin', adminToken, scadenza: Date.now() + DURATA_MS }
  localStorage.setItem('vl_sessione', JSON.stringify(payload))
}

// Header Authorization per chiamate admin
export function adminAuthHeader(): Record<string, string> {
  try {
    const sessione = leggiSessione()
    if (sessione?.adminToken) return { Authorization: `Bearer ${sessione.adminToken}` }
  } catch {}
  return {}
}

// Header Authorization per chiamate workspace (leads, estrai, scan-card, ecc.)
export function workspaceAuthHeader(): Record<string, string> {
  try {
    const sessione = leggiSessione()
    if (sessione?.workspaceToken) return { Authorization: `Bearer ${sessione.workspaceToken}` }
  } catch {}
  return {}
}
