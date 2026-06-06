import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { lead_id, esito, workspace_id } = await req.json()
  if (!lead_id || !esito || !workspace_id) {
    return NextResponse.json({ error: 'lead_id, esito e workspace_id obbligatori' }, { status: 400 })
  }
  if (esito !== 'vinto' && esito !== 'perso') {
    return NextResponse.json({ error: 'esito deve essere vinto o perso' }, { status: 400 })
  }

  const { data: lead } = await supabase.from('leads').select('*').eq('id', lead_id).single()
  if (!lead) return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 })

  const now = new Date().toISOString()
  const dataEntrata = lead.data_entrata_gestione ? new Date(lead.data_entrata_gestione) : new Date(lead.data_registrazione)
  const durata = Math.ceil((Date.now() - dataEntrata.getTime()) / (1000 * 60 * 60 * 24))

  await supabase.from('leads').update({
    esito,
    data_esito: now,
    durata_trattativa_giorni: durata,
    in_gestione: false,
  }).eq('id', lead_id)

  return NextResponse.json({ ok: true, esito, durata })
}
