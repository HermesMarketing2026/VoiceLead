const DURATA_MS = 24 * 60 * 60 * 1000 // 24 ore

export function salvaSessione(tipo: 'admin' | 'workspace', workspaceId?: string) {
  const payload = { tipo, workspaceId, scadenza: Date.now() + DURATA_MS }
  localStorage.setItem('vl_sessione', JSON.stringify(payload))
}

export function leggiSessione(): { tipo: 'admin' | 'workspace'; workspaceId?: string } | null {
  try {
    const raw = localStorage.getItem('vl_sessione')
    if (!raw) return null
    const payload = JSON.parse(raw)
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
