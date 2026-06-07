import { NextRequest, NextResponse } from 'next/server'

// Google Sheets rimosso — sync disabilitato
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  return NextResponse.json({ ok: true, message: 'Sync Google Sheets disabilitato.' })
}
