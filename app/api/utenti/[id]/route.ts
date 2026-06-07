import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verificaAdmin } from '@/lib/adminAuth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verificaAdmin(req)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const body = await req.json()
  const { nome, cognome, pin, ruolo } = body

  if (pin && (pin.length !== 6 || !/^\d+$/.test(pin))) {
    return NextResponse.json({ error: 'Il PIN deve essere di 6 cifre numeriche' }, { status: 400 })
  }

  const updates: Record<string, string> = {}
  if (nome) updates.nome = nome
  if (cognome) updates.cognome = cognome
  if (pin) updates.pin = pin
  if (ruolo) updates.ruolo = ruolo

  const { data, error } = await supabase
    .from('utenti')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verificaAdmin(req)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { error } = await supabase.from('utenti').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
