'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function PagamentoForm() {
  const params = useSearchParams()
  const router = useRouter()

  const piano = params.get('piano') ?? 'pro'
  const fatturazione = params.get('fatturazione') ?? 'mensile'
  const commerciali = Number(params.get('commerciali') ?? 1)
  const totale = Number(params.get('totale') ?? 0)
  const token = params.get('token') ?? ''

  const pianoLabel = piano === 'base' ? 'Piano Base — Registra' : 'Piano Pro — Registra + Gestisci'
  const periodoLabel = fatturazione === 'mensile' ? 'mese' : 'anno'

  const causale = `VoiceLead ${piano.toUpperCase()} ${commerciali}ut ${fatturazione.slice(0, 3).toUpperCase()}`

  const [copiato, setCopiato] = useState<string | null>(null)

  const copia = (testo: string, campo: string) => {
    navigator.clipboard.writeText(testo)
    setCopiato(campo)
    setTimeout(() => setCopiato(null), 2000)
  }

  const [confermato, setConfermato] = useState(false)
  const [caricamento, setCaricamento] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)

  const prosegui = async () => {
    setCaricamento(true)
    setErrore(null)
    try {
      const pianoApi = piano === 'pro' ? 'registra_gestisci' : 'registra'
      const res = await fetch('/api/provisioning-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ piano: pianoApi, max_commerciali: commerciali }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(`/onboarding/${data.token}`)
    } catch (e: any) {
      setErrore(e.message ?? 'Errore nella creazione del workspace')
      setCaricamento(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div>
          <Link href={`/checkout?piano=${piano}`} className="text-sm text-gray-400 hover:text-gray-600">← Torna alla configurazione</Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-3">Pagamento tramite bonifico</h1>
          <p className="text-sm text-gray-500 mt-1">
            Effettua il bonifico con i dati qui sotto. Il tuo workspace sarà attivato entro 24h lavorative dalla ricezione.
          </p>
        </div>

        {/* Riepilogo ordine */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-hermes-500 uppercase tracking-wide mb-3">Riepilogo ordine</p>
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
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-1 text-base">
              <span>Totale / {periodoLabel}</span>
              <span>€{totale} + IVA</span>
            </div>
          </div>
        </div>

        {/* Dati bancari */}
        <div className="bg-white rounded-2xl border-2 border-hermes-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🏦</span>
            <p className="font-bold text-gray-900">Dati per il bonifico</p>
          </div>

          {[
            { label: 'Intestatario', valore: 'Hermes S.r.l.' },
            { label: 'IBAN', valore: 'IT00 X000 0000 0000 0000 0000 000' },
            { label: 'BIC / SWIFT', valore: 'XXXXXXXXX' },
            { label: 'Banca', valore: 'Banca Esempio' },
            { label: 'Causale', valore: causale },
          ].map(({ label, valore }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="font-semibold text-gray-900 text-sm break-all">{valore}</p>
              </div>
              <button
                onClick={() => copia(valore, label)}
                className="shrink-0 text-xs text-hermes-600 border border-hermes-300 rounded-lg px-3 py-1.5 hover:bg-hermes-50 transition-colors font-medium"
              >
                {copiato === label ? '✓ Copiato' : 'Copia'}
              </button>
            </div>
          ))}

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-2">
            <p className="text-xs text-amber-800 font-semibold">⚠️ Importante: inserisci esattamente la causale indicata</p>
            <p className="text-xs text-amber-700 mt-0.5">Permette di abbinare il pagamento al tuo ordine in modo automatico.</p>
          </div>
        </div>

        {/* Importo da versare */}
        <div className="bg-hermes-500 rounded-2xl p-5 text-white text-center shadow-md">
          <p className="text-sm font-semibold opacity-80 mb-1">Importo da versare</p>
          <p className="text-4xl font-extrabold">€{totale}</p>
          <p className="text-sm opacity-70 mt-1">+ IVA al 22% (€{(totale * 0.22).toFixed(2)})</p>
          <p className="text-xs opacity-60 mt-1">Totale con IVA: €{(totale * 1.22).toFixed(2)} / {periodoLabel}</p>
        </div>

        {/* Conferma */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confermato}
              onChange={e => setConfermato(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 text-hermes-500 focus:ring-hermes-400"
            />
            <span className="text-sm text-gray-700">
              Ho letto il riepilogo ordine e confermo di voler procedere con il bonifico bancario per attivare il mio piano VoiceLead.
            </span>
          </label>
        </div>

        {/* Pulsante temporaneo per simulazione */}
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50">
          <p className="text-xs text-gray-400 text-center mb-3 font-medium uppercase tracking-wide">— Solo per test del flusso —</p>
          {errore && (
            <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{errore}</div>
          )}
          <button
            onClick={prosegui}
            disabled={!confermato || caricamento}
            className="w-full rounded-xl bg-green-600 text-white font-bold py-4 text-base hover:bg-green-700 transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {caricamento ? '⏳ Creazione workspace…' : '✅ Ho effettuato il pagamento'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">Questo pulsante verrà rimosso una volta integrato Stripe</p>
        </div>

        <p className="text-center text-xs text-gray-400 pb-6">
          Hai domande? Scrivici a{' '}
          <a href="mailto:info@hermesai.it" className="text-hermes-500 underline">info@hermesai.it</a>
        </p>
      </div>
    </div>
  )
}

export default function PagamentoPage() {
  return <Suspense><PagamentoForm /></Suspense>
}
