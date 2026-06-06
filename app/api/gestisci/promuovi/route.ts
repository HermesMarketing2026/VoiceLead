import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { lead_id } = await req.json()
  if (!lead_id) return NextResponse.json({ error: 'lead_id obbligatorio' }, { status: 400 })

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('leads')
    .update({
      in_gestione: true,
      data_entrata_gestione: now,
      stato_gestione: 'nuovo',
    })
    .eq('id', lead_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Crea azione iniziale
  const scadenza = new Date()
  scadenza.setDate(scadenza.getDate() + 3)
  await supabase.from('azioni').insert({
    lead_id,
    testo: 'Contattare il nuovo lead',
    scadenza: scadenza.toISOString(),
    scadenza_automatica: true,
  })

  return NextResponse.json(data)
}
