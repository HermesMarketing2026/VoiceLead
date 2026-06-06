import { NextRequest, NextResponse } from 'next/server'

// Export automatico su Google Sheets rimosso — l'export avviene via download CSV manuale.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }
  return NextResponse.json({ ok: true, message: 'Export automatico disabilitato — usa il download CSV.' })
}
