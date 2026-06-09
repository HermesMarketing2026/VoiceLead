import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendMail } from '@/lib/mailer'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  // Prendi tutti i workspace con email_export valorizzata
  const { data: workspaces, error: wsError } = await supabase
    .from('workspaces')
    .select('id, nome_azienda, email_export')
    .not('email_export', 'is', null)
    .neq('email_export', '')

  if (wsError) {
    console.error('[cron/esporta] Errore fetch workspace:', wsError.message)
    return NextResponse.json({ error: wsError.message }, { status: 500 })
  }

  if (!workspaces || workspaces.length === 0) {
    return NextResponse.json({ ok: true, inviati: 0 })
  }

  const esc = (v: string | null | undefined) => {
    const s = v ?? ''
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const intestazione = ['Nome', 'Cognome', 'Azienda', 'Email', 'Telefono', 'Note', 'Data registrazione', 'Commerciale']
  const oggi = new Date().toLocaleDateString('it-IT')

  let inviati = 0
  const errori: string[] = []

  for (const ws of workspaces) {
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*, utenti(nome, cognome)')
      .eq('workspace_id', ws.id)
      .eq('stato', 'completo')
      .order('data_registrazione', { ascending: true })

    if (leadsError) {
      errori.push(`${ws.nome_azienda}: ${leadsError.message}`)
      continue
    }

    if (!leads || leads.length === 0) continue

    const righe = (leads as any[]).map(l => {
      const commerciale = l.utenti ? `${l.utenti.nome} ${l.utenti.cognome}` : ''
      return [
        esc(l.nome), esc(l.cognome), esc(l.azienda), esc(l.email), esc(l.telefono),
        esc(l.note), esc(new Date(l.data_registrazione).toLocaleString('it-IT')), esc(commerciale),
      ].join(',')
    })

    const csv = [intestazione.join(','), ...righe].join('\n')
    const nomeFile = `leads-${ws.nome_azienda.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`

    try {
      await sendMail({
        to: ws.email_export,
        subject: `[VoiceLeads] Export settimanale lead — ${oggi}`,
        html: `
          <p>Ciao,</p>
          <p>in allegato trovi l'export settimanale dei lead di <strong>${ws.nome_azienda}</strong>.</p>
          <p>Sono inclusi <strong>${leads.length} lead</strong> pronti per l'esportazione.</p>
          <p>Ricorda che i lead esportati vengono cancellati automaticamente dall'app dopo 60 giorni.</p>
          <br>
          <p>Il team VoiceLeads</p>
        `,
        attachments: [
          {
            filename: nomeFile,
            content: Buffer.from(csv, 'utf-8'),
            contentType: 'text/csv',
          },
        ],
      })

      // Segna i lead come esportati
      const ids = (leads as any[]).map(l => l.id)
      await supabase.from('leads').update({ stato: 'esportato' }).in('id', ids)

      inviati++
    } catch (e: any) {
      errori.push(`${ws.nome_azienda}: ${e.message}`)
    }
  }

  console.log(`[cron/esporta] Inviati: ${inviati}, Errori: ${errori.length}`)
  return NextResponse.json({ ok: true, inviati, errori })
}
