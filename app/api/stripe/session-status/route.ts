import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id mancante' }, { status: 400 })

  const { data } = await supabase
    .from('ordini')
    .select('provisioning_token_id, piano, fatturazione, max_commerciali, totale')
    .eq('stripe_session_id', id)
    .single()

  if (!data?.provisioning_token_id)
    return NextResponse.json({ ready: false })

  const { data: token } = await supabase
    .from('provisioning_tokens')
    .select('token')
    .eq('id', data.provisioning_token_id)
    .single()

  if (!token?.token)
    return NextResponse.json({ ready: false })

  return NextResponse.json({
    ready: true,
    token: token.token,
    piano: data.piano === 'registra_gestisci' ? 'pro' : 'base',
    fatturazione: data.fatturazione,
    commerciali: data.max_commerciali,
    totale: data.totale,
  })
}
