import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { lead_id, testo, workspace_id } = await req.json()
  if (!lead_id || !testo) return NextResponse.json({ error: 'lead_id e testo obbligatori' }, { status: 400 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurata' }, { status: 500 })
  }

  const { data: lead } = await supabase.from('leads').select('*').eq('id', lead_id).single()
  if (!lead) return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 })

  let parsed: {
    esito: 'vinto' | 'perso' | null
    nuovoStato: string
    azioneSuccessiva: string
    scadenza: string | null
    noteAggiornamento: string
  }

  const annoCorrente = new Date().getFullYear()

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system:
        "Sei l'assistente di un commerciale italiano. Ricevi un aggiornamento vocale su una trattativa. " +
        "PRIMA DI TUTTO valuta se l'aggiornamento indica un esito definitivo: " +
        "- Se il cliente ha detto che NON è interessato, non vuole comprare, ha rifiutato, non può, non ha budget, ha scelto un altro fornitore → esito='perso'. " +
        "- Se la trattativa è chiusa positivamente, il cliente ha acquistato, ha firmato, ha detto sì → esito='vinto'. " +
        "- In qualsiasi altro caso (follow-up, richiama, appuntamento, proposta da fare, ecc.) → esito=null. " +
        "Restituisci SOLO un JSON con questi campi: { " +
        "esito: 'vinto' | 'perso' | null, " +
        "nuovoStato: string (uno tra: nuovo/contattato/appuntamento/proposta/trattativa — lascia invariato se non cambia; ignorato se esito non è null), " +
        "azioneSuccessiva: string (se esito non è null scrivi 'Trattativa chiusa'), " +
        "scadenza: string (data ISO 8601 se menzionata esplicitamente, altrimenti null; ignorata se esito non è null), " +
        "noteAggiornamento: string (riassunto breve) }. " +
        `Stato attuale: ${lead.stato_gestione}. ` +
        `Anno corrente: ${annoCorrente}. Se viene menzionata una data senza anno (es. 'il 12 giugno', 'venerdì prossimo'), usa sempre l'anno ${annoCorrente}. ` +
        "Se scadenza è null e esito è null, l'app imposterà +3 giorni automaticamente.",
      messages: [{ role: 'user', content: testo }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const pulito = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    parsed = JSON.parse(pulito)
  } catch (e: any) {
    console.error('[aggiorna-lead] Claude error:', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Errore Claude' }, { status: 500 })
  }

  // Salva sempre l'azione come traccia nel diario
  const scadenzaAzione = new Date(); scadenzaAzione.setDate(scadenzaAzione.getDate() + 3)
  await supabase.from('azioni').insert({
    lead_id,
    testo: parsed.azioneSuccessiva || 'Trattativa chiusa',
    scadenza: scadenzaAzione.toISOString(),
    scadenza_automatica: true,
    completata: !!parsed.esito, // se esito → già completata
    aggiornamento_dettato: testo,
  })

  // Esito definitivo: chiudi la trattativa
  if (parsed.esito === 'vinto' || parsed.esito === 'perso') {
    const now = new Date().toISOString()
    const dataEntrata = lead.data_entrata_gestione ? new Date(lead.data_entrata_gestione) : new Date(lead.data_registrazione)
    const durata = Math.ceil((Date.now() - dataEntrata.getTime()) / (1000 * 60 * 60 * 24))

    await supabase.from('leads').update({
      esito: parsed.esito,
      data_esito: now,
      durata_trattativa_giorni: durata,
      in_gestione: false,
    }).eq('id', lead_id)

    // Aggiorna Google Sheets se workspace_id disponibile
    if (workspace_id) {
      try {
        const esitoRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/gestisci/esito`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lead_id, esito: parsed.esito, workspace_id, ultimoAggiornamento: testo }),
        })
        if (!esitoRes.ok) console.error('[aggiorna-lead] esito sheets error')
      } catch (e: any) {
        console.error('[aggiorna-lead] esito fetch error:', e?.message)
      }
    }

    return NextResponse.json({
      esito: parsed.esito,
      noteAggiornamento: parsed.noteAggiornamento,
      chiusaAutomaticamente: true,
    })
  }

  // Fase intermedia: aggiorna stato e crea azione con scadenza
  let scadenza: string
  let scadenzaAutomatica: boolean
  if (parsed.scadenza) {
    const d = new Date(parsed.scadenza)
    // Se la data è già passata, spostala all'anno prossimo
    if (d.getTime() < Date.now()) {
      d.setFullYear(d.getFullYear() + 1)
    }
    scadenza = d.toISOString()
    scadenzaAutomatica = false
  } else {
    const d = new Date(); d.setDate(d.getDate() + 3)
    scadenza = d.toISOString()
    scadenzaAutomatica = true
  }

  const { data: azione } = await supabase.from('azioni').insert({
    lead_id,
    testo: parsed.azioneSuccessiva,
    scadenza,
    scadenza_automatica: scadenzaAutomatica,
    aggiornamento_dettato: testo,
  }).select().single()

  const statiValidi = ['nuovo', 'contattato', 'appuntamento', 'proposta', 'trattativa']
  if (parsed.nuovoStato && statiValidi.includes(parsed.nuovoStato) && parsed.nuovoStato !== lead.stato_gestione) {
    await supabase.from('leads').update({ stato_gestione: parsed.nuovoStato }).eq('id', lead_id)
  }

  return NextResponse.json({ azione, nuovoStato: parsed.nuovoStato, noteAggiornamento: parsed.noteAggiornamento })
}
