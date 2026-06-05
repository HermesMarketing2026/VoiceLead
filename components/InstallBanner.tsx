'use client'
import { useEffect, useState } from 'react'

export default function InstallBanner() {
  const [mostra, setMostra] = useState(false)
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone = (window.navigator as any).standalone === true
    const nascosto = localStorage.getItem('vl_install_banner') === 'nascosto'
    setIsIos(ios)
    setMostra(ios && !standalone && !nascosto)
  }, [])

  const nascondi = () => {
    localStorage.setItem('vl_install_banner', 'nascosto')
    setMostra(false)
  }

  if (!mostra) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-4 flex items-start gap-3 max-w-sm mx-auto">
        <img src="/favicon.png" alt="VoiceLeads" className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">Installa VoiceLeads</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Tocca <strong>⎋ Condividi</strong> poi <strong>"Aggiungi a Home"</strong> per usarla come un'app.
          </p>
        </div>
        <button onClick={nascondi} className="text-gray-400 hover:text-gray-600 text-lg shrink-0">✕</button>
      </div>
    </div>
  )
}
