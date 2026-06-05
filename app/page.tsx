'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Lead } from '@/lib/types'
import { calcolaCompletamento } from '@/lib/types'
import StatoBadge from '@/components/StatoBadge'
import PinLogin from '@/components/PinLogin'
import LandingPage from '@/components/LandingPage'
import { salvaSessione, leggiSessione, cancellaSessione } from '@/lib/session'

type Filtro = 'tutti' | 'completo' | 'bozza'
type Vista = 'loading' | 'landing' | 'login' | 'dashboard'

export default function Home() {
  const [vista, setVista] = useState<Vista>('loading')
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [nomeAzienda, setNomeAzienda] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [slug, setSlug] = useState('')

  const [leads, setLeads] = useState<Lead[]>([])
  const [filtro, setFiltro] = useState<Filtro>('tutti')
  const [esportazione, setEsportazione] = useState(false)
  const [esito, setEsito] = useState<string | null>(null)
  const [caricamento, setCaricamento] = useState(true)

  useEffect(() => {
    const host = window.location.hostname
    const parts = host.split('.')
    const daSottodominio = parts.length >= 3 ? parts[0] : ''
    const daUrl = new URLSearchParams(window.location.search).get('slug') ?? ''
    const slugRilevato = daSottodominio || daUrl

    // www o dominio root → landing page
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
      setVista('dashboard')
    } else {
      setVista('login')
    }
  }, [])

  useEffect(() => {
    if (workspaceId && vista === 'dashboard') carica()
  }, [workspaceId, vista])

  const carica = async () => {
    if (!workspaceId) return
    setCaricamento(true)
    const res = await fetch(`/api/leads?workspace_id=${workspaceId}`)
    const data = await res.json()
    setLeads(Array.isArray(data) ? data : [])
    setCaricamento(false)
  }

  const onLogin = async (pin: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, slug }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    salvaSessione('workspace', data.workspaceId, data.nomeAzienda, data.logoUrl)
    setWorkspaceId(data.workspaceId)
    setNomeAzienda(data.nomeAzienda)
    setLogoUrl(data.logoUrl || '')
    setVista('dashboard')
  }

  const logout = () => {
    cancellaSessione()
    setWorkspaceId(null)
    setLeads([])
    setVista('login')
  }

  const esporta = async () => {
    setEsportazione(true)
    setEsito(null)
    try {
      const res = await fetch('/api/esporta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: workspaceId }),
      })
      const data = await res.json()
      if (!res.ok) setEsito(`❌ ${data.error ?? 'Errore'}`)
      else if (data.esportati) { setEsito(`✅ ${data.esportati} lead esportati`); carica() }
      else setEsito(data.message || 'Nessun lead da esportare')
    } catch (e: any) {
      setEsito(`❌ ${e?.message ?? 'Errore'}`)
    } finally {
      setEsportazione(false)
    }
  }

  if (vista === 'loading') return null
  if (vista === 'landing') return <LandingPage />
  if (vista === 'login') return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex flex-col items-center sticky top-0 z-10 shadow-sm">
        <img src="/favicon.png" alt="VoiceLeads" className="h-10 w-auto mb-1" />
        <div className="flex flex-col items-center leading-tight">
          <span className="font-bold text-base tracking-tight text-gray-900">VoiceLeads</span>
          <span className="text-xs text-gray-400 tracking-wide">by Hermes Marketing</span>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6"><PinLogin titolo="VoiceLeads" slug={slug} onSuccess={onLogin} /></div>
    </div>
  )

  // Dashboard
  const totale = leads.length
  const pronti = leads.filter(l => l.stato === 'completo').length
  const daCompletare = leads.filter(l => l.stato === 'bozza').length
  const visibili = leads.filter(l => {
    if (filtro === 'tutti') return true
    if (filtro === 'completo') return l.stato === 'completo' || l.stato === 'esportato'
    return l.stato === 'bozza'
  })

  return (
    <div className="bg-gray-50 min-h-screen">
    <header className="bg-white border-b border-gray-200 px-4 py-4 flex flex-col items-center sticky top-0 z-10 shadow-sm">
      <img src="/favicon.png" alt="VoiceLeads" className="h-10 w-auto mb-1" />
      <div className="flex flex-col items-center leading-tight">
        <span className="font-bold text-base tracking-tight text-gray-900">VoiceLeads</span>
        <span className="text-xs text-gray-400 tracking-wide">by Hermes Marketing</span>
      </div>
    </header>
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl && <img src={logoUrl} alt={nomeAzienda} className="h-8 w-auto object-contain" />}
          <div>
            <p className="font-bold text-gray-900 leading-tight">{nomeAzienda}</p>
            <p className="text-xs text-gray-400">I tuoi lead</p>
          </div>
        </div>
        <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
          Esci
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Totale lead', valore: totale, colore: 'text-gray-900', bg: 'bg-white' },
          { label: 'Pronti export', valore: pronti, colore: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Da completare', valore: daCompletare, colore: 'text-amber-700', bg: 'bg-amber-50' },
        ].map(({ label, valore, colore, bg }) => (
          <div key={label} className={`${bg} rounded-2xl border border-gray-200 p-4 text-center shadow-sm`}>
            <p className={`text-2xl font-bold ${colore}`}>{valore}</p>
            <p className="text-xs text-gray-500 mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Link
          href={`/lead/nuovo?workspace_id=${workspaceId}`}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-hermes-500 px-4 py-3.5 text-sm font-semibold text-white hover:bg-hermes-600 shadow-sm transition-colors"
        >
          🎙️ Nuovo lead
        </Link>
        <button
          onClick={esporta}
          disabled={esportazione || pronti === 0}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {esportazione ? '⏳ Export…' : '📤 Esporta su Sheets'}
        </button>
      </div>

      {esito && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700">{esito}</div>
      )}

      <div className="flex gap-2">
        {(['tutti', 'completo', 'bozza'] as Filtro[]).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtro === f ? 'bg-hermes-500 text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'tutti' ? 'Tutti' : f === 'completo' ? '🟢 Pronti' : '🔴 Da completare'}
          </button>
        ))}
      </div>

      {caricamento ? (
        <p className="text-center text-gray-400 py-12">Caricamento…</p>
      ) : visibili.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🎙️</p>
          <p className="text-sm font-medium">Nessun lead ancora.</p>
          <p className="text-xs mt-1">Registra il primo con la voce!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visibili.map(lead => {
            const perc = calcolaCompletamento({
              nome: lead.nome, cognome: lead.cognome, azienda: lead.azienda,
              email: lead.email, telefono: lead.telefono, note: lead.note ?? '',
            })
            return (
              <li key={lead.id}>
                <Link href={`/lead/${lead.id}?workspace_id=${workspaceId}`}
                  className="block bg-white rounded-2xl border border-gray-200 p-4 hover:border-hermes-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{lead.nome} {lead.cognome}</p>
                      <p className="text-sm text-gray-500 truncate">{lead.azienda}</p>
                    </div>
                    <StatoBadge stato={lead.stato} />
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                      <span>{new Date(lead.data_registrazione).toLocaleDateString('it-IT')}</span>
                      <span className="font-medium">{perc}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${perc === 100 ? 'bg-green-500' : 'bg-hermes-400'}`} style={{ width: `${perc}%` }} />
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
    </div>
  )
}
