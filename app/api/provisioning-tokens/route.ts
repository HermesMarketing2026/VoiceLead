import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('provisioning_tokens')
    .select('*')
    .order('creato_il', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { piano, max_commerciali, fatturazione, totale, dati_fatturazione } = await req.json()

  if (!piano || !max_commerciali)
    return NextResponse.json({ error: 'Campi mancanti' }, { status: 400 })

  const { data, error } = await supabase
    .from('provisioning_tokens')
    .insert([{ piano, max_commerciali, fatturazione: fatturazione ?? null }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Se vengono passati dati di fatturazione, salva l'ordine collegato al token
  if (dati_fatturazione && totale !== undefined) {
    const { ragione_sociale, partita_iva, codice_sdi, pec, indirizzo, cap, citta, provincia } = dati_fatturazione
    const { error: ordineError } = await supabase.from('ordini').insert([{
      piano,
      fatturazione: fatturazione ?? null,
      max_commerciali,
      totale,
      ragione_sociale: ragione_sociale ?? null,
      partita_iva: partita_iva ?? null,
      codice_sdi: codice_sdi ?? null,
      pec: pec ?? null,
      indirizzo: indirizzo ?? null,
      cap: cap ?? null,
      citta: citta ?? null,
      provincia: provincia ?? null,
      stato: 'bypass',
      note_verifica: 'Bypass verifica bonifico — ordine creato manualmente',
      provisioning_token_id: data.id,
    }])
    if (ordineError) console.error('[provisioning-tokens] ordine insert error:', ordineError)
  }

  return NextResponse.json(data, { status: 201 })
}
