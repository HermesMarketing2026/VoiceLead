import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret)
  } catch {
    return NextResponse.json({ error: 'Firma webhook non valida' }, { status: 400 })
  }

  // ── checkout.session.completed ──────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const m = session.metadata ?? {}

    const piano = m.piano === 'pro' ? 'registra_gestisci' : 'registra'
    const fatturazione = m.fatturazione ?? 'mensile'
    const commerciali = Number(m.commerciali ?? 1)
    const totale = Number(m.totale ?? 0)
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null

    // Crea provisioning token
    const { data: tokenData, error: tokenError } = await supabase
      .from('provisioning_tokens')
      .insert([{ piano, max_commerciali: commerciali, fatturazione }])
      .select()
      .single()

    if (tokenError || !tokenData) {
      console.error('[stripe/webhook] provisioning_token error:', tokenError)
      return NextResponse.json({ error: 'Errore creazione token' }, { status: 500 })
    }

    // Salva ordine
    await supabase.from('ordini').insert([{
      piano,
      fatturazione,
      max_commerciali: commerciali,
      totale,
      ragione_sociale: m.ragione_sociale || '—',
      partita_iva: m.partita_iva || '—',
      codice_sdi: m.codice_sdi || null,
      pec: m.pec || null,
      indirizzo: m.indirizzo || '—',
      cap: m.cap || '—',
      citta: m.citta || '—',
      provincia: m.provincia || '—',
      stato: 'verificato',
      note_verifica: `Pagamento Stripe — session ${session.id} — email: ${m.email || ''}`,
      provisioning_token_id: tokenData.id,
      stripe_session_id: session.id,
      stripe_subscription_id: subscriptionId,
    }])
  }

  // ── customer.subscription.updated ──────────────────────────────────────
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    await aggiornaStatoWorkspace(sub.id, sub.status)
  }

  // ── customer.subscription.deleted ──────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await aggiornaStatoWorkspace(sub.id, 'canceled')
  }

  return NextResponse.json({ received: true })
}

// Aggiorna stripe_subscription_status sul workspace collegato alla subscription
async function aggiornaStatoWorkspace(subscriptionId: string, status: string) {
  // Trova il workspace tramite ordini → provisioning_tokens
  const { data: ordine } = await supabase
    .from('ordini')
    .select('provisioning_token_id, stripe_subscription_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!ordine?.provisioning_token_id) return

  const { data: token } = await supabase
    .from('provisioning_tokens')
    .select('workspace_id_creato')
    .eq('id', ordine.provisioning_token_id)
    .single()

  if (!token?.workspace_id_creato) return

  await supabase
    .from('workspaces')
    .update({
      stripe_subscription_id: subscriptionId,
      stripe_subscription_status: status,
    })
    .eq('id', token.workspace_id_creato)
}
