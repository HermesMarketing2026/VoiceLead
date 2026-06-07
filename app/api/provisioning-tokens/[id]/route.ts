import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { verificaAdmin } from '@/lib/adminAuth'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verificaAdmin(req)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })

  const { error } = await supabase
    .from('provisioning_tokens')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
