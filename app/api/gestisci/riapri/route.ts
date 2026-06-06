import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { lead_id } = await req.json()
  if (!lead_id) return NextResponse.json({ error: 'lead_id obbligatorio' }, { status: 400 })

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
