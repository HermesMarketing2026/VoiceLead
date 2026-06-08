import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lead_id = searchParams.get('lead_id')
  const workspace_id = searchParams.get('workspace_id')

  if (lead_id) {
    const { data, error } = await supabase
      .from('azioni')
      .select('*')
      .eq('lead_id', lead_id)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  }

  // Count azioni scadute/oggi per workspace (per counter home)
  if (workspace_id) {
    const oggi = new Date()
    oggi.setHours(23, 59, 59, 999)
    const { data, error } = await supabase
      .from('azioni')
      .select('lead_id, leads!inner(workspace_id, in_gestione)')
      .eq('leads.workspace_id', workspace_id)
      .eq('leads.in_gestione', true)
      .eq('completata', false)
      .lte('scadenza', oggi.toISOString())
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    // Deduplicate by lead_id
    const uniqueLeads = new Set((data ?? []).map((a: any) => a.lead_id))
    return NextResponse.json({ count: uniqueLeads.size })
  }

  return NextResponse.json({ error: 'lead_id o workspace_id obbligatorio' }, { status: 400 })
}

export async function PATCH(req: NextRequest) {
  const { id, completata, scadenza, scadenza_automatica } = await req.json()
  if (!id) return NextResponse.json({ error: 'id obbligatorio' }, { status: 400 })

  const update: Record<string, unknown> = {}

  if (completata !== undefined) {
    update.completata = completata
    update.data_completamento = completata ? new Date().toISOString() : null
  }
  if (scadenza !== undefined) update.scadenza = scadenza
  if (scadenza_automatica !== undefined) update.scadenza_automatica = scadenza_automatica

  const { data, error } = await supabase.from('azioni').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
