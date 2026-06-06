import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { lead_id, esito, workspace_id } = await req.json()
  if (!lead_id || !esito || !workspace_id) {
    return NextResponse.json({ error: 'lead_id, esito e workspace_id obbligatori' }, { status: 400 })
  }
  if (esito !== 'vinto' && esito !== 'perso') {
    return NextResponse.json({ error: 'esito deve essere vinto o perso' }, { status: 400 })
  }

  // Fetch lead
  const { data: lead } = await supabase.from('leads').select('*').eq('id', lead_id).single()
  if (!lead) return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 })

  const now = new Date().toISOString()
  const dataEntrata = lead.data_entrata_gestione ? new Date(lead.data_entrata_gestione) : new Date(lead.data_registrazione)
  const durata = Math.ceil((Date.now() - dataEntrata.getTime()) / (1000 * 60 * 60 * 24))

  // Fetch last aggiornamento
  const { data: ultimaAzione } = await supabase
    .from('azioni')
    .select('aggiornamento_dettato')
    .eq('lead_id', lead_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Update lead
  await supabase.from('leads').update({
    esito,
    data_esito: now,
    durata_trattativa_giorni: durata,
    in_gestione: false,
  }).eq('id', lead_id)

  // Update Google Sheets
  try {
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('google_sheet_id')
      .eq('id', workspace_id)
      .single()

    if (workspace?.google_sheet_id) {
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

      // Find lead row by email (column D)
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'D:D',
      })
      const colD = response.data.values ?? []
      const rowIndex = colD.findIndex(row => row[0] === lead.email)

      const dataEsitoFormatted = new Date(now).toLocaleString('it-IT')
      const ultimoAggiornamento = ultimaAzione?.aggiornamento_dettato ?? ''

      if (rowIndex >= 1) {
        // Update existing row: columns H-K (8-11, 1-based)
        const range = `H${rowIndex + 1}:K${rowIndex + 1}`
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[dataEsitoFormatted, esito, durata, ultimoAggiornamento]],
          },
        })
      } else {
        // Lead not in sheet: append a summary row
        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: 'A1',
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [[
              lead.nome, lead.cognome, lead.azienda, lead.email, lead.telefono,
              lead.note ?? '', new Date(lead.data_registrazione).toLocaleString('it-IT'),
              dataEsitoFormatted, esito, durata, ultimoAggiornamento,
            ]],
          },
        })
      }
    }
  } catch (e: any) {
    console.error('[gestisci/esito] Sheets error:', e?.message)
    // Non blocchiamo: l'esito è già salvato su Supabase
  }

  return NextResponse.json({ ok: true, esito, durata })
}
