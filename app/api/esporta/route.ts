import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { supabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'

export async function POST(req: NextRequest) {
  const { workspace_id } = await req.json()
  if (!workspace_id) return NextResponse.json({ error: 'workspace_id mancante' }, { status: 400 })

  // Recupera il workspace per avere il google_sheet_id
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('google_sheet_id')
    .eq('id', workspace_id)
    .single()

  if (wsError || !workspace)
    return NextResponse.json({ error: 'Workspace non trovato' }, { status: 404 })

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .eq('workspace_id', workspace_id)
    .eq('stato', 'completo')
    .order('data_registrazione', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!leads || leads.length === 0)
    return NextResponse.json({ message: "Nessun lead pronto per l'export" }, { status: 200 })

  const privateKey = (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const sheetId = workspace.google_sheet_id

    const esistenti = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A1:A1',
    })
    const foglioVuoto = !esistenti.data.values || esistenti.data.values.length === 0

    const intestazione = ['Nome', 'Cognome', 'Azienda', 'Email', 'Telefono', 'Note', 'Data registrazione', 'Fase trattativa']
    const righe = (leads as Lead[]).map(l => [
      l.nome, l.cognome, l.azienda, l.email, l.telefono,
      l.note ?? '',
      new Date(l.data_registrazione).toLocaleString('it-IT'),
      'in trattativa',
    ])

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: foglioVuoto ? [intestazione, ...righe] : righe },
    })
  } catch (e: any) {
    console.error('[esporta] Google Sheets error:', e?.message)
    return NextResponse.json({ error: e?.message ?? 'Errore Google Sheets' }, { status: 500 })
  }

  const ids = (leads as Lead[]).map(l => l.id)
  await supabase.from('leads').update({ stato: 'esportato' }).in('id', ids)

  return NextResponse.json({ esportati: ids.length })
}
