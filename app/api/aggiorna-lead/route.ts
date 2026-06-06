import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { lead_id, testo } = await req.json()
  if (!lead_id || !testo) return NextResponse.json({ error: 'lead_id e testo obbligatori' }, { status: 400 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurata' }, { status: 500 })
  }

  // Fetch current lead state
  const { data: lead } = await supabase.from('leads').select('stato_gestione').eq('id', lead_id).single()
  if (!lead) return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 })

  let parsed: { nuovoStato: string; azioneSuccessiva: string; scadenza: string | null; noteAggiornamento: string }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system:
        "Sei l'assistente di un commerciale italiano. Ricevi un aggiornamento vocale su una trattativa. " +
        "Devi restituire SOLO un JSON con questi campi: { nuovoStato: string (uno tra: nuovo/contattato/appuntamento/proposta/trattativa — lascia invariato se non cambia), " +
        "azioneSuccessiva: string (descrizione breve e concreta dell'azione da fare), " +
        "scadenza: string (data in formato ISO 8601 se menzionata esplicitamente, altrimenti null), " +
        "noteAggiornamento: string (riassunto breve dell'aggiornamento) }. " +
        `Lo stato attuale è: ${lead.stato_gestione}. ` +
        "Se la scadenza è null l'app imposterà automaticamente +3 giorni.",
      messages: [{ role: 'user', content: testo }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const pulito = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    parsed = JSON.parse(pulito)
  } catch (e: any) {
    console.error('[aggiorna-lead] Claude error:', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Errore Claude' }, { status: 500 })
  }

  // Determine scadenza
  let scadenza: string
  let scadenzaAutomatica: boolean
  if (parsed.scadenza) {
    scadenza = new Date(parsed.scadenza).toISOString()
    scadenzaAutomatica = false
  } else {
    const d = new Date()
    d.setDate(d.getDate() + 3)
    scadenza = d.toISOString()
    scadenzaAutomatica = true
  }

  // Create azione
  const { data: azione, error: azioneError } = await supabase.from('azioni').insert({
    lead_id,
    testo: parsed.azioneSuccessiva,
    scadenza,
    scadenza_automatica: scadenzaAutomatica,
    aggiornamento_dettato: testo,
  }).select().single()

  if (azioneError) {
    console.error('[aggiorna-lead] azioni insert error:', azioneError)
    return NextResponse.json({ error: azioneError.message }, { status: 500 })
  }

  // Update lead stato_gestione if changed
  const statiValidi = ['nuovo', 'contattato', 'appuntamento', 'proposta', 'trattativa']
  if (parsed.nuovoStato && statiValidi.includes(parsed.nuovoStato) && parsed.nuovoStato !== lead.stato_gestione) {
    await supabase.from('leads').update({ stato_gestione: parsed.nuovoStato }).eq('id', lead_id)
  }

  return NextResponse.json({ azione, nuovoStato: parsed.nuovoStato, noteAggiornamento: parsed.noteAggiornamento })
}
