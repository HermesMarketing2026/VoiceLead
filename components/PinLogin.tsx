'use client'
import { useState } from 'react'

interface Props {
  titolo: string
  sottotitolo?: string
  onSuccess: (pin: string) => Promise<void>
}

export default function PinLogin({ titolo, sottotitolo, onSuccess }: Props) {
  const [pin, setPin] = useState('')
  const [errore, setErrore] = useState<string | null>(null)
  const [caricamento, setCaricamento] = useState(false)

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-xs text-center">
        <div className="text-4xl mb-3">🎙️</div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">{titolo}</h1>
        {sottotitolo && <p className="text-sm text-gray-500 mb-6">{sottotitolo}</p>}

        {/* Pallini PIN */}
        <div className="flex justify-center gap-3 my-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < pin.length
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'bg-white border-gray-300'
              }`}
            />
          ))}
        </div>

        {errore && (
          <p className="text-sm text-red-600 mb-4">{errore}</p>
        )}

        {/* Tastierino */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {tasti.map((t, i) => (
            t === '' ? (
              <div key={i} />
            ) : t === '⌫' ? (
              <button
                key={i}
                onClick={cancella}
                className="h-14 rounded-xl bg-gray-100 text-gray-600 text-xl font-medium hover:bg-gray-200 active:scale-95 transition-all"
              >
                ⌫
              </button>
            ) : (
              <button
                key={i}
                onClick={() => digita(t)}
                className="h-14 rounded-xl bg-gray-100 text-gray-900 text-xl font-semibold hover:bg-indigo-50 hover:text-indigo-700 active:scale-95 transition-all"
              >
                {t}
              </button>
            )
          ))}
        </div>

        <button
          onClick={conferma}
          disabled={pin.length !== 6 || caricamento}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition-all"
        >
          {caricamento ? 'Verifica…' : 'Accedi'}
        </button>
      </div>
    </div>
  )
}
