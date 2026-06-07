import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const IBAN_HERMES = 'IT00 X000 0000 0000 0000 0000 000' // ← sostituisci con IBAN reale

function normalizzaIban(s: string) {
  return s.replace(/\s/g, '').toUpperCase()
}

function normalizzaImporto(s: string | number): number {
  if (typeof s === 'number') return s
  return parseFloat(String(s).replace(',', '.').replace(/[^\d.]/g, ''))
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()

    const file = form.get('file') as File | null
    const piano = form.get('piano') as string
    const fatturazione = form.get('fatturazione') as string
    const commerciali = Number(form.get('commerciali'))
    const totale = Number(form.get('totale'))
    const dati_fatturazione = JSON.parse(form.get('dati_fatturazione') as string)

    if (!file) return NextResponse.json({ error: 'File mancante' }, { status: 400 })

    // Costruisci la causale attesa
    const pianoLabel = piano === 'pro' ? 'PRO' : 'BASE'
    const fattLabel = fatturazione === 'mensile' ? 'MEN' : 'ANN'
    const causaleAttesa = `VoiceLead ${pianoLabel} ${commerciali}ut ${fattLabel}`

    // Converti file in base64
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const isImage = file.type.startsWith('image/')
    const mediaType = isImage ? file.type as 'image/jpeg' | 'image/png' | 'image/webp' : 'application/pdf'

    // Chiedi a Claude di estrarre i dati dalla ricevuta
    const contentBlock = isImage
      ? { type: 'image' as const, source: { type: 'base64' as const, media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp', data: base64 } }
      : { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64 } }

    const risposta = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          contentBlock,
          {
            type: 'text',
            text: `Analizza questa ricevuta di bonifico bancario.
Estrai questi tre valori e rispondi SOLO con un oggetto JSON valido, senza testo aggiuntivo:
{
  "importo": <numero con decimali, es: 147.00>,
  "iban_destinatario": <stringa IBAN del destinatario, senza spazi>,
  "causale": <stringa causale del bonifico>
}
Se un campo non è leggibile, metti null.`,
          }
        ],
      }],
    })

    const testo = risposta.content[0].type === 'text' ? risposta.content[0].text : ''
    let estratto: { importo: number | null; iban_destinatario: string | null; causale: string | null }

    try {
      const jsonMatch = testo.match(/\{[\s\S]*\}/)
      estratto = jsonMatch ? JSON.parse(jsonMatch[0]) : { importo: null, iban_destinatario: null, causale: null }
    } catch {
      estratto = { importo: null, iban_destinatario: null, causale: null }
    }

    // Valida
    const errori: string[] = []

    const importoRicevuta = estratto.importo !== null ? normalizzaImporto(estratto.importo) : null
    if (importoRicevuta === null) {
      errori.push('Non riesco a leggere l\'importo dalla ricevuta.')
    } else if (Math.abs(importoRicevuta - totale) > 0.5) {
      errori.push(`Importo non corretto: trovato €${importoRicevuta.toFixed(2)}, atteso €${totale.toFixed(2)}.`)
    }

    const ibanRicevuta = estratto.iban_destinatario ? normalizzaIban(estratto.iban_destinatario) : null
    if (ibanRicevuta === null) {
      errori.push('Non riesco a leggere l\'IBAN destinatario dalla ricevuta.')
    } else if (ibanRicevuta !== normalizzaIban(IBAN_HERMES)) {
      errori.push(`IBAN destinatario non corretto: trovato ${ibanRicevuta}.`)
    }

    if (!estratto.causale) {
      errori.push('Non riesco a leggere la causale dalla ricevuta.')
    } else if (!estratto.causale.toLowerCase().includes('voicelead')) {
      errori.push(`Causale non corretta: trovato "${estratto.causale}". La causale deve contenere "${causaleAttesa}".`)
    }

    const noteVerifica = errori.length === 0
      ? `OK — importo: €${importoRicevuta}, IBAN: ${ibanRicevuta}, causale: ${estratto.causale}`
      : errori.join(' ')

    if (errori.length > 0) {
      // Salva ordine come fallito per storico
      await supabase.from('ordini').insert([{
        piano: piano === 'pro' ? 'registra_gestisci' : 'registra',
        fatturazione,
        max_commerciali: commerciali,
        totale,
        ...dati_fatturazione,
        stato: 'fallito',
        note_verifica: noteVerifica,
      }])
      return NextResponse.json({ ok: false, errori, estratto }, { status: 422 })
    }

    // Crea provisioning token
    const { data: tokenData, error: tokenError } = await supabase
      .from('provisioning_tokens')
      .insert([{
        piano: piano === 'pro' ? 'registra_gestisci' : 'registra',
        max_commerciali: commerciali,
        fatturazione,
      }])
      .select()
      .single()

    if (tokenError) throw new Error(tokenError.message)

    // Salva ordine verificato
    await supabase.from('ordini').insert([{
      piano: piano === 'pro' ? 'registra_gestisci' : 'registra',
      fatturazione,
      max_commerciali: commerciali,
      totale,
      ...dati_fatturazione,
      stato: 'verificato',
      note_verifica: noteVerifica,
      provisioning_token_id: tokenData.id,
    }])

    return NextResponse.json({ ok: true, token: tokenData.token })
  } catch (e: any) {
    console.error('verifica-bonifico:', e)
    return NextResponse.json({ error: e.message ?? 'Errore interno' }, { status: 500 })
  }
}
