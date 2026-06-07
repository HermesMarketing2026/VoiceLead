'use client'
import { useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function PagamentoForm() {
  const params = useSearchParams()
  const router = useRouter()

  const piano = params.get('piano') ?? 'pro'
  const fatturazione = params.get('fatturazione') ?? 'mensile'
  const commerciali = Number(params.get('commerciali') ?? 1)
  const totale = Number(params.get('totale') ?? 0)

  const pianoLabel = piano === 'base' ? 'Piano Base — Registra' : 'Piano Pro — Registra + Gestisci'
  const periodoLabel = fatturazione === 'mensile' ? 'mese' : 'anno'
  const causale = `VoiceLead ${piano.toUpperCase()} ${commerciali}ut ${fatturazione.slice(0, 3).toUpperCase()}`

  const [copiato, setCopiato] = useState<string | null>(null)
  const [bypass, setBypass] = useState(false)
  const [bypassPin, setBypassPin] = useState('')
  const [bypassErrore, setBypassErrore] = useState(false)
  const [bypassLoading, setBypassLoading] = useState(false)

  const saltoVerifica = async () => {
    setBypassLoading(true)
    try {
      const pianoApi = piano === 'pro' ? 'registra_gestisci' : 'registra'
      const datiFatturazione = (() => {
        try { return JSON.parse(sessionStorage.getItem('voicelead_fatturazione') ?? '{}') }
        catch { return {} }
      })()
      const res = await fetch('/api/provisioning-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          piano: pianoApi,
          max_commerciali: commerciali,
          fatturazione,
          totale,
          dati_fatturazione: datiFatturazione,
          bypass_pin: bypassPin,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBypassErrore(true)
        setBypassPin('')
        setBypassLoading(false)
        return
      }
      router.push(`/onboarding/${data.token}`)
    } catch {
      setBypassLoading(false)
    }
  }
  const copia = (testo: string, campo: string) => {
    navigator.clipboard.writeText(testo)
    setCopiato(campo)
    setTimeout(() => setCopiato(null), 2000)
  }

  // Upload ricevuta
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [stato, setStato] = useState<'idle' | 'verifica' | 'errore' | 'ok'>('idle')
  const [errori, setErrori] = useState<string[]>([])

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setStato('idle'); setErrori([]) }
  }

  const verifica = async () => {
    if (!file) return
    setStato('verifica')
    setErrori([])

    const datiFatturazione = (() => {
      try { return JSON.parse(sessionStorage.getItem('voicelead_fatturazione') ?? '{}') }
      catch { return {} }
    })()

    const form = new FormData()
    form.append('file', file)
    form.append('piano', piano)
    form.append('fatturazione', fatturazione)
    form.append('commerciali', String(commerciali))
    form.append('totale', String(totale))
    form.append('dati_fatturazione', JSON.stringify(datiFatturazione))

    try {
      const res = await fetch('/api/checkout/verifica-bonifico', { method: 'POST', body: form })
      const data = await res.json()
      if (data.ok) {
        setStato('ok')
        setTimeout(() => router.push(`/onboarding/${data.token}`), 1200)
      } else {
        setStato('errore')
        setErrori(data.errori ?? [data.error ?? 'Errore sconosciuto'])
      }
    } catch {
      setStato('errore')
      setErrori(['Errore di connessione. Riprova.'])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div>
          <Link href={`/checkout/fatturazione?piano=${piano}&fatturazione=${fatturazione}&commerciali=${commerciali}&totale=${totale}`} className="text-sm text-gray-400 hover:text-gray-600">
            ← Torna ai dati di fatturazione
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-3">Pagamento tramite bonifico</h1>
          <p className="text-sm text-gray-500 mt-1">
            Effettua il bonifico, poi carica la ricevuta qui sotto per attivare subito il tuo workspace.
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
            { label: 'Intestatario', valore: 'Hermes Marketing S.r.l.s' },
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
            <p className="text-xs text-amber-800 font-semibold">⚠️ Inserisci esattamente la causale indicata</p>
            <p className="text-xs text-amber-700 mt-0.5">Permette di verificare il pagamento in automatico.</p>
          </div>
        </div>

        {/* Importo */}
        <div className="bg-hermes-500 rounded-2xl p-5 text-white text-center shadow-md">
          <p className="text-sm font-semibold opacity-80 mb-1">Importo da versare</p>
          <p className="text-4xl font-extrabold">€{totale}</p>
          <p className="text-sm opacity-70 mt-1">+ IVA al 22% (€{(totale * 0.22).toFixed(2)})</p>
          <p className="text-xs opacity-60 mt-1">Totale con IVA: €{(totale * 1.22).toFixed(2)} / {periodoLabel}</p>
        </div>

        {/* Upload ricevuta */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm space-y-4">
          <div>
            <p className="font-bold text-gray-900">Carica la ricevuta del bonifico</p>
            <p className="text-sm text-gray-500 mt-1">
              L'AI verifica importo, IBAN e causale e attiva il tuo workspace in automatico.
            </p>
          </div>

          {/* Drop area */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl px-4 py-8 text-center transition-colors ${
              file
                ? 'border-hermes-300 bg-hermes-50'
                : 'border-gray-300 hover:border-hermes-300 hover:bg-hermes-50/30'
            }`}
          >
            {file ? (
              <div>
                <p className="text-2xl mb-1">📄</p>
                <p className="text-sm font-semibold text-hermes-700">{file.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB — clicca per cambiare</p>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-2">📤</p>
                <p className="text-sm font-semibold text-gray-700">Clicca per caricare</p>
                <p className="text-xs text-gray-400 mt-1">PDF o immagine (JPG, PNG)</p>
              </div>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onFile}
          />

          {/* Stato verifica */}
          {stato === 'verifica' && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Analisi in corso…</p>
                <p className="text-xs text-blue-600">L'AI sta leggendo la tua ricevuta</p>
              </div>
            </div>
          )}

          {stato === 'ok' && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-sm font-semibold text-green-800">Pagamento verificato!</p>
                <p className="text-xs text-green-600">Sto attivando il tuo workspace…</p>
              </div>
            </div>
          )}

          {stato === 'errore' && errori.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-1">
              <p className="text-sm font-semibold text-red-800">⚠️ Verifica non riuscita</p>
              {errori.map((e, i) => (
                <p key={i} className="text-xs text-red-700">{e}</p>
              ))}
              <p className="text-xs text-red-500 mt-2">
                Controlla i dati del bonifico e ricarica la ricevuta, oppure scrivi a{' '}
                <a href="mailto:info@hermesmarketing.it" className="underline">info@hermesmarketing.it</a>.
              </p>
            </div>
          )}

          <button
            onClick={verifica}
            disabled={!file || stato === 'verifica' || stato === 'ok'}
            className="w-full rounded-xl bg-hermes-500 text-white font-bold py-4 text-base hover:bg-hermes-600 transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {stato === 'verifica' ? '🔍 Verifica in corso…' : stato === 'ok' ? '✅ Verificato!' : '🔍 Verifica e attiva il workspace'}
          </button>
        </div>

        {/* Bypass per test */}
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50">
          {!bypass ? (
            <button onClick={() => setBypass(true)} className="w-full text-xs text-gray-400 hover:text-gray-600 underline py-1">
              Ho effettuato il pagamento
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 text-center">Inserisci il codice per procedere</p>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={bypassPin}
                onChange={e => { setBypassPin(e.target.value.replace(/\D/g, '')); setBypassErrore(false) }}
                placeholder="······"
                className={`w-full border rounded-lg px-3 py-2 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-gray-300 ${bypassErrore ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                autoFocus
              />
              {bypassErrore && <p className="text-xs text-red-500 text-center">Codice non corretto</p>}
              <div className="flex gap-2">
                <button onClick={() => { setBypass(false); setBypassPin(''); setBypassErrore(false) }} className="flex-1 text-xs border border-gray-300 rounded-lg py-2 text-gray-500 hover:bg-gray-100">Annulla</button>
                <button
                  onClick={saltoVerifica}
                  disabled={bypassLoading || bypassPin.length < 6}
                  className="flex-1 text-xs bg-green-600 text-white rounded-lg py-2 font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {bypassLoading ? '⏳…' : '✅ Conferma'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 pb-6">
          Hai domande? Scrivici a{' '}
          <a href="mailto:info@hermesmarketing.it" className="text-hermes-500 underline">info@hermesmarketing.it</a>
        </p>
      </div>
    </div>
  )
}

export default function PagamentoPage() {
  return <Suspense><PagamentoForm /></Suspense>
}
