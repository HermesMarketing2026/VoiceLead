import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { autorizzaViaLeadId } from '@/lib/workspaceAuth'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { lead_id } = body
  if (!lead_id) return NextResponse.json({ error: 'lead_id obbligatorio' }, { status: 400 })

  const wsId = await autorizzaViaLeadId(req, lead_id)
  if (!wsId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { data, error } = await supabase
    .from('leads')
    .update({
      in_gestione: true,
      esito: null,
      data_esito: null,
      durata_trattativa_giorni: null,
    })
    .eq('id', lead_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
