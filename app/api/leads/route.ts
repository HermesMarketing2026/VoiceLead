import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { campiMancanti } from '@/lib/types'

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get('workspace_id')
  const utenteId = req.nextUrl.searchParams.get('utente_id')
  if (!workspaceId) return NextResponse.json({ error: 'workspace_id mancante' }, { status: 400 })

  let query = supabase
    .from('leads')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('data_registrazione', { ascending: false })

  if (utenteId) query = query.eq('utente_id', utenteId)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { workspace_id } = body

  if (!workspace_id) return NextResponse.json({ error: 'workspace_id mancante' }, { status: 400 })

  const mancanti = campiMancanti(body)
  const stato = mancanti.length === 0 ? 'completo' : 'bozza'

  const { data, error } = await supabase
    .from('leads')
    .insert([{ ...body, stato }])
    .select()
    .single()

  if (error) {
    console.error('[POST /api/leads]', error)
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
