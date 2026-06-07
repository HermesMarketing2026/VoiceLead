import { NextRequest } from 'next/server'
import { generaAdminToken } from '@/lib/adminToken'

export function verificaAdmin(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  if (!auth) return false
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth
  return token === generaAdminToken()
}
