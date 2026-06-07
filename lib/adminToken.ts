import { createHmac } from 'crypto'

export function generaAdminToken(): string {
  const secret = process.env.CRON_SECRET ?? 'fallback'
  const pin = process.env.ADMIN_PIN ?? ''
  return createHmac('sha256', secret).update(pin).digest('hex')
}
