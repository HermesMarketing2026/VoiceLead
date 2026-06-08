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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const m = session.metadata ?? {}

    const piano = m.piano === 'pro' ? 'registra_gestisci' : 'registra'
    const fatturazione = m.fatturazione ?? 'mensile'
    const commerciali = Number(m.commerciali ?? 1)
    const totale = Number(m.totale ?? 0)

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
    }])
  }

  return NextResponse.json({ received: true })
}
