import { createHmac } from 'crypto'

/**
 * Genera un token admin che ruota ogni giorno.
 * Include la data corrente nel payload → token diverso ogni giorno.
 * L'admin deve ri-effettuare il login ogni 24h (sessione localStorage scade comunque dopo 24h).
 */
export function generaAdminToken(): string {
  const secret = process.env.CRON_SECRET ?? 'fallback'
  const pin = process.env.ADMIN_PIN ?? ''
  const giorno = new Date().toISOString().slice(0, 10) // YYYY-MM-DD UTC
  return createHmac('sha256', secret).update(`${pin}:${giorno}`).digest('hex')
}
