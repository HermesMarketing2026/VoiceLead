import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export const PREZZI = {
  base: { mensile: 3400, annuale: 29900 },   // centesimi
  pro:  { mensile: 4900, annuale: 39900 },
} as const

export type PianoKey = keyof typeof PREZZI
