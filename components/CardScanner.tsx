'use client'
import { useRef, useState } from 'react'

interface Props {
  onEstrazione: (dati: Record<string, string>) => void
}

// Ridimensiona l'immagine lato client prima di inviarla (max 1200px, qualità 0.85)
function compressImage(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 1200
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round((height * MAX) / width); width = MAX }
        else { width = Math.round((width * MAX) / height); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      URL.revokeObjectURL(url)
      const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1]
      resolve({ base64, mediaType: 'image/jpeg' })
    }
    img.onerror = reject
    img.src = url
  })
}

type Stato = 'idle' | 'preview' | 'caricamento' | 'successo' | 'errore'

export default function CardScanner({ onEstrazione }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [stato, setStato] = useState<Stato>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [errore, setErrore] = useState<string | null>(null)

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Mostra preview immediata
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    setStato('preview')
    setErrore(null)

    // Comprimi e invia
    setStato('caricamento')
    try {
      const { base64, mediaType } = await compressImage(file)
      const res = await fetch('/api/scan-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      })
      const dati = await res.json()
      if (!res.ok) throw new Error(dati.error ?? 'Errore analisi')
      onEstrazione(dati)
      setStato('successo')
    } catch (err: any) {
      setErrore(err.message ?? 'Errore sconosciuto')
      setStato('errore')
    } finally {
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setStato('idle')
    setErrore(null)
  }

  return (
    <div>
      {/* Input nascosto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Stato idle → mostra pulsante */}
      {stato === 'idle' && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 py-5 text-gray-500 hover:border-hermes-400 hover:text-hermes-500 hover:bg-hermes-50 transition-all"
        >
          <span className="text-3xl">📷</span>
          <div className="text-left">
            <p className="font-semibold text-sm">Scatta foto al biglietto da visita</p>
            <p className="text-xs text-gray-400">L'AI estrarrà automaticamente i dati</p>
          </div>
        </button>
      )}

      {/* Preview + caricamento */}
      {(stato === 'preview' || stato === 'caricamento') && preview && (
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
          <img src={preview} alt="Biglietto da visita" className="w-full max-h-48 object-cover" />
          <div className="bg-hermes-50 border-t border-hermes-100 px-4 py-3 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-hermes-500 border-t-transparent animate-spin shrink-0" />
            <p className="text-sm text-hermes-600 font-medium">Analisi del biglietto in corso…</p>
          </div>
        </div>
      )}

      {/* Successo */}
      {stato === 'successo' && preview && (
        <div className="rounded-2xl border border-green-200 overflow-hidden">
          <img src={preview} alt="Biglietto da visita" className="w-full max-h-48 object-cover" />
          <div className="bg-green-50 border-t border-green-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✅</span>
              <p className="text-sm text-green-700 font-medium">Dati estratti con successo!</p>
            </div>
            <button
              type="button"
              onClick={() => { reset(); setTimeout(() => inputRef.current?.click(), 100) }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Rifai foto
            </button>
          </div>
        </div>
      )}

      {/* Errore */}
      {stato === 'errore' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600 font-medium mb-1">❌ {errore}</p>
          <p className="text-xs text-red-400 mb-3">Prova a scattare una foto più nitida con buona illuminazione.</p>
          <div className="flex gap-2">
            <button type="button" onClick={reset}
              className="flex-1 rounded-xl border border-gray-300 py-2 text-sm text-gray-500 hover:bg-gray-50">
              Annulla
            </button>
            <button type="button"
              onClick={() => { reset(); setTimeout(() => inputRef.current?.click(), 100) }}
              className="flex-1 rounded-xl bg-hermes-500 py-2 text-sm font-semibold text-white hover:bg-hermes-600">
              Riprova
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
