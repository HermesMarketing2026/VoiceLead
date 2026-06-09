import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verificaTokenReset } from '@/lib/pinResetToken'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { token, nuovo_pin } = await req.json()

  if (!token || !nuovo_pin) return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
  if (!/^\d{6}$/.test(nuovo_pin)) return NextResponse.json({ error: 'Il PIN deve essere di 6 cifre numeriche' }, { status: 400 })

  const payload = verificaTokenReset(token)
  if (!payload) return NextResponse.json({ error: 'Link non valido o scaduto. Richiedi un nuovo reset.' }, { status: 401 })

  const hashed = await bcrypt.hash(nuovo_pin, 10)

  if (payload.utenteId) {
    const { error } = await supabase
      .from('utenti')
      .update({ pin: hashed })
      .eq('id', payload.utenteId)
      .eq('workspace_id', payload.workspaceId)
    if (error) return NextResponse.json({ error: 'Errore aggiornamento PIN' }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('workspaces')
      .update({ pin: hashed })
      .eq('id', payload.workspaceId)
    if (error) return NextResponse.json({ error: 'Errore aggiornamento PIN' }, { status: 500 })
  }

  // Recupera slug per redirect
  const { data: ws } = await supabase
    .from('workspaces')
    .select('slug')
    .eq('id', payload.workspaceId)
    .single()

  return NextResponse.json({ ok: true, slug: ws?.slug ?? '' })
}
