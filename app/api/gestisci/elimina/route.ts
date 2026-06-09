import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { autorizzaViaLeadId } from '@/lib/workspaceAuth'

// Rimuove il lead dalla gestione (non cancella il lead, solo lo toglie da gestisci)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { lead_id } = body
  if (!lead_id) return NextResponse.json({ error: 'lead_id obbligatorio' }, { status: 400 })

  const wsId = await autorizzaViaLeadId(req, lead_id)
  if (!wsId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { error } = await supabase
    .from('leads')
    .update({
      in_gestione: false,
      data_entrata_gestione: null,
      stato_gestione: 'nuovo',
      esito: null,
      data_esito: null,
      durata_trattativa_giorni: null,
    })
    .eq('id', lead_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Cancella anche le azioni associate
  await supabase.from('azioni').delete().eq('lead_id', lead_id)

  return NextResponse.json({ ok: true })
}
