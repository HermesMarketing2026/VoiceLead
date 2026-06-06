import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { supabase } from '@/lib/supabase'

// Aggiorna la colonna H (Fase trattativa) per tutti i lead del workspace
// che sono stati esportati su Sheets e sono in gestione o hanno un esito.
export async function POST(req: NextRequest) {
  const { workspace_id } = await req.json()
  if (!workspace_id) return NextResponse.json({ error: 'workspace_id obbligatorio' }, { status: 400 })

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('google_sheet_id')
    .eq('id', workspace_id)
    .single()

  if (!workspace?.google_sheet_id) {
    return NextResponse.json({ error: 'Google Sheet non configurato' }, { status: 404 })
  }

  // Tutti i lead che hanno una fase gestisci (in gestione o già chiusi)
  const { data: leads } = await supabase
    .from('leads')
    .select('email, stato_gestione, in_gestione, esito, data_esito, durata_trattativa_giorni')
    .eq('workspace_id', workspace_id)
    .or('in_gestione.eq.true,esito.not.is.null')

  if (!leads || leads.length === 0) {
    return NextResponse.json({ aggiornati: 0 })
  }

  try {
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth })
    const sheetId = workspace.google_sheet_id

    // Leggi tutta la colonna D (email) per trovare le righe
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'D:D',
    })
    const colD = response.data.values ?? []

    let aggiornati = 0
    for (const lead of leads) {
      const rowIndex = colD.findIndex(row => row[0] === lead.email)
      if (rowIndex < 1) continue // riga 0 = intestazione o non trovata

      const faseTrattativa = lead.esito ?? 'in trattativa'
      const dataEsito = lead.data_esito ? new Date(lead.data_esito).toLocaleString('it-IT') : ''
      const durata = lead.durata_trattativa_giorni ?? ''

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `H${rowIndex + 1}:J${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[faseTrattativa, dataEsito, durata]],
        },
      })
      aggiornati++
    }

    return NextResponse.json({ aggiornati })
  } catch (e: any) {
    console.error('[sync-sheets] Sheets error:', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Errore Google Sheets' }, { status: 500 })
  }
}
