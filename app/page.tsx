'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AppShell from '@/components/AppShell'
import PinLogin from '@/components/PinLogin'
import LandingPage from '@/components/LandingPage'
import AdminPanel from '@/app/admin/AdminPanel'
import { salvaSessione, leggiSessione, cancellaSessione, workspaceAuthHeader } from '@/lib/session'

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
  const [bozzaCount, setBozzaCount] = useState(0)
  const [showStats, setShowStats] = useState(false)
  const [statsLeads, setStatsLeads] = useState<any[]>([])
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)

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
      // Salva ultimo workspace per quick access dalla landing
      try { localStorage.setItem('vl_last_workspace', JSON.stringify({ slug: slugRilevato, nome: sessione.nomeAzienda || '' })) } catch {}
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

  useEffect(() => {
    if (workspaceId && vista === 'hub') {
      // Responsabile vede tutti i lead per le statistiche; commerciale solo i propri
      const urlAll = `/api/leads?workspace_id=${workspaceId}`
      const urlUtente = utenteId ? `/api/leads?workspace_id=${workspaceId}&utente_id=${utenteId}` : urlAll
      fetch(urlUtente)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setBozzaCount(data.filter((l: any) => l.stato === 'bozza').length)
          }
        })
        .catch(() => {})
      // Statistiche solo per responsabile/admin (tutti i lead del workspace)
      if (ruoloUtente !== 'commerciale') {
        fetch(urlAll, { headers: workspaceAuthHeader() })
          .then(r => r.json())
          .then(data => { if (Array.isArray(data)) setStatsLeads(data) })
          .catch(() => {})
      }
    }
  }, [workspaceId, vista, utenteId, ruoloUtente])

  useEffect(() => {
    if (vista === 'hub' && workspaceId) {
      try {
        const key = `vl_tutorial_${workspaceId}`
        if (!localStorage.getItem(key)) {
          setShowTutorial(true)
        }
      } catch {}
    }
  }, [vista, workspaceId])

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
      salvaSessione('workspace', data.workspaceId, data.nomeAzienda, data.logoUrl, data.hasGestisci, undefined, undefined, 'admin', undefined, data.workspaceToken)
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
    salvaSessione('workspace', data.workspaceId, data.nomeAzienda, data.logoUrl, data.hasGestisci, data.utenteId ?? undefined, data.nomeUtente ?? undefined, data.ruoloUtente ?? undefined, undefined, data.workspaceToken)
    setUtenteId(data.utenteId ?? null)
    setNomeUtente(data.nomeUtente ?? null)
    try { localStorage.setItem('vl_last_workspace', JSON.stringify({ slug, nome: data.nomeAzienda || '' })) } catch {}
    setVista('hub')
  }

  const selezionaCommerciale = (c: CommercialCard) => {
    const nome = `${c.nome} ${c.cognome}`
    const wt = leggiSessione()?.workspaceToken
    salvaSessione('workspace', workspaceId!, nomeAzienda, logoUrl, hasGestisci, c.id, nome, 'admin', undefined, wt)
    setUtenteId(c.id)
    setNomeUtente(nome)
    setVista('hub')
  }

  const cambiaCommerciale = () => {
    // Torna alla selezione senza perdere la sessione admin
    const wt = leggiSessione()?.workspaceToken
    salvaSessione('workspace', workspaceId!, nomeAzienda, logoUrl, hasGestisci, undefined, undefined, 'admin', undefined, wt)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200">
            <div className="px-6 pt-7 pb-5 text-center border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #fff7f0, #fff3eb)' }}>
              {logoUrl && (
                <img src={logoUrl} alt={nomeAzienda} className="h-10 w-auto mx-auto object-contain mb-3" />
              )}
              {!logoUrl && (
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>
                  <span className="text-2xl">🎙️</span>
                </div>
              )}
              <p className="text-xs font-bold text-hermes-500 uppercase tracking-widest mb-1">{nomeAzienda}</p>
              <h1 className="text-gray-900 text-xl font-extrabold">Di chi vuoi vedere i lead?</h1>
              <p className="text-gray-400 text-xs mt-1">Pannello responsabile</p>
            </div>

            <div className="px-5 py-5 space-y-2">
              {commerciali.map(c => (
                <button
                  key={c.id}
                  onClick={() => selezionaCommerciale(c)}
                  className="w-full flex items-center gap-4 rounded-2xl px-4 py-3.5 hover:bg-gray-50 active:scale-95 transition-all text-left group border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white"
                    style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>
                    {c.nome[0]}{c.cognome[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{c.nome} {c.cognome}</p>
                    <p className="text-xs text-gray-400">Commerciale</p>
                  </div>
                  <span className="ml-auto text-gray-300 text-lg group-hover:text-hermes-400 transition-colors">›</span>
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
  const giorniTrialLeft = trialInfo?.fatturazione === 'prova' && trialInfo?.scadenza_il
    ? Math.max(0, Math.ceil((new Date(trialInfo.scadenza_il).getTime() - Date.now()) / 86400000))
    : null

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header workspace */}
        <div className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            {logoUrl
              ? <img src={logoUrl} alt={nomeAzienda} className="h-8 w-auto object-contain" />
              : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0" style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>🏢</div>
            }
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">{nomeAzienda}</p>
              {nomeUtente
                ? <p className="text-xs font-semibold text-hermes-500">{nomeUtente}</p>
                : <p className="text-xs text-gray-400">Responsabile</p>
              }
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ruoloUtente === 'admin' && commerciali.length > 0 && (
              <button onClick={cambiaCommerciale} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                Cambia ↩
              </button>
            )}
            <button onClick={logout} className="text-xs text-gray-300 hover:text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
              Esci
            </button>
          </div>
        </div>

        {/* Banner trial */}
        {giorniTrialLeft !== null && (
          <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 border ${giorniTrialLeft <= 3 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
            <span className="text-xl shrink-0">{giorniTrialLeft <= 3 ? '⚠️' : '⏳'}</span>
            <div className="flex-1">
              <p className={`text-xs font-bold ${giorniTrialLeft <= 3 ? 'text-red-600' : 'text-amber-700'}`}>
                Prova gratuita — {giorniTrialLeft === 0 ? 'scade oggi!' : `${giorniTrialLeft} ${giorniTrialLeft === 1 ? 'giorno rimanente' : 'giorni rimanenti'}`}
              </p>
              <p className={`text-xs mt-0.5 ${giorniTrialLeft <= 3 ? 'text-red-500' : 'text-amber-600'}`}>
                {ruoloUtente === 'commerciale'
                  ? giorniTrialLeft <= 3 ? 'Avvisa il responsabile per non perdere i dati' : 'Stai usando il Piano Pro completo'
                  : 'Stai usando il Piano Pro completo'}
              </p>
            </div>
            {ruoloUtente !== 'commerciale' ? (
              <a href="/checkout?piano=pro" className="text-xs font-bold text-white px-3 py-1.5 rounded-lg shrink-0 transition-opacity hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>
                Abbonati
              </a>
            ) : giorniTrialLeft <= 7 ? (
              <span className="text-xs font-bold text-red-600 shrink-0">⚡ Parla col responsabile</span>
            ) : null}
          </div>
        )}

        {/* Banner lead da gestire */}
        {leadDaGestire > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-xl">📋</span>
            <p className="text-sm font-semibold text-amber-700">
              <span className="text-lg font-extrabold text-amber-600">{leadDaGestire}</span> lead da seguire oggi
            </p>
          </div>
        )}

        {/* Banner bozze */}
        {bozzaCount > 0 && (
          <Link
            href={`/registra?workspace_id=${workspaceId}${utenteId ? `&utente_id=${utenteId}` : ''}&filtro=bozza`}
            className="block bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 flex items-center gap-3 hover:bg-orange-100 transition-colors"
          >
            <span className="text-xl">✏️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-700">
                <span className="text-lg font-extrabold text-orange-600">{bozzaCount}</span> {bozzaCount === 1 ? 'lead incompleto' : 'lead incompleti'}
              </p>
              <p className="text-xs text-orange-500 mt-0.5">Tocca per completarli prima che vengano eliminati</p>
            </div>
            <span className="text-orange-400 text-lg">›</span>
          </Link>
        )}

        {/* Bottoni principali */}
        <div className="grid grid-cols-1 gap-3">
          <Link
            href={`/registra?workspace_id=${workspaceId}${utenteId ? `&utente_id=${utenteId}` : ''}`}
            className="group flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-10 text-white active:scale-95 transition-all relative overflow-hidden shadow-md"
            style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}
          >
            <span className="text-5xl">🎙️</span>
            <div className="text-center">
              <p className="text-xl font-extrabold">Registra</p>
              <p className="text-sm opacity-75 mt-0.5">Cattura nuovi lead con la voce</p>
            </div>
          </Link>

          {hasGestisci ? (
            <Link
              href={`/gestisci?workspace_id=${workspaceId}${utenteId ? `&utente_id=${utenteId}` : ''}`}
              className="flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-10 active:scale-95 transition-all bg-white border border-gray-200 shadow-sm"
            >
              <span className="text-5xl">📋</span>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">Gestisci</p>
                <p className="text-sm text-gray-400 mt-0.5">Segui le trattative in corso</p>
              </div>
            </Link>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl px-6 py-10 cursor-not-allowed bg-white border border-dashed border-gray-200">
              <span className="text-5xl opacity-20">📋</span>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-200">Gestisci</p>
                <p className="text-xs text-gray-300 mt-0.5">Non incluso nel tuo piano</p>
              </div>
            </div>
          )}
        </div>

        {!leadDaGestire && (
          <p className="text-center text-xs text-gray-300">Nessuna scadenza oggi · tutto in ordine ✓</p>
        )}

        {/* Statistiche — solo responsabile */}
        {ruoloUtente !== 'commerciale' && statsLeads.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowStats(s => !s)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span>📊</span> Statistiche workspace
              </span>
              <span className="text-gray-300 text-lg transition-transform duration-200" style={{ transform: showStats ? 'rotate(180deg)' : 'none' }}>▾</span>
            </button>
            {showStats && (() => {
              const ora = Date.now()
              const settimana = ora - 7 * 86400000
              const mese = ora - 30 * 86400000
              const totale = statsLeads.length
              const questaSett = statsLeads.filter(l => new Date(l.data_registrazione).getTime() > settimana).length
              const questoMese = statsLeads.filter(l => new Date(l.data_registrazione).getTime() > mese).length
              const completi = statsLeads.filter(l => l.stato === 'completo' || l.stato === 'esportato').length
              const vinti = statsLeads.filter(l => l.esito === 'vinto').length
              const persi = statsLeads.filter(l => l.esito === 'perso').length
              const perCom: Record<string, { nome: string; count: number }> = {}
              statsLeads.forEach(l => {
                if (l.utente_id) {
                  perCom[l.utente_id] = perCom[l.utente_id] ?? { nome: l.utente_id, count: 0 }
                  perCom[l.utente_id].count++
                }
              })
              return (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Lead totali', val: totale, colore: 'text-gray-900' },
                      { label: 'Questa settimana', val: questaSett, colore: 'text-hermes-600' },
                      { label: 'Questo mese', val: questoMese, colore: 'text-hermes-500' },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                        <p className={`text-2xl font-bold ${s.colore}`}>{s.val}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-tight">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completamento</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: totale ? `${Math.round((completi/totale)*100)}%` : '0%' }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 shrink-0">{totale ? Math.round((completi/totale)*100) : 0}% pronti</span>
                    </div>
                  </div>
                  {hasGestisci && (vinti > 0 || persi > 0) && (
                    <div className="flex gap-3">
                      <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-green-700">{vinti}</p>
                        <p className="text-xs text-green-600">Vinti</p>
                      </div>
                      <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-red-600">{persi}</p>
                        <p className="text-xs text-red-500">Persi</p>
                      </div>
                      <div className="flex-1 bg-hermes-50 border border-hermes-200 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-hermes-600">
                          {(vinti + persi) > 0 ? `${Math.round((vinti/(vinti+persi))*100)}%` : '—'}
                        </p>
                        <p className="text-xs text-hermes-500">Win rate</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* Tutorial primo accesso */}
      {showTutorial && (() => {
        const steps = [
          {
            icon: '🎙️',
            titolo: 'Registra lead con la voce',
            testo: 'Dopo un appuntamento, premi Registra, parla liberamente e l\'AI compila la scheda per te in pochi secondi.',
          },
          {
            icon: '📋',
            titolo: 'Gestisci le trattative',
            testo: hasGestisci
              ? 'Sposta i lead in Gestisci per tracciare il follow-up, aggiungere azioni e chiudere con Vinto o Perso.'
              : 'Con il Piano Pro puoi seguire le trattative, pianificare azioni e tracciare i risultati.',
          },
          {
            icon: '📥',
            titolo: 'Esporta in CSV',
            testo: 'Con un click esporti tutti i lead completi in un file CSV pronto per Excel, Google Sheets o il tuo CRM.',
          },
        ]
        const step = steps[tutorialStep]
        const isUltimo = tutorialStep === steps.length - 1
        const chiudiTutorial = () => {
          try { localStorage.setItem(`vl_tutorial_${workspaceId}`, '1') } catch {}
          setShowTutorial(false)
        }
        return (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center px-4 pb-6" onClick={chiudiTutorial}>
            <div
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-5" style={{ background: 'linear-gradient(135deg, #fff7f0, #fff3eb)' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1.5">
                    {steps.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === tutorialStep ? 'w-6 bg-hermes-500' : 'w-2 bg-hermes-200'}`} />
                    ))}
                  </div>
                  <button onClick={chiudiTutorial} className="text-gray-300 hover:text-gray-500 text-xl leading-none">×</button>
                </div>
                <div className="text-center py-2">
                  <div className="text-5xl mb-3">{step.icon}</div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">{step.titolo}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.testo}</p>
                </div>
              </div>
              <div className="px-6 py-4">
                {isUltimo ? (
                  <button
                    onClick={chiudiTutorial}
                    className="w-full text-white font-bold rounded-2xl py-3.5 text-sm transition-all hover:opacity-90 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}
                  >
                    Inizia subito →
                  </button>
                ) : (
                  <button
                    onClick={() => setTutorialStep(s => s + 1)}
                    className="w-full text-white font-bold rounded-2xl py-3.5 text-sm transition-all hover:opacity-90 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}
                  >
                    Avanti →
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </AppShell>
  )
}
