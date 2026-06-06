import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function generaPin(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function generaSlug(nomeAzienda: string): string {
  return nomeAzienda
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // rimuove accenti
    .replace(/[^a-z0-9]/g, '') // rimuove tutto tranne lettere e numeri
    .substring(0, 30)
}

export async function GET() {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('creato_il', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { nome_azienda, google_sheet_id, logo_url, nome_referente, cognome_referente, has_gestisci } = await req.json()

  if (!nome_azienda || !google_sheet_id)
    return NextResponse.json({ error: 'Campi mancanti' }, { status: 400 })

  const slug = generaSlug(nome_azienda)
  const pin = generaPin()

  const { data, error } = await supabase
    .from('workspaces')
    .insert([{ slug, nome_azienda, google_sheet_id, pin, logo_url: logo_url || null, nome_referente: nome_referente || null, cognome_referente: cognome_referente || null, has_gestisci: has_gestisci ?? false }])
    .select()
    .single()

  if (error) {
    console.error('[POST /api/workspaces]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
