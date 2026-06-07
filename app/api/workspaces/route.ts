import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verificaAdmin } from '@/lib/adminAuth'

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

export async function GET(req: NextRequest) {
  const cerca = req.nextUrl.searchParams.get('cerca')

  // Ricerca pubblica per nome azienda (usata dal form Accedi in landing)
  if (cerca) {
    const { data, error } = await supabase
      .from('workspaces')
      .select('slug, nome_azienda')
      .ilike('nome_azienda', `%${cerca}%`)
      .limit(1)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Non trovato' }, { status: 404 })
    return NextResponse.json({ slug: data.slug, nome_azienda: data.nome_azienda })
  }

  // Lista completa: solo admin
  if (!verificaAdmin(req)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('creato_il', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!verificaAdmin(req)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { nome_azienda, logo_url, nome_referente, cognome_referente, has_gestisci } = await req.json()

  if (!nome_azienda)
    return NextResponse.json({ error: 'Campi mancanti' }, { status: 400 })

  const slug = generaSlug(nome_azienda)
  const pin = generaPin()

  const { data, error } = await supabase
    .from('workspaces')
    .insert([{ slug, nome_azienda, pin, logo_url: logo_url || null, nome_referente: nome_referente || null, cognome_referente: cognome_referente || null, has_gestisci: has_gestisci ?? false }])
    .select()
    .single()

  if (error) {
    console.error('[POST /api/workspaces]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
