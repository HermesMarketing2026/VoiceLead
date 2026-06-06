import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { campiMancanti } from '@/lib/types'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()

  const mancanti = campiMancanti(body)
  const nuovoStato = mancanti.length === 0 ? 'completo' : 'bozza'

  const { data: esistente } = await supabase
    .from('leads')
    .select('stato, in_gestione, workspace_id')
    .eq('id', params.id)
    .single()

  const stato = esistente?.stato === 'esportato' ? 'esportato' : nuovoStato

  // Controlla se il workspace ha Gestisci abilitato
  let workspaceHasGestisci = false
  if (esistente?.workspace_id) {
    const { data: ws } = await supabase.from('workspaces').select('has_gestisci').eq('id', esistente.workspace_id).single()
    workspaceHasGestisci = ws?.has_gestisci ?? false
  }

  // Promuovi automaticamente in gestisci se diventa completo per la prima volta e il workspace lo supporta
  const diventaCompleto = workspaceHasGestisci && nuovoStato === 'completo' && esistente?.stato !== 'completo' && !esistente?.in_gestione
  const extraFields = diventaCompleto
    ? { in_gestione: true, data_entrata_gestione: new Date().toISOString(), stato_gestione: 'nuovo' }
    : {}

  const { data, error } = await supabase
    .from('leads')
    .update({ ...body, stato, ...extraFields })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Crea azione iniziale "Contattare il nuovo lead" quando entra in gestisci
  if (diventaCompleto) {
    const scadenza = new Date()
    scadenza.setDate(scadenza.getDate() + 3)
    await supabase.from('azioni').insert({
      lead_id: params.id,
      testo: 'Contattare il nuovo lead',
      scadenza: scadenza.toISOString(),
      scadenza_automatica: true,
    })
  }

  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase.from('leads').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
