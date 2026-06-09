import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Cron job: cancella lead esportati da più di 60 giorni
// Eseguito ogni notte da Vercel Cron (vercel.json)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const trentaGiorniFa = new Date()
  trentaGiorniFa.setDate(trentaGiorniFa.getDate() - 60)

  // Cancella solo i lead già esportati da più di 60 giorni
  const { data, error } = await supabase
    .from('leads')
    .delete()
    .eq('stato', 'esportato')
    .lt('data_registrazione', trentaGiorniFa.toISOString())
    .select('id')

  if (error) {
    console.error('[cleanup] Errore cancellazione:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const cancellati = data?.length ?? 0
  console.log(`[cleanup] Lead esportati cancellati: ${cancellati}`)
  return NextResponse.json({ cancellati, eseguito: new Date().toISOString() })
}
