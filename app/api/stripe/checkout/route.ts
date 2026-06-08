import { NextRequest, NextResponse } from 'next/server'
import { stripe, PREZZI, PianoKey } from '@/lib/stripe'

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
  if (!PREZZI[pianoKey])
    return NextResponse.json({ error: 'Piano non valido' }, { status: 400 })

  const prezzoUnitario = PREZZI[pianoKey][fatturazione as 'mensile' | 'annuale']
  const nomeComm = commerciali === 1 ? '1 commerciale' : `${commerciali} commerciali`
  const nomePiano = piano === 'pro' ? 'Piano Pro — Registra + Gestisci' : 'Piano Base — Registra'
  const interval = fatturazione === 'mensile' ? 'month' : 'year'

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://voiceleads.it'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{
      quantity: commerciali,
      price_data: {
        currency: 'eur',
        unit_amount: prezzoUnitario,
        product_data: {
          name: nomePiano,
          description: `VoiceLead ${nomePiano} — ${nomeComm}`,
        },
        recurring: { interval },
      },
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
    locale: 'it',
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: false },
  })

  return NextResponse.json({ url: session.url })
}
