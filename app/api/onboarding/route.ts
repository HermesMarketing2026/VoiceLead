import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { mailBenvenutoCliente } from '@/lib/mailer'

function calcolaScadenza(fatturazione: string | null): Date {
  const ora = new Date()
  if (fatturazione === 'prova') ora.setDate(ora.getDate() + 14)
  else if (fatturazione === 'mensile') ora.setMonth(ora.getMonth() + 1)
  else ora.setFullYear(ora.getFullYear() + 1) // annuale o manuale → 1 anno
  return ora
}

function generaSlugBase(nomeAzienda: string): string {
  return nomeAzienda
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 28)
}

async function generaSlugUnico(nomeAzienda: string): Promise<string> {
  const base = generaSlugBase(nomeAzienda)
  // Controlla collisioni e aggiunge suffisso numerico se necessario
  for (let i = 0; i < 10; i++) {
    const slug = i === 0 ? base : `${base}${i}`
    const { data } = await supabase
      .from('workspaces')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!data) return slug
  }
  // Fallback con timestamp
  return `${base}${Date.now().toString().slice(-4)}`
}


// GET: verifica validità token
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token mancante' }, { status: 400 })

  const { data, error } = await supabase
    .from('provisioning_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Token non valido' }, { status: 404 })
  if (data.usato) return NextResponse.json({ error: 'Token già utilizzato' }, { status: 410 })
  if (new Date(data.scadenza) < new Date()) return NextResponse.json({ error: 'Token scaduto' }, { status: 410 })

  return NextResponse.json({
    piano: data.piano,
    max_commerciali: data.max_commerciali,
  })
}

// POST: crea workspace + commerciali
export async function POST(req: NextRequest) {
  const {
    token,
    nome_azienda,
    nome_referente,
    cognome_referente,
    pin_referente,
    logo_url,
    fatturato,
    num_dipendenti,
    settore,
    commerciali, // Array<{ nome, cognome, pin }>
  } = await req.json()

  if (!token || !nome_azienda || !nome_referente || !cognome_referente)
    return NextResponse.json({ error: 'Campi obbligatori mancanti' }, { status: 400 })

  if (!pin_referente || !/^\d{6}$/.test(pin_referente))
    return NextResponse.json({ error: 'PIN responsabile non valido' }, { status: 400 })

  // 1. Verifica token
  const { data: tokenData, error: tokenError } = await supabase
    .from('provisioning_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (tokenError || !tokenData) return NextResponse.json({ error: 'Token non valido' }, { status: 404 })
  if (tokenData.usato) return NextResponse.json({ error: 'Token già utilizzato' }, { status: 410 })
  if (new Date(tokenData.scadenza) < new Date()) return NextResponse.json({ error: 'Token scaduto' }, { status: 410 })

  // 2. Valida numero commerciali
  if (commerciali && commerciali.length > tokenData.max_commerciali)
    return NextResponse.json({ error: `Puoi aggiungere al massimo ${tokenData.max_commerciali} commerciali` }, { status: 400 })

  // 3. Crea workspace
  const slug = await generaSlugUnico(nome_azienda)
  const pin = pin_referente

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .insert([{
      slug,
      nome_azienda,
      pin,
      logo_url: logo_url || null,
      nome_referente,
      cognome_referente,
      has_gestisci: tokenData.piano === 'registra_gestisci',
      fatturato: fatturato || null,
      num_dipendenti: num_dipendenti || null,
      settore: settore || null,
      fatturazione: tokenData.fatturazione ?? null,
      scadenza_il: calcolaScadenza(tokenData.fatturazione).toISOString(),
      sospeso: false,
    }])
    .select()
    .single()

  if (wsError) {
    console.error('[onboarding] workspace creation error:', wsError)
    return NextResponse.json({ error: wsError.message }, { status: 500 })
  }

  // 4. Crea commerciali
  if (commerciali && commerciali.length > 0) {
    const utentiDaCreare = commerciali.map((c: { nome: string; cognome: string; pin: string }) => ({
      workspace_id: workspace.id,
      nome: c.nome,
      cognome: c.cognome,
      pin: c.pin,
      ruolo: 'commerciale',
    }))

    const { error: utentiError } = await supabase.from('utenti').insert(utentiDaCreare)
    if (utentiError) {
      console.error('[onboarding] utenti creation error:', utentiError)
      // Non blocchiamo: il workspace è creato, i commerciali si possono aggiungere dopo
    }
  }

  // 5. Marca token come usato
  await supabase
    .from('provisioning_tokens')
    .update({ usato: true, workspace_id_creato: workspace.id })
    .eq('id', tokenData.id)

  // 6. Email di benvenuto (non bloccante)
  const emailCliente = tokenData.dati_fatturazione?.email
  if (emailCliente) {
    mailBenvenutoCliente({
      to: emailCliente,
      nomeAzienda: nome_azienda,
      email: emailCliente,
    }).catch(e => console.error('[onboarding] email benvenuto fallita:', e.message))
  }

  return NextResponse.json({ slug, pin }, { status: 201 })
}
