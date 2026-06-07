import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verificaAdmin } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  if (!verificaAdmin(req)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { data: workspaces, error: wsError } = await supabase
    .from('workspaces')
    .select('id, nome_azienda, slug, has_gestisci, fatturazione, scadenza_il, sospeso, creato_il')
    .order('creato_il', { ascending: false })

  if (wsError) return NextResponse.json({ error: wsError.message }, { status: 500 })

  const { data: ordini, error: ordiniError } = await supabase
    .from('ordini')
    .select('*')
    .eq('stato', 'verificato')
    .order('creato_il', { ascending: false })

  if (ordiniError) return NextResponse.json({ error: ordiniError.message }, { status: 500 })

  return NextResponse.json({ workspaces: workspaces ?? [], ordini: ordini ?? [] })
}

export async function DELETE(req: NextRequest) {
  if (!verificaAdmin(req)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id mancante' }, { status: 400 })

  const { error } = await supabase.from('ordini').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
