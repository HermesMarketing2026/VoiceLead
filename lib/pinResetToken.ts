import crypto from 'crypto'

const SECRET = process.env.JWT_SECRET ?? 'fallback-secret'
const TTL_MS = 60 * 60 * 1000 // 1 ora

export function generaTokenReset(workspaceId: string, utenteId: string | null): string {
  const payload = `${workspaceId}:${utenteId ?? 'responsabile'}:${Date.now()}`
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64url')
}

export function verificaTokenReset(token: string): { workspaceId: string; utenteId: string | null } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    // format: workspaceId:utenteId:timestamp:sig
    const lastColon = decoded.lastIndexOf(':')
    const sig = decoded.slice(lastColon + 1)
    const payload = decoded.slice(0, lastColon)
    const parts = payload.split(':')
    if (parts.length !== 3) return null
    const [workspaceId, utenteIdRaw, timestamp] = parts

    if (Date.now() - Number(timestamp) > TTL_MS) return null

    const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
    const sigBuf = Buffer.from(sig.padEnd(expectedSig.length, '0').slice(0, expectedSig.length))
    const expBuf = Buffer.from(expectedSig)
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null

    return { workspaceId, utenteId: utenteIdRaw === 'responsabile' ? null : utenteIdRaw }
  } catch {
    return null
  }
}
