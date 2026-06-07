import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { pin, slug, utente_id } = await req.json()

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
    .select('id, pin, nome_azienda, slug, logo_url, has_gestisci, sospeso')
    .eq('slug', slug)
    .single()

  if (wsError || !ws) {
    return NextResponse.json({ error: `Workspace non trovato (slug: "${slug}")` }, { status: 404 })
  }

  if (ws.sospeso) {
    return NextResponse.json({ error: 'abbonamento_scaduto' }, { status: 402 })
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
