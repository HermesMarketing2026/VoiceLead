'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PinLogin from '@/components/PinLogin'
import LandingPage from '@/components/LandingPage'
import AdminPanel from '@/app/admin/AdminPanel'
import { salvaSessione, leggiSessione, cancellaSessione } from '@/lib/session'

type Vista = 'loading' | 'landing' | 'login' | 'seleziona-commerciale' | 'hub'

interface CommercialCard {
  id: string
  nome: string
  cognome: string
}

export default function Home() {
  const [vista, setVista] = useState<Vista>('loading')
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [nomeAzienda, setNomeAzienda] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [hasGestisci, setHasGestisci] = useState(false)
  const [leadDaGestire, setLeadDaGestire] = useState(0)
  const [utenteId, setUtenteId] = useState<string | null>(null)
  const [nomeUtente, setNomeUtente] = useState<string | null>(null)
  const [ruoloUtente, setRuoloUtente] = useState<'admin' | 'commerciale' | null>(null)
  const [commerciali, setCommerciali] = useState<CommercialCard[]>([])

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

    if (slugRilevato === 'admin') {
      setVista('admin' as any)
      return
    }

    setSlug(slugRilevato)

    const sessione = leggiSessione()
    if (sessione?.tipo === 'workspace' && sessione.workspaceId) {
      setWorkspaceId(sessione.workspaceId)
      setNomeAzienda(sessione.nomeAzienda || '')
      setLogoUrl(sessione.logoUrl || '')
      setHasGestisci(sessione.hasGestisci ?? false)
      setRuoloUtente(sessione.ruoloUtente ?? null)

      // Responsabile senza commerciale selezionato → mostra selezione
      if (sessione.ruoloUtente === 'admin' && !sessione.utenteId) {
        fetch(`/api/utenti?workspace_id=${sessione.workspaceId}`)
          .then(r => r.json())
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              setCommerciali(data)
              setVista('seleziona-commerciale')
            } else {
              setVista('hub')
            }
          })
          .catch(() => setVista('hub'))
        return
      }

      setUtenteId(sessione.utenteId ?? null)
      setNomeUtente(sessione.nomeUtente ?? null)
      setVista('hub')
    } else {
      setVista('login')
    }
  }, [])

  useEffect(() => {
    if (workspaceId && vista === 'hub' && hasGestisci) {
      const url = utenteId
        ? `/api/azioni?workspace_id=${workspaceId}&utente_id=${utenteId}`
        : `/api/azioni?workspace_id=${workspaceId}`
      fetch(url)
        .then(r => r.json())
        .then(d => setLeadDaGestire(d.count ?? 0))
        .catch(() => {})
    }
  }, [workspaceId, vista, hasGestisci, utenteId])

  const onLogin = async (pin: string, utenteIdLogin?: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, slug, utente_id: utenteIdLogin }),
    })
    const data = await res.json()
    if (res.status === 402) { window.location.href = '/abbonamento-scaduto'; return }
    if (!res.ok) throw new Error(data.error)

    setWorkspaceId(data.workspaceId)
    setNomeAzienda(data.nomeAzienda)
    setLogoUrl(data.logoUrl || '')
    setHasGestisci(data.hasGestisci ?? false)
    setRuoloUtente(data.ruoloUtente ?? null)

    // Responsabile con commerciali → mostra selezione prima di entrare
    if (data.ruoloUtente === 'admin') {
      salvaSessione('workspace', data.workspaceId, data.nomeAzienda, data.logoUrl, data.hasGestisci, undefined, undefined, 'admin')
      const res2 = await fetch(`/api/utenti?workspace_id=${data.workspaceId}`)
      const utentiData = await res2.json()
      if (Array.isArray(utentiData) && utentiData.length > 0) {
        setCommerciali(utentiData)
        setVista('seleziona-commerciale')
        return
      }
      // Nessun commerciale → entra come admin normale
      setUtenteId(null)
      setNomeUtente(null)
      setVista('hub')
      return
    }

    // Commerciale normale
    salvaSessione('workspace', data.workspaceId, data.nomeAzienda, data.logoUrl, data.hasGestisci, data.utenteId ?? undefined, data.nomeUtente ?? undefined, data.ruoloUtente ?? undefined)
    setUtenteId(data.utenteId ?? null)
    setNomeUtente(data.nomeUtente ?? null)
    setVista('hub')
  }

  const selezionaCommerciale = (c: CommercialCard) => {
    const nome = `${c.nome} ${c.cognome}`
    salvaSessione('workspace', workspaceId!, nomeAzienda, logoUrl, hasGestisci, c.id, nome, 'admin')
    setUtenteId(c.id)
    setNomeUtente(nome)
    setVista('hub')
  }

  const cambiaCommerciale = () => {
    // Torna alla selezione senza perdere la sessione admin
    salvaSessione('workspace', workspaceId!, nomeAzienda, logoUrl, hasGestisci, undefined, undefined, 'admin')
    setUtenteId(null)
    setNomeUtente(null)
    setVista('seleziona-commerciale')
  }

  const logout = () => {
    cancellaSessione()
    setWorkspaceId(null)
    setRuoloUtente(null)
    setUtenteId(null)
    setNomeUtente(null)
    setVista('login')
  }

  if (vista === 'loading') return null
  if ((vista as any) === 'admin') return <AdminPanel />
  if (vista === 'landing') return <LandingPage />
  if (vista === 'login') return (
    <AppShell><PinLogin titolo="VoiceLeads" slug={slug} onSuccess={onLogin} /></AppShell>
  )

  // ── Schermata selezione commerciale (responsabile) ──
  if (vista === 'seleziona-commerciale') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-hermes-500 to-hermes-700 px-6 pt-8 pb-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute w-48 h-48 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
              </div>
              {logoUrl && (
                <div className="mb-3 relative z-10">
                  <img src={logoUrl} alt={nomeAzienda} className="h-10 w-auto mx-auto object-contain brightness-0 invert opacity-90" />
                </div>
              )}
              <div className="relative z-10">
                <p className="text-white/70 text-sm mb-1">Pannello responsabile</p>
                <h1 className="text-white text-xl font-bold">Di chi vuoi vedere i lead?</h1>
                <p className="text-white/60 text-xs mt-1">{nomeAzienda}</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-3">
              {commerciali.map(c => (
                <button
                  key={c.id}
                  onClick={() => selezionaCommerciale(c)}
                  className="w-full flex items-center gap-4 rounded-2xl border-2 border-gray-200 px-4 py-3.5 hover:border-hermes-400 hover:bg-hermes-50 active:scale-95 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-hermes-100 flex items-center justify-center text-hermes-600 font-bold text-base shrink-0">
                    {c.nome[0]}{c.cognome[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{c.nome} {c.cognome}</p>
                    <p className="text-xs text-gray-400">Commerciale</p>
                  </div>
                  <span className="ml-auto text-gray-300 text-lg">›</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={logout} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-2 transition-colors">
            Esci
          </button>
        </div>
      </div>
    )
  }

  // ── Hub principale ──
  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl && <img src={logoUrl} alt={nomeAzienda} className="h-8 w-auto object-contain" />}
            <div>
              <p className="font-bold text-gray-900 leading-tight">{nomeAzienda}</p>
              {nomeUtente
                ? <p className="text-xs text-hermes-500 font-medium">{nomeUtente}</p>
                : <p className="text-xs text-gray-400">VoiceLeads</p>
              }
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ruoloUtente === 'admin' && commerciali.length > 0 && (
              <button onClick={cambiaCommerciale} className="text-xs text-hermes-500 hover:text-hermes-700 px-2 py-1 rounded-lg hover:bg-hermes-50 transition-colors">
                Cambia ↩
              </button>
            )}
            <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
              Esci
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Link
            href={`/registra?workspace_id=${workspaceId}${utenteId ? `&utente_id=${utenteId}` : ''}`}
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
              href={`/gestisci?workspace_id=${workspaceId}${utenteId ? `&utente_id=${utenteId}` : ''}`}
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

        <div className={`rounded-2xl px-5 py-4 text-center border ${
          leadDaGestire > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
        }`}>
          {leadDaGestire > 0 ? (
            <p className="text-amber-800 font-semibold">
              ⚠️ <span className="text-xl font-bold">{leadDaGestire}</span> lead da gestire oggi
            </p>
          ) : (
            <p className="text-gray-400 text-sm">Nessuna azione in scadenza oggi</p>
          )}
        </div>
      </div>
    </AppShell>
  )
}
