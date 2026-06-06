import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('provisioning_tokens')
    .select('*')
    .order('creato_il', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { piano, max_commerciali } = await req.json()

  if (!piano || !max_commerciali)
    return NextResponse.json({ error: 'Campi mancanti' }, { status: 400 })

  const { data, error } = await supabase
    .from('provisioning_tokens')
    .insert([{ piano, max_commerciali }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
