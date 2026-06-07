import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  // Workspace con info abbonamento
  const { data: workspaces, error: wsError } = await supabase
    .from('workspaces')
    .select('id, nome_azienda, slug, has_gestisci, fatturazione, scadenza_il, sospeso, creato_il')
    .order('creato_il', { ascending: false })

  if (wsError) return NextResponse.json({ error: wsError.message }, { status: 500 })

  // Ordini verificati con dati fatturazione
  const { data: ordini, error: ordiniError } = await supabase
    .from('ordini')
    .select('*')
    .eq('stato', 'verificato')
    .order('creato_il', { ascending: false })

  if (ordiniError) return NextResponse.json({ error: ordiniError.message }, { status: 500 })

  return NextResponse.json({ workspaces: workspaces ?? [], ordini: ordini ?? [] })
}
