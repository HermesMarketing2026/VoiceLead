import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { testo } = await req.json()
  if (!testo) return NextResponse.json({ error: 'Testo mancante' }, { status: 400 })

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
  // Claude a volte avvolge il JSON in ```json ... ``` — lo puliamo
  const pulito = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try {
    const json = JSON.parse(pulito)
    return NextResponse.json(json)
  } catch {
    return NextResponse.json({ error: 'Risposta non valida da Claude', raw }, { status: 422 })
  }
}
