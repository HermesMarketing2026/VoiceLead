'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessoContent() {
  const params = useSearchParams()

  const piano = params.get('piano') ?? 'pro'
  const fatturazione = params.get('fatturazione') ?? 'mensile'
  const commerciali = Number(params.get('commerciali') ?? 1)
  const totale = Number(params.get('totale') ?? 0)
  // token generato dall'admin e passato come param (da Stripe in produzione)
  const token = params.get('token')

  const pianoLabel = piano === 'base' ? 'Piano Base — Registra' : 'Piano Pro — Registra + Gestisci'
  const periodoLabel = fatturazione === 'mensile' ? 'mese' : 'anno'

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Hero conferma */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Pagamento confermato!</h1>
          <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
            Ottimo — il tuo workspace VoiceLead è pronto per essere configurato.
          </p>
        </div>

        {/* Riepilogo ordine */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-hermes-500 uppercase tracking-wide mb-3">Il tuo ordine</p>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Piano</span>
              <span className="font-semibold">{pianoLabel}</span>
            </div>
            <div className="flex justify-between">
              <span>Commerciali</span>
              <span className="font-semibold">{commerciali} {commerciali === 1 ? 'utente' : 'utenti'}</span>
            </div>
            <div className="flex justify-between">
              <span>Fatturazione</span>
              <span className="font-semibold capitalize">{fatturazione}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-1">
              <span>Totale / {periodoLabel}</span>
              <span>€{totale} + IVA</span>
            </div>
          </div>
        </div>

        {/* CTA configurazione */}
        {token ? (
          <a
            href={`/onboarding/${token}`}
            className="block w-full text-center rounded-xl bg-hermes-500 text-white font-bold py-4 text-base hover:bg-hermes-600 transition-colors shadow-md"
          >
            Inizia la configurazione →
          </a>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
            <p className="text-2xl mb-2">⏳</p>
            <p className="font-bold text-amber-800 text-sm">Link di configurazione in arrivo</p>
            <p className="text-xs text-amber-700 mt-1">
              Riceverai il pulsante di configurazione via email a breve.
            </p>
          </div>
        )}

        {/* Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-bold text-gray-900 mb-3">Cosa troverai nella configurazione</p>
          <ul className="space-y-2">
            {[
              '🏢 Nome e dati della tua azienda',
              '👤 Dati del responsabile commerciale',
              '🎨 Personalizzazione del workspace',
              '👥 Numero di commerciali già impostato',
            ].map(v => (
              <li key={v} className="text-sm text-gray-600">{v}</li>
            ))}
          </ul>
        </div>

        <p className="text-center text-xs text-gray-400">
          Hai bisogno di aiuto? Scrivici a{' '}
          <a href="mailto:info@hermesmarketing.it" className="text-hermes-500 underline">info@hermesmarketing.it</a>
        </p>

        <div className="text-center pb-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 underline">← Torna alla home</Link>
        </div>

      </div>
    </div>
  )
}

export default function SuccessoPage() {
  return <Suspense><SuccessoContent /></Suspense>
}
