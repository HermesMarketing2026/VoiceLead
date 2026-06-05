import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Endpoint pubblico — restituisce solo info non sensibili del workspace
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug mancante' }, { status: 400 })

  const { data, error } = await supabase
    .from('workspaces')
    .select('nome_azienda, nome_referente, cognome_referente, logo_url')
    .eq('slug', slug)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Non trovato' }, { status: 404 })
  return NextResponse.json(data)
}
