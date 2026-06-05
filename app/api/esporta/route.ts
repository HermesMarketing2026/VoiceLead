import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { supabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'

export async function POST() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .eq('stato', 'completo')
    .order('data_registrazione', { ascending: true })

  if (error) {
    console.error('[esporta] Supabase read error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!leads || leads.length === 0)
    return NextResponse.json({ message: "Nessun lead pronto per l'export" }, { status: 200 })

  // La GOOGLE_PRIVATE_KEY può arrivare con \n letterali o con newline reali
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '')
    .replace(/\\n/g, '\n')

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const sheetId = process.env.GOOGLE_SHEET_ID!

    // Controlla quante righe esistono già per decidere se aggiungere intestazione
    const esistenti = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A1:A1',
    })
    const foglioVuoto = !esistenti.data.values || esistenti.data.values.length === 0

    const intestazione = ['Nome', 'Cognome', 'Azienda', 'Email', 'Telefono', 'Note', 'Data registrazione']
    const righe = (leads as Lead[]).map(l => [
      l.nome,
      l.cognome,
      l.azienda,
      l.email,
      l.telefono,
      l.note ?? '',
      new Date(l.data_registrazione).toLocaleString('it-IT'),
    ])

    const valori = foglioVuoto ? [intestazione, ...righe] : righe

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: valori },
    })
  } catch (e: any) {
    console.error('[esporta] Google Sheets error:', e?.message ?? e)
    return NextResponse.json(
      { error: e?.message ?? 'Errore Google Sheets', details: e?.errors ?? null },
      { status: 500 }
    )
  }

  // Aggiorna stato a 'esportato'
  const ids = (leads as Lead[]).map(l => l.id)
  const { error: updateError } = await supabase
    .from('leads')
    .update({ stato: 'esportato' })
    .in('id', ids)

  if (updateError) {
    console.error('[esporta] Supabase update error:', updateError)
    // L'export è avvenuto — segnala comunque successo parziale
    return NextResponse.json({ esportati: ids.length, avviso: 'Stato non aggiornato su Supabase' })
  }

  return NextResponse.json({ esportati: ids.length })
}
