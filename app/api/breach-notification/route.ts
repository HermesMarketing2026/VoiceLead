import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendMail } from '@/lib/mailer'
import { verificaAdmin } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  if (!verificaAdmin(req)) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const body = await req.json()
  const {
    workspace_ids,        // string[] — workspace selezionati (vuoto = tutti)
    descrizione,          // string — descrizione sintetica dell'incidente
    data_scoperta,        // string ISO — quando è stato scoperto
    categorie_dati,       // string[] — categorie di dati coinvolti
    misure_adottate,      // string — cosa è stato fatto/verrà fatto
    modalita_invio,       // 'preview' | 'invia'
  } = body

  if (!descrizione || !data_scoperta || !categorie_dati?.length || !misure_adottate) {
    return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 })
  }

  // Recupera i workspace coinvolti con le relative email
  let query = supabase
    .from('provisioning_tokens')
    .select('workspace_id_creato, dati_fatturazione')
    .not('workspace_id_creato', 'is', null)
    .order('creato_il', { ascending: false })

  const { data: tokens } = await query

  // Deduplica: tieni solo il token più recente per workspace
  const emailPerWorkspace = new Map<string, { email: string; nomeAzienda: string }>()
  for (const t of tokens ?? []) {
    const wsId = t.workspace_id_creato
    if (!wsId || emailPerWorkspace.has(wsId)) continue
    const email = t.dati_fatturazione?.email
    if (!email) continue
    emailPerWorkspace.set(wsId, { email, nomeAzienda: t.dati_fatturazione?.ragione_sociale ?? '' })
  }

  // Filtra per workspace selezionati (se specificati)
  const destinatari: { wsId: string; email: string; nomeAzienda: string }[] = []
  emailPerWorkspace.forEach((info, wsId) => {
    if (workspace_ids?.length && !workspace_ids.includes(wsId)) return
    destinatari.push({ wsId, ...info })
  })

  if (destinatari.length === 0) {
    return NextResponse.json({ error: 'Nessun destinatario trovato con email registrata' }, { status: 404 })
  }

  const dataLeggibile = new Date(data_scoperta).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const buildHtml = (nomeAzienda: string) => `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0;font-weight:700;color:#856404">⚠️ Notifica di violazione dei dati personali</p>
        <p style="margin:4px 0 0;font-size:13px;color:#856404">Ai sensi dell'Art. 33-34 GDPR (Reg. UE 2016/679)</p>
      </div>

      <p>Gentile Cliente${nomeAzienda ? ` di <strong>${nomeAzienda}</strong>` : ''},</p>

      <p>
        Ti informiamo che in data <strong>${dataLeggibile}</strong> abbiamo rilevato un evento che potrebbe aver
        comportato un accesso non autorizzato o una perdita di dati personali trattati nell'ambito del servizio
        VoiceLeads.
      </p>

      <h3 style="color:#ff7930;margin-top:24px">Descrizione dell'incidente</h3>
      <p>${descrizione.replace(/\n/g, '<br>')}</p>

      <h3 style="color:#ff7930;margin-top:24px">Categorie di dati coinvolti</h3>
      <ul>
        ${categorie_dati.map((c: string) => `<li>${c}</li>`).join('')}
      </ul>

      <h3 style="color:#ff7930;margin-top:24px">Misure adottate</h3>
      <p>${misure_adottate.replace(/\n/g, '<br>')}</p>

      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px 20px;margin-top:24px">
        <p style="margin:0;font-size:13px;color:#0369a1">
          <strong>I tuoi diritti:</strong> puoi richiedere ulteriori informazioni, l'accesso ai dati coinvolti o
          la cancellazione scrivendo a <a href="mailto:info@hermesmarketing.it" style="color:#0369a1">info@hermesmarketing.it</a>.
          Hai anche il diritto di presentare reclamo al Garante per la Protezione dei Dati Personali
          (<a href="https://www.garanteprivacy.it" style="color:#0369a1">garanteprivacy.it</a>).
        </p>
      </div>

      <p style="margin-top:24px">
        Ci scusiamo per qualsiasi inconveniente causato e restiamo a tua disposizione per qualsiasi chiarimento.
      </p>

      <p style="color:#666;font-size:13px;margin-top:32px;border-top:1px solid #eee;padding-top:16px">
        Hermes Marketing S.r.l.s — info@hermesmarketing.it<br>
        Piazza Gae Aulenti 1, Torre B — 20124 Milano<br>
        <a href="https://www.voiceleads.it/privacy" style="color:#999">Privacy Policy</a>
      </p>
    </div>
  `

  // Modalità preview: restituisce destinatari e anteprima email senza inviare
  if (modalita_invio === 'preview') {
    return NextResponse.json({
      destinatari: destinatari.map(d => ({ email: d.email, nomeAzienda: d.nomeAzienda })),
      anteprima_html: buildHtml(destinatari[0]?.nomeAzienda ?? ''),
    })
  }

  // Modalità invio: invia a tutti i destinatari
  const risultati: { email: string; ok: boolean; errore?: string }[] = []
  for (const d of destinatari) {
    try {
      await sendMail({
        to: d.email,
        subject: `[VoiceLeads] Notifica violazione dati personali — ${dataLeggibile}`,
        html: buildHtml(d.nomeAzienda),
      })
      risultati.push({ email: d.email, ok: true })
    } catch (e: any) {
      risultati.push({ email: d.email, ok: false, errore: e.message })
    }
  }

  // Log dell'evento nel database
  await supabase.from('breach_log').insert({
    data_scoperta,
    descrizione,
    categorie_dati,
    misure_adottate,
    workspace_ids: workspace_ids?.length ? workspace_ids : null,
    destinatari_count: destinatari.length,
    risultati,
    inviato_il: new Date().toISOString(),
  })

  return NextResponse.json({
    inviati: risultati.filter(r => r.ok).length,
    errori: risultati.filter(r => !r.ok),
  })
}
