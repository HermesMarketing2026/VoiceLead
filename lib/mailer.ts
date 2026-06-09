import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // SSL porta 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

const FROM = `"${process.env.SMTP_FROM_NAME || 'VoiceLeads'}" <${process.env.SMTP_USER}>`
const ADMIN = process.env.ADMIN_EMAIL!

export async function sendMail(options: {
  to: string
  subject: string
  html: string
}) {
  return transporter.sendMail({ from: FROM, ...options })
}

// ── Notifiche cliente ────────────────────────────────────────────────────────

export async function mailBenvenutoCliente(opts: {
  to: string
  nomeAzienda: string
  email: string
}) {
  return sendMail({
    to: opts.to,
    subject: 'Benvenuto su VoiceLeads!',
    html: `
      <p>Ciao,</p>
      <p>il tuo account <strong>${opts.nomeAzienda}</strong> è stato attivato con successo.</p>
      <p>Puoi accedere a VoiceLeads da <a href="https://www.voiceleads.it">www.voiceleads.it</a>.</p>
      <br>
      <p>Il team VoiceLeads</p>
    `,
  })
}

export async function mailEsitoLead(opts: {
  to: string
  nomeLead: string
  esito: string
  note?: string
}) {
  return sendMail({
    to: opts.to,
    subject: `Lead aggiornato: ${opts.nomeLead}`,
    html: `
      <p>Il lead <strong>${opts.nomeLead}</strong> è stato aggiornato.</p>
      <p><strong>Esito:</strong> ${opts.esito}</p>
      ${opts.note ? `<p><strong>Note:</strong> ${opts.note}</p>` : ''}
      <br>
      <p>Il team VoiceLeads</p>
    `,
  })
}

// ── Notifiche admin ──────────────────────────────────────────────────────────

export async function mailAdminNuovoCliente(opts: {
  nomeAzienda: string
  email: string
  piano?: string
}) {
  return sendMail({
    to: ADMIN,
    subject: `[VoiceLeads] Nuovo cliente: ${opts.nomeAzienda}`,
    html: `
      <p><strong>Nuovo cliente registrato</strong></p>
      <ul>
        <li>Azienda: ${opts.nomeAzienda}</li>
        <li>Email: ${opts.email}</li>
        ${opts.piano ? `<li>Piano: ${opts.piano}</li>` : ''}
      </ul>
    `,
  })
}

export async function mailAdminNuovoLead(opts: {
  workspace: string
  nomeLead: string
  telefono?: string
}) {
  return sendMail({
    to: ADMIN,
    subject: `[VoiceLeads] Nuovo lead — ${opts.workspace}`,
    html: `
      <p>Nuovo lead acquisito per <strong>${opts.workspace}</strong>.</p>
      <ul>
        <li>Nome: ${opts.nomeLead}</li>
        ${opts.telefono ? `<li>Telefono: ${opts.telefono}</li>` : ''}
      </ul>
    `,
  })
}
