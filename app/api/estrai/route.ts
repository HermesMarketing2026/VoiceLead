import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const { testo } = await req.json()
  if (!testo) return NextResponse.json({ error: 'Testo mancante' }, { status: 400 })
  if (typeof testo !== 'string' || testo.length > 2000)
    return NextResponse.json({ error: 'Testo troppo lungo (max 2000 caratteri)' }, { status: 400 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurata' }, { status: 500 })
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system:
        'Sei un assistente che estrae dati di contatto da testo parlato in italiano. ' +
        'Dall\'input ricevuto estrai in JSON: nome, cognome, azienda, email, telefono, note. ' +
        'Se un campo non è presente restituisci stringa vuota. ' +
        'Rispondi solo con il JSON, nessun testo aggiuntivo.',
      messages: [{ role: 'user', content: testo }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const pulito = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const json = JSON.parse(pulito)
    return NextResponse.json(json)
  } catch (e: any) {
    console.error('[estrai] errore:', e?.message ?? e)
    return NextResponse.json({ error: e?.message ?? 'Errore Claude' }, { status: 500 })
  }
}
