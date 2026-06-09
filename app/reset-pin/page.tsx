'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

function ResetPinForm() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [pin, setPin] = useState('')
  const [pinConferma, setPinConferma] = useState('')
  const [fase, setFase] = useState<'form' | 'successo' | 'errore'>('form')
  const [errore, setErrore] = useState<string | null>(null)
  const [caricamento, setCaricamento] = useState(false)
  const [slug, setSlug] = useState('')

  useEffect(() => {
    if (!token) setFase('errore')
  }, [token])

  const conferma = async () => {
    if (pin.length !== 6) { setErrore('Inserisci un PIN di 6 cifre'); return }
    if (pin !== pinConferma) { setErrore('I PIN non coincidono'); return }
    setCaricamento(true)
    setErrore(null)
    try {
      const res = await fetch('/api/reset-pin/conferma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuovo_pin: pin }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSlug(data.slug)
      setFase('successo')
    } catch (e: any) {
      setErrore(e.message)
    } finally {
      setCaricamento(false)
    }
  }

  const tasti = ['1','2','3','4','5','6','7','8','9','','0','⌫']
  const [step, setStep] = useState<'nuovo' | 'conferma'>('nuovo')

  const digita = (cifra: string) => {
    if (step === 'nuovo') {
      if (pin.length < 6) setPin(p => p + cifra)
    } else {
      if (pinConferma.length < 6) setPinConferma(p => p + cifra)
    }
    setErrore(null)
  }

  const cancella = () => {
    if (step === 'nuovo') setPin(p => p.slice(0, -1))
    else setPinConferma(p => p.slice(0, -1))
    setErrore(null)
  }

  const avanti = () => {
    if (pin.length !== 6) { setErrore('Inserisci 6 cifre'); return }
    setStep('conferma')
    setErrore(null)
  }

  if (fase === 'errore' || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-200">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Link non valido o scaduto</h2>
          <p className="text-gray-500 text-sm mb-5">Richiedi un nuovo link dalla pagina di login.</p>
          <a href="/" className="text-hermes-500 text-sm underline">← Torna al login</a>
        </div>
      </div>
    )
  }

  if (fase === 'successo') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-200">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">PIN aggiornato!</h2>
          <p className="text-gray-500 text-sm mb-6">Puoi ora accedere con il nuovo PIN.</p>
          {slug ? (
            <a
              href={`https://${slug}.voiceleads.it`}
              className="block w-full text-white font-bold rounded-2xl py-3.5 text-sm text-center transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}
            >
              Vai al login →
            </a>
          ) : (
            <a href="/" className="text-hermes-500 text-sm underline">← Torna alla home</a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200">
          <div className="px-6 pt-7 pb-5 text-center border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #fff7f0, #fff3eb)' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>
              <span className="text-2xl">🔑</span>
            </div>
            <h1 className="text-gray-900 text-xl font-extrabold">
              {step === 'nuovo' ? 'Scegli un nuovo PIN' : 'Conferma il PIN'}
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              {step === 'nuovo' ? '6 cifre numeriche' : 'Reinserisci lo stesso PIN'}
            </p>
          </div>

          <div className="px-5 pt-5 pb-6">
            <div className="flex justify-center gap-3 mb-4">
              {Array.from({ length: 6 }).map((_, i) => {
                const current = step === 'nuovo' ? pin : pinConferma
                return (
                  <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                    i < current.length ? 'scale-110 border-hermes-500' : 'bg-gray-100 border-gray-200'
                  }`}
                    style={i < current.length ? { background: 'linear-gradient(135deg, #ff7930, #ff4500)' } : {}} />
                )
              })}
            </div>

            {errore && <p className="text-sm text-red-500 text-center mb-3">{errore}</p>}

            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {tasti.map((t, i) => (
                t === '' ? <div key={i} /> :
                t === '⌫' ? (
                  <button key={i} onClick={cancella}
                    className="h-14 rounded-xl text-gray-400 text-xl font-medium hover:bg-gray-50 active:scale-95 transition-all border border-gray-100">
                    ⌫
                  </button>
                ) : (
                  <button key={i} onClick={() => digita(t)}
                    className="h-14 rounded-xl text-gray-900 text-xl font-semibold bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all border border-gray-100">
                    {t}
                  </button>
                )
              ))}
            </div>

            {step === 'nuovo' ? (
              <button
                onClick={avanti}
                disabled={pin.length !== 6}
                className="w-full rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-30 transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}
              >
                Avanti →
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={conferma}
                  disabled={pinConferma.length !== 6 || caricamento}
                  className="w-full rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-30 transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}
                >
                  {caricamento ? 'Salvataggio…' : 'Salva nuovo PIN'}
                </button>
                <button onClick={() => { setStep('nuovo'); setPinConferma(''); setErrore(null) }}
                  className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors">
                  ← Cambia PIN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPinPage() {
  return <Suspense><ResetPinForm /></Suspense>
}
