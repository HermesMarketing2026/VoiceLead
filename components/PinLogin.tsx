'use client'
import { useState } from 'react'

interface Props {
  titolo: string
  sottotitolo?: string
  nomeAzienda?: string
  logoUrl?: string
  slug?: string
  onSuccess: (pin: string) => Promise<void>
}

export default function PinLogin({ titolo, nomeAzienda, logoUrl, slug, onSuccess }: Props) {
  const [pin, setPin] = useState('')
  const [errore, setErrore] = useState<string | null>(null)
  const [caricamento, setCaricamento] = useState(false)
  const [mostraGuida, setMostraGuida] = useState(false)

  const digita = (cifra: string) => {
    if (pin.length < 6) setPin(p => p + cifra)
  }
  const cancella = () => setPin(p => p.slice(0, -1))

  const conferma = async () => {
    if (pin.length !== 6) return
    setCaricamento(true)
    setErrore(null)
    try {
      await onSuccess(pin)
    } catch (e: any) {
      setErrore(e.message || 'PIN non corretto')
      setPin('')
    } finally {
      setCaricamento(false)
    }
  }

  const tasti = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4">

        {/* Card principale */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">

          {/* Logo workspace o Hermes */}
          {logoUrl ? (
            <img src={logoUrl} alt={nomeAzienda} className="h-14 w-auto mx-auto mb-3 object-contain" />
          ) : (
            <img src="/logo-hermes.png" alt="Hermes Marketing" className="h-12 w-auto mx-auto mb-3 object-contain" />
          )}

          <h1 className="text-2xl font-bold text-gray-900">VoiceLeads</h1>
          {nomeAzienda && (
            <p className="text-sm text-hermes-500 font-medium mt-0.5">{nomeAzienda}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">by Hermes Marketing</p>

          <p className="text-sm text-gray-500 mt-4 mb-2">Inserisci il tuo PIN a 6 cifre</p>

          {/* Pallini */}
          <div className="flex justify-center gap-3 my-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                  i < pin.length
                    ? 'bg-hermes-500 border-hermes-500 scale-110'
                    : 'bg-white border-gray-300'
                }`}
              />
            ))}
          </div>

          {errore && (
            <p className="text-sm text-red-500 mb-3 animate-pulse">{errore}</p>
          )}

          {/* Tastierino */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {tasti.map((t, i) => (
              t === '' ? (
                <div key={i} />
              ) : t === '⌫' ? (
                <button
                  key={i}
                  onClick={cancella}
                  className="h-14 rounded-xl bg-gray-100 text-gray-500 text-xl font-medium hover:bg-gray-200 active:scale-95 transition-all"
                >
                  ⌫
                </button>
              ) : (
                <button
                  key={i}
                  onClick={() => digita(t)}
                  className="h-14 rounded-xl bg-gray-100 text-gray-900 text-xl font-semibold hover:bg-hermes-50 hover:text-hermes-600 active:scale-95 transition-all"
                >
                  {t}
                </button>
              )
            ))}
          </div>

          <button
            onClick={conferma}
            disabled={pin.length !== 6 || caricamento}
            className="w-full rounded-xl bg-hermes-500 py-3.5 text-sm font-semibold text-white hover:bg-hermes-600 disabled:opacity-40 transition-all shadow-sm"
          >
            {caricamento ? 'Verifica in corso…' : 'Accedi'}
          </button>
        </div>

        {/* Guida all'uso */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setMostraGuida(g => !g)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>💡</span> Come funziona VoiceLeads?
            </span>
            <span className="text-gray-400 text-lg">{mostraGuida ? '−' : '+'}</span>
          </button>

          {mostraGuida && (
            <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
              <div className="space-y-3 pt-4">
                {[
                  {
                    icon: '🎙️',
                    titolo: 'Ditta un lead con la voce',
                    testo: 'Premi il bottone microfono e parla liberamente. Es: "Ho incontrato Mario Rossi di Acme, la sua mail è mario@acme.it, telefono 333 1234567"',
                  },
                  {
                    icon: '🤖',
                    titolo: "L'AI estrae i dati automaticamente",
                    testo: "L'intelligenza artificiale riconosce nome, cognome, azienda, email e telefono dal tuo parlato e compila il form in automatico.",
                  },
                  {
                    icon: '✏️',
                    titolo: 'Correggi se necessario',
                    testo: 'Controlla i campi compilati e modifica eventuali errori di trascrizione prima di salvare.',
                  },
                  {
                    icon: '📤',
                    titolo: 'Esporta su Google Sheets',
                    testo: 'Quando sei pronto, esporta tutti i lead completati direttamente sul tuo foglio Google con un solo tap.',
                  },
                ].map(({ icon, titolo, testo }) => (
                  <div key={titolo} className="flex gap-3">
                    <span className="text-xl shrink-0">{icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{titolo}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{testo}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                ⚠️ La dettatura vocale funziona su <strong>Chrome</strong> o <strong>Edge</strong>. Su Safari usa il form manuale.
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-300">
          Hermes Marketing — Web &amp; Comunicazione
        </p>
      </div>
    </div>
  )
}
