'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

interface Props {
  onTrascrizione: (testo: string) => void
  onEstrazione: (dati: Record<string, string>) => void
  workspaceId: string
}

export default function MicButton({ onTrascrizione, onEstrazione, workspaceId }: Props) {
  const [stato, setStato] = useState<'idle' | 'ascolto' | 'elaborazione'>('idle')
  const [errore, setErrore] = useState<string | null>(null)
  const [supportato, setSupportato] = useState<boolean | null>(null)
  const riconoscimento = useRef<any>(null)

  useEffect(() => {
    setSupportato('SpeechRecognition' in window || 'webkitSpeechRecognition' in (window as any))
  }, [])

  const avvia = useCallback(async () => {
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
          body: JSON.stringify({ testo, workspace_id: workspaceId }),
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

    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') {
        setErrore('Permesso microfono negato. Abilitalo nelle impostazioni del browser.')
      } else {
        setErrore(`Errore microfono: ${e.error}`)
      }
      setStato('idle')
    }

    rec.onend = () => setStato(s => s === 'ascolto' ? 'elaborazione' : s)
    rec.start()
    setStato('ascolto')
  }, [onTrascrizione, onEstrazione])

  const ferma = useCallback(() => {
    riconoscimento.current?.stop()
    setStato('idle')
  }, [])

  if (supportato === null) return <div className="h-32" />

  if (!supportato) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        ⚠️ La dettatura vocale funziona solo su <strong>Chrome</strong> o <strong>Edge</strong>. Compila il form manualmente oppure cambia browser.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Bottone microfono */}
      <button
        type="button"
        onClick={stato === 'ascolto' ? ferma : avvia}
        disabled={stato === 'elaborazione'}
        className={`
          relative w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg transition-all duration-200
          ${stato === 'ascolto'
            ? 'bg-red-500 text-white scale-110 shadow-red-200 shadow-xl'
            : stato === 'elaborazione'
            ? 'bg-gray-200 text-gray-400 cursor-wait'
            : 'bg-hermes-500 text-white hover:bg-hermes-600 active:scale-95 shadow-hermes-200'}
        `}
      >
        {stato === 'elaborazione' ? '⏳' : stato === 'ascolto' ? '⏹️' : '🎙️'}
        {stato === 'ascolto' && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
        )}
      </button>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {stato === 'ascolto'
            ? 'In ascolto… parla adesso'
            : stato === 'elaborazione'
            ? "Estrazione dati in corso…"
            : 'Tocca per dettare il lead'}
        </p>
        {stato === 'idle' && (
          <p className="text-xs text-gray-400 mt-1">
            Es: "Ho incontrato Mario Rossi di Acme, email mario@acme.it"
          </p>
        )}
      </div>

      {errore && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600 text-center">
          {errore}
        </div>
      )}
    </div>
  )
}
