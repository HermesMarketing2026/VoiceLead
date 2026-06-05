import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const { imageBase64, mediaType } = await req.json()

  if (!imageBase64) return NextResponse.json({ error: 'Immagine mancante' }, { status: 400 })
  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurata' }, { status: 500 })

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system:
        'Sei un assistente che estrae dati di contatto da foto di biglietti da visita. ' +
        'Dall\'immagine ricevuta estrai in JSON: nome, cognome, azienda, email, telefono, note. ' +
        'Nel campo "note" puoi mettere informazioni aggiuntive utili (ruolo, sito web, indirizzo). ' +
        'Se un campo non è presente restituisci stringa vuota. ' +
        'Rispondi solo con il JSON, nessun testo aggiuntivo.',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType ?? 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Estrai i dati di contatto da questo biglietto da visita.',
            },
          ],
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const pulito = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const json = JSON.parse(pulito)
    return NextResponse.json(json)
  } catch (e: any) {
    console.error('[scan-card] errore:', e?.message ?? e)
    return NextResponse.json({ error: e?.message ?? 'Errore Claude Vision' }, { status: 500 })
  }
}
