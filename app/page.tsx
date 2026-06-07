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
  const [trialInfo, setTrialInfo] = useState<{ fatturazione: string | null; scadenza_il: string | null } | null>(null)

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
    if (vista === 'hub' && slug) {
      fetch(`/api/workspace-info?slug=${slug}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setTrialInfo({ fatturazione: d.fatturazione, scadenza_il: d.scadenza_il }) })
        .catch(() => {})
    }
  }, [vista, slug])

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
    if (res.status === 402) {
      window.location.href = data.error === 'trial_scaduto'
        ? `/trial/scaduto?slug=${data.slug}`
        : '/abbonamento-scaduto'
      return
    }
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #ff7930, transparent)' }} />
        </div>
        <div className="relative w-full max-w-sm space-y-4">
          <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
            <div className="px-6 pt-8 pb-6 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,121,48,0.12), rgba(255,69,0,0.06))' }}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 rounded-full border border-white/5 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute w-56 h-56 rounded-full border border-white/5 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.8s' }} />
              </div>
              {logoUrl && (
                <div className="mb-3 relative z-10">
                  <img src={logoUrl} alt={nomeAzienda} className="h-10 w-auto mx-auto object-contain brightness-0 invert opacity-70" />
                </div>
              )}
              <div className="relative z-10">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{nomeAzienda}</p>
                <h1 className="text-white text-xl font-extrabold">Di chi vuoi vedere i lead?</h1>
                <p className="text-white/30 text-xs mt-1">Pannello responsabile</p>
              </div>
            </div>

            <div className="px-5 py-5 space-y-2.5">
              {commerciali.map(c => (
                <button
                  key={c.id}
                  onClick={() => selezionaCommerciale(c)}
                  className="w-full flex items-center gap-4 rounded-2xl px-4 py-3.5 hover:bg-white/5 active:scale-95 transition-all text-left group"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)', color: 'white' }}>
                    {c.nome[0]}{c.cognome[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{c.nome} {c.cognome}</p>
                    <p className="text-xs text-white/30">Commerciale</p>
                  </div>
                  <span className="ml-auto text-white/20 text-lg group-hover:text-white/50 transition-colors">›</span>
                </button>
              ))}
            </div>
          </div>

          <button onClick={logout} className="w-full text-center text-xs text-white/25 hover:text-white/50 py-2 transition-colors">
            Esci
          </button>
        </div>
      </div>
    )
  }

  // ── Hub principale ──
  const giorniTrialLeft = trialInfo?.fatturazione === 'prova' && trialInfo?.scadenza_il
    ? Math.max(0, Math.ceil((new Date(trialInfo.scadenza_il).getTime() - Date.now()) / 86400000))
    : null

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Header workspace */}
        <div className="rounded-2xl px-5 py-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            {logoUrl
              ? <img src={logoUrl} alt={nomeAzienda} className="h-8 w-auto object-contain brightness-0 invert opacity-80" />
              : <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: 'rgba(255,121,48,0.15)', border: '1px solid rgba(255,121,48,0.25)' }}>🏢</div>
            }
            <div>
              <p className="font-bold text-white text-sm leading-tight">{nomeAzienda}</p>
              {nomeUtente
                ? <p className="text-xs font-medium" style={{ color: '#ff9950' }}>{nomeUtente}</p>
                : <p className="text-xs text-white/30">Responsabile</p>
              }
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ruoloUtente === 'admin' && commerciali.length > 0 && (
              <button onClick={cambiaCommerciale} className="text-xs text-white/40 hover:text-white/70 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
                Cambia ↩
              </button>
            )}
            <button onClick={logout} className="text-xs text-white/30 hover:text-white/60 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
              Esci
            </button>
          </div>
        </div>

        {/* Banner trial */}
        {giorniTrialLeft !== null && (
          <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${giorniTrialLeft <= 3 ? '' : ''}`}
            style={{
              background: giorniTrialLeft <= 3 ? 'rgba(239,68,68,0.08)' : 'rgba(251,191,36,0.08)',
              border: `1px solid ${giorniTrialLeft <= 3 ? 'rgba(239,68,68,0.25)' : 'rgba(251,191,36,0.25)'}`,
            }}>
            <span className="text-xl shrink-0">{giorniTrialLeft <= 3 ? '⚠️' : '⏳'}</span>
            <div className="flex-1">
              <p className={`text-xs font-bold ${giorniTrialLeft <= 3 ? 'text-red-400' : 'text-amber-400'}`}>
                Prova gratuita — {giorniTrialLeft === 0 ? 'scade oggi!' : `${giorniTrialLeft} ${giorniTrialLeft === 1 ? 'giorno rimanente' : 'giorni rimanenti'}`}
              </p>
              <p className="text-xs text-white/35 mt-0.5">Stai usando il Piano Pro completo</p>
            </div>
            <a href="/checkout?piano=pro" className="text-xs font-bold text-white px-3 py-1.5 rounded-lg shrink-0 transition-opacity hover:opacity-80"
              style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>
              Abbonati
            </a>
          </div>
        )}

        {/* Banner lead da gestire */}
        {leadDaGestire > 0 && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <span className="text-xl">📋</span>
            <p className="text-sm font-semibold text-amber-400">
              <span className="text-lg font-extrabold text-amber-300">{leadDaGestire}</span> lead da seguire oggi
            </p>
          </div>
        )}

        {/* Bottoni principali */}
        <div className="grid grid-cols-1 gap-4">
          <Link
            href={`/registra?workspace_id=${workspaceId}${utenteId ? `&utente_id=${utenteId}` : ''}`}
            className="group flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-10 text-white active:scale-95 transition-all relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)', boxShadow: '0 0 40px rgba(255,121,48,0.25)' }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: 'radial-gradient(circle at center, white, transparent)' }} />
            <span className="text-5xl relative z-10">🎙️</span>
            <div className="text-center relative z-10">
              <p className="text-xl font-extrabold">Registra</p>
              <p className="text-sm opacity-70 mt-0.5">Cattura nuovi lead con la voce</p>
            </div>
          </Link>

          {hasGestisci ? (
            <Link
              href={`/gestisci?workspace_id=${workspaceId}${utenteId ? `&utente_id=${utenteId}` : ''}`}
              className="flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-10 active:scale-95 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="text-5xl">📋</span>
              <div className="text-center">
                <p className="text-xl font-bold text-white">Gestisci</p>
                <p className="text-sm text-white/40 mt-0.5">Segui le trattative in corso</p>
              </div>
            </Link>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-10 cursor-not-allowed"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <span className="text-5xl opacity-20">📋</span>
              <div className="text-center">
                <p className="text-xl font-bold text-white/20">Gestisci</p>
                <p className="text-xs text-white/15 mt-0.5">Non incluso nel tuo piano</p>
              </div>
            </div>
          )}
        </div>

        {!leadDaGestire && (
          <p className="text-center text-xs text-white/20">Nessuna scadenza oggi · tutto in ordine ✓</p>
        )}
      </div>
    </AppShell>
  )
}
