import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export const PRICE_IDS = {
  base: {
    mensile: 'price_1TnFQWCdyeEdZPVOXyEVhxkb',
    annuale: 'price_1TnFQWCdyeEdZPVOBrMdpVy9',
  },
  pro: {
    mensile: 'price_1TnFRACdyeEdZPVORnh5DgkF',
    annuale: 'price_1TnFRACdyeEdZPVOnwXWWG68',
  },
} as const

export type PianoKey = keyof typeof PRICE_IDS
