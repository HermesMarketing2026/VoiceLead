'use client'
import { useState, useRef, useCallback } from 'react'

interface Props {
  onTrascrizione: (testo: string) => void
  onEstrazione: (dati: Record<string, string>) => void
}

export default function MicButton({ onTrascrizione, onEstrazione }: Props) {
  const [stato, setStato] = useState<'idle' | 'ascolto' | 'elaborazione'>('idle')
  const [errore, setErrore] = useState<string | null>(null)
  const riconoscimento = useRef<any>(null)

  const supportato =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in (window as any))

  const avvia = useCallback(async () => {
    if (!supportato) return
    setErrore(null)

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'it-IT'
    rec.continuous = false
    rec.interimResults = false
    riconoscimento.current = rec

    rec.onresult = async (e: any) => {
      const testo = e.results[0][0].transcript
      onTrascrizione(testo)
      setStato('elaborazione')

      try {
        const res = await fetch('/api/estrai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testo }),
        })
        if (!res.ok) throw new Error('Errore estrazione')
        const dati = await res.json()
        onEstrazione(dati)
      } catch {
        setErrore('Impossibile elaborare il testo. Riprova.')
      } finally {
        setStato('idle')
      }
    }

    rec.onerror = () => {
      setErrore('Errore microfono. Controlla i permessi.')
      setStato('idle')
    }

    rec.onend = () => {
      if (stato === 'ascolto') setStato('elaborazione')
    }

    rec.start()
    setStato('ascolto')
  }, [supportato, onTrascrizione, onEstrazione, stato])

  const ferma = useCallback(() => {
    riconoscimento.current?.stop()
    setStato('idle')
  }, [])

  if (!supportato) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        ⚠️ La dettatura vocale funziona solo su Chrome o Edge. Usa un browser compatibile oppure compila il form manualmente.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={stato === 'ascolto' ? ferma : avvia}
        disabled={stato === 'elaborazione'}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all
          ${stato === 'ascolto'
            ? 'bg-red-500 text-white animate-pulse scale-110'
            : stato === 'elaborazione'
            ? 'bg-gray-300 text-gray-500 cursor-wait'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}
        `}
      >
        {stato === 'elaborazione' ? '⏳' : stato === 'ascolto' ? '⏹️' : '🎙️'}
      </button>

      <p className="text-sm text-gray-500 text-center">
        {stato === 'ascolto'
          ? 'In ascolto… parla adesso'
          : stato === 'elaborazione'
          ? 'Estrazione dati in corso…'
          : 'Tocca per dettare il lead'}
      </p>

      {errore && (
        <p className="text-sm text-red-600 text-center">{errore}</p>
      )}
    </div>
  )
}
