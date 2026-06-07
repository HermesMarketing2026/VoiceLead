import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

async function tokenIdsByWorkspace(workspace_id: string): Promise<string[]> {
  const { data } = await supabase
    .from('provisioning_tokens')
    .select('id')
    .eq('workspace_id_creato', workspace_id)
  return (data ?? []).map((r: { id: string }) => r.id)
}

export async function GET(_req: NextRequest, { params }: { params: { workspace_id: string } }) {
  const { workspace_id } = params

  const { data: ws, error: wsError } = await supabase
    .from('workspaces')
    .select('id, nome_azienda, slug, has_gestisci, fatturazione, scadenza_il, sospeso, creato_il, nome_referente, cognome_referente, logo_url, settore, num_dipendenti, fatturato')
    .eq('id', workspace_id)
    .single()

  if (wsError || !ws) return NextResponse.json({ error: 'Workspace non trovato' }, { status: 404 })

  const tokenIds = await tokenIdsByWorkspace(workspace_id)

  let ordine = null
  if (tokenIds.length > 0) {
    const { data } = await supabase
      .from('ordini')
      .select('*')
      .eq('stato', 'verificato')
      .in('provisioning_token_id', tokenIds)
      .order('creato_il', { ascending: false })
      .limit(1)
      .maybeSingle()
    ordine = data ?? null
  }

  const { data: utenti } = await supabase
    .from('utenti')
    .select('id, nome, cognome, ruolo')
    .eq('workspace_id', workspace_id)
    .order('creato_il', { ascending: true })

  return NextResponse.json({ workspace: ws, ordine, utenti: utenti ?? [] })
}

export async function DELETE(_req: NextRequest, { params }: { params: { workspace_id: string } }) {
  const { workspace_id } = params
  const tokenIds = await tokenIdsByWorkspace(workspace_id)
  if (tokenIds.length === 0) return NextResponse.json({ ok: true })

  const { error } = await supabase
    .from('ordini')
    .delete()
    .in('provisioning_token_id', tokenIds)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
