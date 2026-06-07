'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const PIANI = {
  base: {
    nome: 'Piano Base',
    sottotitolo: 'Registra',
    emoji: '🎙️',
    mensile: 34,
    annuale: 299,
    features: [
      '🎙️ Dettatura vocale in italiano',
      '📷 Scansione biglietto da visita',
      '🤖 Estrazione dati AI automatica',
      '📥 Export CSV quando vuoi',
      '👥 Accessi multi-commerciale',
      '🔑 Pannello responsabile incluso',
      '🔒 Cancellazione automatica 30gg',
    ],
  },
  pro: {
    nome: 'Piano Pro',
    sottotitolo: 'Registra + Gestisci',
    emoji: '📋',
    mensile: 49,
    annuale: 399,
    features: [
      '✅ Tutto il Piano Base incluso',
      '📋 Dashboard trattative con stati',
      '🎙️ Aggiornamenti vocali sulla trattativa',
      '⏰ Reminder intelligenti con scadenza AI',
      '🏆 Chiusura vinto/perso con un dettato',
      '📊 Storico trattative per commerciale',
    ],
  },
}

function CheckoutForm() {
  const params = useSearchParams()
  const router = useRouter()
  const pianoKey = (params.get('piano') ?? 'pro') as 'base' | 'pro'
  const piano = PIANI[pianoKey] ?? PIANI.pro
  const token = params.get('token') ?? ''

  const [fatturazione, setFatturazione] = useState<'mensile' | 'annuale'>('mensile')
  const [commerciali, setCommerciali] = useState(1)

  const prezzoUnitario = fatturazione === 'mensile' ? piano.mensile : piano.annuale
  const totale = prezzoUnitario * commerciali
  const periodoLabel = fatturazione === 'mensile' ? 'mese' : 'anno'

  const vai = () => {
    const qs = new URLSearchParams({
      piano: pianoKey,
      fatturazione,
      commerciali: String(commerciali),
      totale: String(totale),
      ...(token ? { token } : {}),
    })
    router.push(`/checkout/fatturazione?${qs}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div>
          <Link href="/#prezzi" className="text-sm text-gray-400 hover:text-gray-600">← Torna ai piani</Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-3">Configura il tuo piano</h1>
          <p className="text-sm text-gray-500 mt-1">Scegli la fatturazione e il numero di commerciali.</p>
        </div>

        {/* Piano selezionato */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-hermes-100 flex items-center justify-center text-xl">{piano.emoji}</div>
            <div>
              <p className="text-xs font-bold text-hermes-500 uppercase tracking-wide">{piano.nome}</p>
              <p className="font-extrabold text-gray-900">{piano.sottotitolo}</p>
            </div>
            <Link href="/#prezzi" className="ml-auto text-xs text-gray-400 underline hover:text-gray-600">Cambia piano</Link>
          </div>
          <ul className="mt-4 space-y-2">
            {piano.features.map(f => (
              <li key={f} className="text-sm text-gray-600">{f}</li>
            ))}
          </ul>
        </div>

        {/* Toggle fatturazione */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Fatturazione</p>
          <div className="flex gap-3">
            {(['mensile', 'annuale'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFatturazione(f)}
                className={`flex-1 rounded-xl border-2 py-3 text-sm font-bold transition-all ${
                  fatturazione === f
                    ? 'border-hermes-400 bg-hermes-50 text-hermes-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {f === 'mensile' ? 'Mensile' : (
                  <span className="flex flex-col items-center leading-tight">
                    <span>Annuale</span>
                    <span className="text-xs font-normal text-green-600 mt-0.5">Risparmia fino al 32%</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Numero commerciali */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-1">Numero di commerciali</p>
          <p className="text-xs text-gray-400 mb-4">Il responsabile non conta — accede gratuitamente.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCommerciali(c => Math.max(1, c - 1))}
              className="w-10 h-10 rounded-full border-2 border-gray-200 text-xl font-bold text-gray-600 hover:border-hermes-400 hover:text-hermes-600 transition-all flex items-center justify-center"
            >−</button>
            <span className="text-3xl font-extrabold text-gray-900 w-12 text-center">{commerciali}</span>
            <button
              onClick={() => setCommerciali(c => c + 1)}
              className="w-10 h-10 rounded-full border-2 border-gray-200 text-xl font-bold text-gray-600 hover:border-hermes-400 hover:text-hermes-600 transition-all flex items-center justify-center"
            >+</button>
            <span className="text-sm text-gray-500 ml-1">
              {commerciali === 1 ? 'commerciale' : 'commerciali'}
            </span>
          </div>
        </div>

        {/* Riepilogo prezzo */}
        <div className="bg-hermes-50 rounded-2xl border border-hermes-200 p-5">
          <p className="text-sm font-semibold text-hermes-700 mb-3">Riepilogo ordine</p>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>{piano.nome} × {commerciali} {commerciali === 1 ? 'utente' : 'utenti'}</span>
              <span>€{prezzoUnitario} × {commerciali}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-hermes-200 pt-2 mt-2">
              <span>Totale / {periodoLabel}</span>
              <span>€{totale}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">IVA esclusa. Fattura emessa da Hermes S.r.l.</p>
        </div>

        {/* CTA */}
        <button
          onClick={vai}
          className="w-full rounded-xl bg-hermes-500 text-white font-bold py-4 text-base hover:bg-hermes-600 transition-colors shadow-md"
        >
          Continua →
        </button>

        <p className="text-center text-xs text-gray-400">
          Nessun addebito automatico senza conferma. Pagamento tramite bonifico bancario.
        </p>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return <Suspense><CheckoutForm /></Suspense>
}
