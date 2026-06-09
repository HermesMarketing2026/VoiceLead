import { createHmac } from 'crypto'
import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Genera un token HMAC legato al workspaceId.
 * Stateless: non richiede DB, verificabile server-side.
 * Il token non ha scadenza propria — la sessione in localStorage scade dopo 24h.
 */
export function generaWorkspaceToken(workspaceId: string): string {
  const secret = process.env.CRON_SECRET ?? 'fallback-secret'
  return createHmac('sha256', secret).update(`ws:${workspaceId}`).digest('hex')
}

/**
 * Verifica che la richiesta contenga un token workspace valido
 * per il workspaceId specificato.
 * Header atteso: Authorization: Bearer <token>
 */
/**
 * Verifica il token workspace a partire da un lead_id:
 * recupera il workspace_id dal lead e verifica il token.
 * Ritorna il workspace_id se autorizzato, null altrimenti.
 */
export async function autorizzaViaLeadId(req: NextRequest, leadId: string): Promise<string | null> {
  const { data } = await supabase
    .from('leads')
    .select('workspace_id')
    .eq('id', leadId)
    .single()
  if (!data?.workspace_id) return null
  if (!verificaWorkspaceToken(req, data.workspace_id)) return null
  return data.workspace_id
}

export function verificaWorkspaceToken(req: NextRequest, workspaceId: string): boolean {
  if (!workspaceId) return false
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return false
  const token = auth.slice(7)
  const atteso = generaWorkspaceToken(workspaceId)
  // Confronto timing-safe
  if (token.length !== atteso.length) return false
  const a = Buffer.from(token)
  const b = Buffer.from(atteso)
  try {
    return require('crypto').timingSafeEqual(a, b)
  } catch {
    return false
  }
}
