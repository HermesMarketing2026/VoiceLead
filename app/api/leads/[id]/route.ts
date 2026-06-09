import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { campiMancanti } from '@/lib/types'
import { verificaWorkspaceToken } from '@/lib/workspaceAuth'

/** Recupera il workspace_id del lead e verifica il token della richiesta */
async function autorizza(req: NextRequest, leadId: string): Promise<string | null> {
  const { data } = await supabase
    .from('leads')
    .select('workspace_id')
    .eq('id', leadId)
    .single()
  if (!data?.workspace_id) return null
  if (!verificaWorkspaceToken(req, data.workspace_id)) return null
  return data.workspace_id
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const wsId = await autorizza(req, params.id)
  if (!wsId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const wsId = await autorizza(req, params.id)
  if (!wsId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const body = await req.json()

  const mancanti = campiMancanti(body)
  const nuovoStato = mancanti.length === 0 ? 'completo' : 'bozza'

  const { data: esistente } = await supabase
    .from('leads')
    .select('stato, in_gestione, workspace_id')
    .eq('id', params.id)
    .single()

  const stato = esistente?.stato === 'esportato' ? 'esportato' : nuovoStato

  const { data, error } = await supabase
    .from('leads')
    .update({ ...body, stato })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const wsId = await autorizza(req, params.id)
  if (!wsId) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { error } = await supabase.from('leads').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
