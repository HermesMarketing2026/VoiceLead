import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { workspace_id } = await req.json()
  if (!workspace_id) return NextResponse.json({ error: 'workspace_id mancante' }, { status: 400 })

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*, utenti(nome, cognome)')
    .eq('workspace_id', workspace_id)
    .eq('stato', 'completo')
    .order('data_registrazione', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!leads || leads.length === 0)
    return NextResponse.json({ message: "Nessun lead pronto per l'export" }, { status: 200 })

  const esc = (v: string | null | undefined) => {
    const s = v ?? ''
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const intestazione = ['Nome', 'Cognome', 'Azienda', 'Email', 'Telefono', 'Note', 'Data registrazione', 'Commerciale']
  const righe = (leads as any[]).map(l => {
    const commerciale = l.utenti ? `${l.utenti.nome} ${l.utenti.cognome}` : ''
    return [
      esc(l.nome), esc(l.cognome), esc(l.azienda), esc(l.email), esc(l.telefono),
      esc(l.note), esc(new Date(l.data_registrazione).toLocaleString('it-IT')), esc(commerciale),
    ].join(',')
  })

  const csv = [intestazione.join(','), ...righe].join('\n')

  const ids = (leads as any[]).map(l => l.id)
  await supabase.from('leads').update({ stato: 'esportato' }).in('id', ids)

  const data = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${data}.csv"`,
    },
  })
}
