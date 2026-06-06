import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { supabase } from '@/lib/supabase'

// Cron giornaliero: sincronizza Fase trattativa per tutti i workspace
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id, google_sheet_id')
    .not('google_sheet_id', 'is', null)

  if (!workspaces || workspaces.length === 0) {
    return NextResponse.json({ ok: true, workspaces: 0 })
  }

  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const sheets = google.sheets({ version: 'v4', auth })

  let totaleAggiornati = 0

  for (const ws of workspaces) {
    try {
      const { data: leads } = await supabase
        .from('leads')
        .select('email, in_gestione, esito, data_esito, durata_trattativa_giorni')
        .eq('workspace_id', ws.id)
        .or('in_gestione.eq.true,esito.not.is.null')

      if (!leads || leads.length === 0) continue

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: ws.google_sheet_id,
        range: 'D:D',
      })
      const colD = response.data.values ?? []

      for (const lead of leads) {
        const rowIndex = colD.findIndex(row => row[0] === lead.email)
        if (rowIndex < 1) continue

        const faseTrattativa = lead.esito ?? 'in trattativa'
        const dataEsito = lead.data_esito ? new Date(lead.data_esito).toLocaleString('it-IT') : ''
        const durata = lead.durata_trattativa_giorni ?? ''

        await sheets.spreadsheets.values.update({
          spreadsheetId: ws.google_sheet_id,
          range: `H${rowIndex + 1}:J${rowIndex + 1}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[faseTrattativa, dataEsito, durata]] },
        })
        totaleAggiornati++
      }
    } catch (e: any) {
      console.error(`[cron/sync-gestisci] workspace ${ws.id}:`, e?.message)
    }
  }

  return NextResponse.json({ ok: true, aggiornati: totaleAggiornati })
}
