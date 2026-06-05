import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { campiMancanti } from '@/lib/types'

export async function GET() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('data_registrazione', { ascending: false })

  if (error) {
    console.error('[GET /api/leads]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const mancanti = campiMancanti(body)
  const stato = mancanti.length === 0 ? 'completo' : 'bozza'

  const { data, error } = await supabase
    .from('leads')
    .insert([{ ...body, stato }])
    .select()
    .single()

  if (error) {
    console.error('[POST /api/leads]', error)
    return NextResponse.json(
      { error: error.message, details: error.details, code: error.code },
      { status: 500 }
    )
  }
  return NextResponse.json(data, { status: 201 })
}
