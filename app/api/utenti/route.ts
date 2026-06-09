import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verificaAdmin } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const workspaceId = req.nextUrl.searchParams.get('workspace_id')
  if (!workspaceId) return NextResponse.json({ error: 'workspace_id mancante' }, { status: 400 })

  const isAdmin = req.nextUrl.searchParams.get('admin') === '1' && verificaAdmin(req)
  const fields = isAdmin ? 'id, nome, cognome, pin, ruolo, creato_il' : 'id, nome, cognome, ruolo, creato_il'

  const { data, error } = await supabase
    .from('utenti')
    .select(fields)
    .eq('workspace_id', workspaceId)
    .order('creato_il', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!verificaAdmin(req)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const body = await req.json()
  const { workspace_id, nome, cognome, pin, ruolo = 'commerciale' } = body

  if (!workspace_id || !nome || !cognome || !pin) {
    return NextResponse.json({ error: 'Campi obbligatori: workspace_id, nome, cognome, pin' }, { status: 400 })
  }
  if (pin.length !== 6 || !/^\d+$/.test(pin)) {
    return NextResponse.json({ error: 'Il PIN deve essere di 6 cifre numeriche' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('utenti')
    .insert([{ workspace_id, nome, cognome, pin, ruolo }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
