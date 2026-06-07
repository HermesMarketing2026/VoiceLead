import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug mancante' }, { status: 400 })

  const { data: ws, error } = await supabase
    .from('workspaces')
    .select('id, nome_azienda, nome_referente, cognome_referente, logo_url, fatturazione, scadenza_il')
    .eq('slug', slug)
    .single()

  if (error || !ws) return NextResponse.json({ error: 'Non trovato' }, { status: 404 })

  // Carica utenti (solo nome — mai PIN)
  const { data: utenti } = await supabase
    .from('utenti')
    .select('id, nome, cognome, ruolo')
    .eq('workspace_id', ws.id)
    .order('creato_il', { ascending: true })

  return NextResponse.json({
    nome_azienda: ws.nome_azienda,
    nome_referente: ws.nome_referente,
    cognome_referente: ws.cognome_referente,
    logo_url: ws.logo_url,
    fatturazione: ws.fatturazione ?? null,
    scadenza_il: ws.scadenza_il ?? null,
    utenti: utenti ?? [],
  })
}
