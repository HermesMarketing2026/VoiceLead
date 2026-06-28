import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICE_IDS, PianoKey } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    piano, fatturazione, commerciali, totale,
    ragione_sociale, partita_iva, email,
    codice_sdi, pec, indirizzo, cap, citta, provincia,
  } = body

  if (!piano || !fatturazione || !commerciali || !email)
    return NextResponse.json({ error: 'Campi mancanti' }, { status: 400 })

  const pianoKey = piano as PianoKey
  if (!PRICE_IDS[pianoKey])
    return NextResponse.json({ error: 'Piano non valido' }, { status: 400 })

  const priceId = PRICE_IDS[pianoKey][fatturazione as 'mensile' | 'annuale']

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://voiceleads.it'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{
      price: priceId,
      quantity: commerciali,
    }],
    customer_email: email,
    metadata: {
      piano,
      fatturazione,
      commerciali: String(commerciali),
      totale: String(totale),
      ragione_sociale: ragione_sociale ?? '',
      partita_iva: partita_iva ?? '',
      email: email ?? '',
      codice_sdi: codice_sdi ?? '',
      pec: pec ?? '',
      indirizzo: indirizzo ?? '',
      cap: cap ?? '',
      citta: citta ?? '',
      provincia: provincia ?? '',
    },
    success_url: `${baseUrl}/checkout/successo?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/checkout/fatturazione?piano=${piano}&fatturazione=${fatturazione}&commerciali=${commerciali}&totale=${totale}`,
    subscription_data: { trial_period_days: 14 },
    locale: 'it',
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: false },
  })

  return NextResponse.json({ url: session.url })
}
