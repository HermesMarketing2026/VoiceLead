import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generaTokenReset } from '@/lib/pinResetToken'
import { sendMail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  const { slug, utente_id } = await req.json()
  if (!slug) return NextResponse.json({ error: 'slug mancante' }, { status: 400 })

  const { data: ws } = await supabase
    .from('workspaces')
    .select('id, nome_azienda, slug')
    .eq('slug', slug)
    .single()

  if (!ws) return NextResponse.json({ error: 'Workspace non trovato' }, { status: 404 })

  // Email del responsabile da provisioning_tokens.dati_fatturazione
  const { data: pt } = await supabase
    .from('provisioning_tokens')
    .select('dati_fatturazione')
    .eq('workspace_id_creato', ws.id)
    .order('creato_il', { ascending: false })
    .limit(1)
    .maybeSingle()

  const email: string | undefined = pt?.dati_fatturazione?.email
  if (!email) {
    return NextResponse.json(
      { error: 'Email non trovata. Contatta il tuo responsabile direttamente.' },
      { status: 404 }
    )
  }

  let nomePersona = 'il responsabile'
  if (utente_id) {
    const { data: utente } = await supabase
      .from('utenti')
      .select('nome, cognome')
      .eq('id', utente_id)
      .eq('workspace_id', ws.id)
      .single()
    if (utente) nomePersona = `${utente.nome} ${utente.cognome}`
  }

  const token = generaTokenReset(ws.id, utente_id ?? null)
  const resetUrl = `https://${ws.slug}.voiceleads.it/reset-pin?token=${token}`

  await sendMail({
    to: email,
    subject: `Reset PIN VoiceLeads — ${ws.nome_azienda}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#ff7930">Reset PIN VoiceLeads</h2>
        <p>Ciao,</p>
        <p>è stata richiesta la reimpostazione del PIN per <strong>${nomePersona}</strong> su <strong>${ws.nome_azienda}</strong>.</p>
        <p style="margin:24px 0">
          <a href="${resetUrl}"
             style="background:linear-gradient(135deg,#ff7930,#ff4500);color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:700;display:inline-block">
            Reimposta PIN →
          </a>
        </p>
        <p style="color:#999;font-size:13px">Il link è valido per 1 ora. Se non hai richiesto questo reset, ignora questa email.</p>
        <p style="color:#999;font-size:12px">Il team VoiceLeads</p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
