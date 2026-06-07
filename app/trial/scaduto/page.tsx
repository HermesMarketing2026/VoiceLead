'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function TrialScadutoContent() {
  const params = useSearchParams()
  const slug = params.get('slug') ?? ''
  const [nLead, setNLead] = useState<number | null>(null)
  const [nomeAzienda, setNomeAzienda] = useState('')

  useEffect(() => {
    if (!slug) return
    // Recupera info workspace per mostrare n. lead
    fetch(`/api/workspace-info?slug=${slug}`)
      .then(r => r.json())
      .then(d => { if (d.nome_azienda) setNomeAzienda(d.nome_azienda) })
      .catch(() => {})
  }, [slug])

  useEffect(() => {
    if (!slug) return
    // Recupera conteggio lead (anche per workspace sospesi, la query funziona)
    fetch(`/api/leads/count?slug=${slug}`)
      .then(r => r.json())
      .then(d => { if (typeof d.count === 'number') setNLead(d.count) })
      .catch(() => {})
  }, [slug])

  return (
    <div className="min-h-screen bg-gradient-to-br from-hermes-600 via-hermes-500 to-orange-400 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-5">

        {/* Hero */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center space-y-4">
          <div className="text-5xl">⏰</div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            La tua prova gratuita è scaduta
          </h1>

          {nLead !== null && nLead > 0 ? (
            <div className="bg-hermes-50 border border-hermes-200 rounded-2xl px-5 py-4">
              <p className="text-3xl font-extrabold text-hermes-600">{nLead}</p>
              <p className="text-sm text-hermes-700 font-semibold mt-0.5">
                {nLead === 1 ? 'lead registrato' : 'lead registrati'} nel tuo workspace
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {nomeAzienda && <><strong>{nomeAzienda}</strong> — </>}
                i tuoi dati sono al sicuro. Abbonati per continuare ad accedervi.
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Abbonati per continuare a usare VoiceLeads e iniziare a registrare i tuoi lead.
            </p>
          )}

          <div className="space-y-3 pt-2">
            <Link
              href="/checkout?piano=pro"
              className="block w-full rounded-xl bg-hermes-500 text-white font-extrabold py-4 hover:bg-hermes-600 transition-colors shadow-md"
            >
              Abbonati ora — Piano Pro →
            </Link>
            <Link
              href="/checkout?piano=base"
              className="block w-full rounded-xl border-2 border-hermes-300 text-hermes-600 font-bold py-3.5 hover:bg-hermes-50 transition-colors"
            >
              Scegli Piano Base
            </Link>
          </div>
        </div>

        {/* Cosa incluso */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20 p-5 text-white space-y-3">
          <p className="text-sm font-bold">Cosa mantieni abbonandoti:</p>
          <ul className="space-y-2 text-sm text-hermes-100">
            {[
              '✓ Tutti i lead già registrati',
              '✓ Il tuo workspace configurato',
              '✓ Gli accessi dei tuoi commerciali',
              '✓ La cronologia delle trattative',
            ].map(v => <li key={v}>{v}</li>)}
          </ul>
        </div>

        <p className="text-center text-hermes-200 text-xs">
          Hai domande?{' '}
          <a href="mailto:info@hermesai.it" className="text-white underline">Contattaci</a>
        </p>
      </div>
    </div>
  )
}

export default function TrialScadutoPage() {
  return <Suspense><TrialScadutoContent /></Suspense>
}
