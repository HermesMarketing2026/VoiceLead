import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { verificaAdmin } from '@/lib/adminAuth'

// POST /api/workspaces/[id]/sospendi
// Imposta cancel_at_period_end = true su Stripe → il workspace rimane attivo fino a scadenza, poi non si rinnova
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verificaAdmin(req)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { data: ws } = await supabase
    .from('workspaces')
    .select('stripe_subscription_id, stripe_subscription_status')
    .eq('id', params.id)
    .single()

  if (!ws?.stripe_subscription_id)
    return NextResponse.json({ error: 'Nessuna subscription Stripe collegata.' }, { status: 400 })

  if (ws.stripe_subscription_status !== 'active')
    return NextResponse.json({ error: 'La subscription non è attiva.' }, { status: 400 })

  await stripe.subscriptions.update(ws.stripe_subscription_id, {
    cancel_at_period_end: true,
  })

  // Aggiorna status locale: 'canceling' per distinguerlo da 'active'
  await supabase
    .from('workspaces')
    .update({ stripe_subscription_status: 'canceling' })
    .eq('id', params.id)

  return NextResponse.json({ ok: true })
}
