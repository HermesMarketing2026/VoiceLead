import { NextResponse } from 'next/server'

// Google Sheets rimosso — sync disabilitato
export async function POST() {
  return NextResponse.json({ aggiornati: 0 })
}
