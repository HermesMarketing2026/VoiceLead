import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { supabase } from '@/lib/supabase'
import type { Lead, Workspace } from '@/lib/types'

export async function GET(req: NextRequest) {
  // Sicurezza: solo Vercel Cron può chiamare questa route
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  // Recupera tutti i workspace
  const { data: workspaces, error: wsError } = await supabase
    .from('workspaces')
    .select('*')

  if (wsError || !workspaces) {
    return NextResponse.json({ error: wsError?.message }, { status: 500 })
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

  const risultati: { workspace: string; esportati: number }[] = []

  for (const ws of workspaces as Workspace[]) {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('workspace_id', ws.id)
      .eq('stato', 'completo')

    if (error || !leads || leads.length === 0) continue

    try {
      const esistenti = await sheets.spreadsheets.values.get({
        spreadsheetId: ws.google_sheet_id,
        range: 'A1:A1',
      })
      const foglioVuoto = !esistenti.data.values || esistenti.data.values.length === 0

      const intestazione = ['Nome', 'Cognome', 'Azienda', 'Email', 'Telefono', 'Note', 'Data registrazione']
      const righe = (leads as Lead[]).map(l => [
        l.nome, l.cognome, l.azienda, l.email, l.telefono,
        l.note ?? '',
        new Date(l.data_registrazione).toLocaleString('it-IT'),
      ])

      await sheets.spreadsheets.values.append({
        spreadsheetId: ws.google_sheet_id,
        range: 'A1',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: foglioVuoto ? [intestazione, ...righe] : righe },
      })

      const ids = (leads as Lead[]).map(l => l.id)
      await supabase.from('leads').update({ stato: 'esportato' }).in('id', ids)
      risultati.push({ workspace: ws.nome_azienda, esportati: ids.length })
    } catch (e: any) {
      console.error(`[cron] errore workspace ${ws.nome_azienda}:`, e?.message)
    }
  }

  console.log('[cron] esportazione completata:', risultati)
  return NextResponse.json({ ok: true, risultati })
}
