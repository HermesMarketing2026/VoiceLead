import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const MAX_TENTATIVI = 10
const FINESTRA_MS = 10 * 60 * 1000 // 10 minuti

async function checkRateLimit(ip: string, slug: string): Promise<boolean> {
  const ora = new Date()
  const resetAt = new Date(ora.getTime() + FINESTRA_MS)

  const { data: esistente } = await supabase
    .from('tentativi_login')
    .select('count, reset_at')
    .eq('ip', ip)
    .eq('slug', slug)
    .maybeSingle()

  if (!esistente || new Date(esistente.reset_at) < ora) {
    // Prima volta o finestra scaduta: reset
    await supabase.from('tentativi_login').upsert(
      { ip, slug, count: 1, reset_at: resetAt.toISOString() },
      { onConflict: 'ip,slug' }
    )
    return true
  }

  if (esistente.count >= MAX_TENTATIVI) return false

  await supabase
    .from('tentativi_login')
    .update({ count: esistente.count + 1 })
    .eq('ip', ip)
    .eq('slug', slug)

  return true
}

export async function POST(req: NextRequest) {
  const { pin, slug, utente_id } = await req.json()

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!await checkRateLimit(ip, slug ?? 'admin')) {
    return NextResponse.json({ error: 'Troppi tentativi. Riprova tra qualche minuto.' }, { status: 429 })
  }

  // Login admin globale (no slug)
  if (!slug) {
    const adminPin = process.env.ADMIN_PIN?.trim()
    if (!adminPin) return NextResponse.json({ error: 'Admin PIN non configurato' }, { status: 500 })
    if (pin.trim() !== adminPin) {
      console.error(`[auth] PIN mismatch — atteso: "${adminPin}" (${adminPin.length} chars), ricevuto: "${pin}" (${pin.length} chars)`)
      return NextResponse.json({ error: 'PIN non corretto' }, { status: 401 })
    }
    return NextResponse.json({ tipo: 'admin' })
  }

  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .select('id, pin, nome_azienda, slug, logo_url, has_gestisci, sospeso, fatturazione')
    .eq('slug', slug)
    .single()

  if (wsError || !ws) {
    return NextResponse.json({ error: `Workspace non trovato (slug: "${slug}")` }, { status: 404 })
  }

  if (ws.sospeso) {
    const tipo = ws.fatturazione === 'prova' ? 'trial_scaduto' : 'abbonamento_scaduto'
    return NextResponse.json({ error: tipo, slug: ws.slug }, { status: 402 })
  }

  // Login commerciale: utente_id fornito → verifica PIN utente
  if (utente_id) {
    const { data: utente, error: utenteError } = await supabase
      .from('utenti')
      .select('id, nome, cognome, pin, ruolo')
      .eq('id', utente_id)
      .eq('workspace_id', ws.id)
      .single()

    if (utenteError || !utente) return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    if (pin !== utente.pin) return NextResponse.json({ error: 'PIN non corretto' }, { status: 401 })

    return NextResponse.json({
      tipo: 'workspace',
      workspaceId: ws.id,
      nomeAzienda: ws.nome_azienda,
      logoUrl: ws.logo_url ?? '',
      hasGestisci: ws.has_gestisci ?? false,
      utenteId: utente.id,
      nomeUtente: `${utente.nome} ${utente.cognome}`,
      ruoloUtente: utente.ruolo,
    })
  }

  // Login workspace (PIN del workspace = accesso admin/referente)
  if (pin !== ws.pin) return NextResponse.json({ error: 'PIN non corretto' }, { status: 401 })

  return NextResponse.json({
    tipo: 'workspace',
    workspaceId: ws.id,
    nomeAzienda: ws.nome_azienda,
    logoUrl: ws.logo_url ?? '',
    hasGestisci: ws.has_gestisci ?? false,
    utenteId: null,
    nomeUtente: null,
    ruoloUtente: 'admin' as const,
  })
}
