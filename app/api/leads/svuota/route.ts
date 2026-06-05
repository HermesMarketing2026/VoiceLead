import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Cancella immediatamente tutti i lead esportati di un workspace (pulizia manuale)
export async function DELETE(req: NextRequest) {
  const { workspace_id } = await req.json()
  if (!workspace_id) return NextResponse.json({ error: 'workspace_id mancante' }, { status: 400 })

  const { data, error } = await supabase
    .from('leads')
    .delete()
    .eq('workspace_id', workspace_id)
    .eq('stato', 'esportato')
    .select('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ cancellati: data?.length ?? 0 })
}
