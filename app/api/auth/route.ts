import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { pin, slug } = await req.json()

  // Login admin
  if (!slug) {
    const adminPin = process.env.ADMIN_PIN
    if (!adminPin) return NextResponse.json({ error: 'Admin PIN non configurato' }, { status: 500 })
    if (pin !== adminPin) return NextResponse.json({ error: 'PIN non corretto' }, { status: 401 })
    return NextResponse.json({ tipo: 'admin' })
  }

  // Login workspace
  const { data, error } = await supabase
    .from('workspaces')
    .select('id, pin, nome_azienda, slug')
    .eq('slug', slug)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Workspace non trovato' }, { status: 404 })
  if (pin !== data.pin) return NextResponse.json({ error: 'PIN non corretto' }, { status: 401 })

  return NextResponse.json({ tipo: 'workspace', workspaceId: data.id, nomeAzienda: data.nome_azienda })
}
