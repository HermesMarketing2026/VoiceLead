import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { nome_azienda, google_sheet_id, logo_url, nome_referente, cognome_referente, has_gestisci, pin } = body

  const updatePayload: Record<string, unknown> = {
    nome_azienda,
    google_sheet_id,
    logo_url: logo_url || null,
    nome_referente: nome_referente || null,
    cognome_referente: cognome_referente || null,
  }
  if (has_gestisci !== undefined) updatePayload.has_gestisci = has_gestisci
  if (pin && pin.length === 6 && /^\d+$/.test(pin)) updatePayload.pin = pin

  const { data, error } = await supabase
    .from('workspaces')
    .update(updatePayload)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
