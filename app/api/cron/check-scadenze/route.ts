import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('workspaces')
    .update({ sospeso: true })
    .lt('scadenza_il', new Date().toISOString())
    .eq('sospeso', false)
    .select('id, nome_azienda, scadenza_il')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  console.log(`[check-scadenze] Sospesi ${data?.length ?? 0} workspace`)
  return NextResponse.json({ sospesi: data?.length ?? 0, workspace: data })
}
