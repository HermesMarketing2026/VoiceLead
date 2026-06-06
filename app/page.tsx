'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PinLogin from '@/components/PinLogin'
import LandingPage from '@/components/LandingPage'
import { salvaSessione, leggiSessione, cancellaSessione } from '@/lib/session'

type Vista = 'loading' | 'landing' | 'login' | 'hub'

export default function Home() {
  const [vista, setVista] = useState<Vista>('loading')
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [nomeAzienda, setNomeAzienda] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [hasGestisci, setHasGestisci] = useState(false)
  const [leadDaGestire, setLeadDaGestire] = useState(0)

  useEffect(() => {
    const host = window.location.hostname
    const parts = host.split('.')
    const daSottodominio = parts.length >= 3 ? parts[0] : ''
    const daUrl = new URLSearchParams(window.location.search).get('slug') ?? ''
    const slugRilevato = daSottodominio || daUrl

    if (!slugRilevato || slugRilevato === 'www') {
      setVista('landing')
      return
    }

    setSlug(slugRilevato)

    const sessione = leggiSessione()
    if (sessione?.tipo === 'workspace' && sessione.workspaceId) {
      setWorkspaceId(sessione.workspaceId)
      setNomeAzienda(sessione.nomeAzienda || '')
      setLogoUrl(sessione.logoUrl || '')
      setHasGestisci(sessione.hasGestisci ?? false)
      setVista('hub')
    } else {
      setVista('login')
    }
  }, [])

  useEffect(() => {
    if (workspaceId && vista === 'hub' && hasGestisci) {
      fetch(`/api/azioni?workspace_id=${workspaceId}`)
        .then(r => r.json())
        .then(d => setLeadDaGestire(d.count ?? 0))
        .catch(() => {})
    }
  }, [workspaceId, vista, hasGestisci])

  const onLogin = async (pin: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, slug }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    salvaSessione('workspace', data.workspaceId, data.nomeAzienda, data.logoUrl, data.hasGestisci)
    setWorkspaceId(data.workspaceId)
    setNomeAzienda(data.nomeAzienda)
    setLogoUrl(data.logoUrl || '')
    setHasGestisci(data.hasGestisci ?? false)
    setVista('hub')
  }

  const logout = () => {
    cancellaSessione()
    setWorkspaceId(null)
    setVista('login')
  }

  if (vista === 'loading') return null
  if (vista === 'landing') return <LandingPage />
  if (vista === 'login') return (
    <AppShell><PinLogin titolo="VoiceLeads" slug={slug} onSuccess={onLogin} /></AppShell>
  )

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header azienda */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl && <img src={logoUrl} alt={nomeAzienda} className="h-8 w-auto object-contain" />}
            <div>
              <p className="font-bold text-gray-900 leading-tight">{nomeAzienda}</p>
              <p className="text-xs text-gray-400">VoiceLeads</p>
            </div>
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
            Esci
          </button>
        </div>

        {/* Due pulsanti principali */}
        <div className="grid grid-cols-1 gap-4">
          <Link
            href={`/registra?workspace_id=${workspaceId}`}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-hermes-500 px-6 py-10 text-white shadow-lg hover:bg-hermes-600 active:scale-95 transition-all"
          >
            <span className="text-5xl">🎙️</span>
            <div className="text-center">
              <p className="text-xl font-bold">Registra</p>
              <p className="text-sm opacity-80 mt-0.5">Cattura nuovi lead con la voce</p>
            </div>
          </Link>

          {hasGestisci ? (
            <Link
              href={`/gestisci?workspace_id=${workspaceId}`}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border-2 border-gray-200 px-6 py-10 text-gray-800 shadow-sm hover:border-hermes-300 hover:shadow-md active:scale-95 transition-all"
            >
              <span className="text-5xl">📋</span>
              <div className="text-center">
                <p className="text-xl font-bold">Gestisci</p>
                <p className="text-sm text-gray-500 mt-0.5">Segui le trattative in corso</p>
              </div>
            </Link>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 px-6 py-10 text-gray-300 cursor-not-allowed">
              <span className="text-5xl opacity-30">📋</span>
              <div className="text-center">
                <p className="text-xl font-bold">Gestisci</p>
                <p className="text-xs text-gray-300 mt-0.5">Non incluso nel tuo piano</p>
              </div>
            </div>
          )}
        </div>

        {/* Counter lead da gestire */}
        <div className={`rounded-2xl px-5 py-4 text-center border ${
          leadDaGestire > 0
            ? 'bg-amber-50 border-amber-200'
            : 'bg-gray-50 border-gray-200'
        }`}>
          {leadDaGestire > 0 ? (
            <p className="text-amber-800 font-semibold">
              ⚠️ <span className="text-xl font-bold">{leadDaGestire}</span> {leadDaGestire === 1 ? 'lead da gestire' : 'lead da gestire'} oggi
            </p>
          ) : (
            <p className="text-gray-400 text-sm">Nessuna azione in scadenza oggi</p>
          )}
        </div>
      </div>
    </AppShell>
  )
}
