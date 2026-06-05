'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const COOKIE_KEY = 'vl_cookie_consent'

export type CookieConsent = 'accepted' | 'rejected' | null

export function getConsent(): CookieConsent {
  if (typeof window === 'undefined') return null
  return (localStorage.getItem(COOKIE_KEY) as CookieConsent) ?? null
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!getConsent()) setVisible(true)
  }, [])

  const scegli = (scelta: 'accepted' | 'rejected') => {
    localStorage.setItem(COOKIE_KEY, scelta)
    setVisible(false)
    window.dispatchEvent(new Event('cookieConsentChanged'))
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-2xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl p-5">
        <p className="text-sm leading-relaxed mb-4">
          🍪 Questo sito usa cookie tecnici necessari al funzionamento e cookie di terze parti (Brevo) per la gestione del form di contatto.
          Leggi la nostra{' '}
          <Link href="/cookie" className="underline text-hermes-300 hover:text-hermes-200">
            Cookie Policy
          </Link>{' '}
          e la{' '}
          <Link href="/privacy" className="underline text-hermes-300 hover:text-hermes-200">
            Privacy Policy
          </Link>.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => scegli('rejected')}
            className="flex-1 rounded-xl border border-gray-600 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Rifiuta non essenziali
          </button>
          <button
            onClick={() => scegli('accepted')}
            className="flex-1 rounded-xl bg-hermes-500 py-2.5 text-sm font-semibold text-white hover:bg-hermes-600 transition-colors"
          >
            Accetta tutti
          </button>
        </div>
      </div>
    </div>
  )
}
