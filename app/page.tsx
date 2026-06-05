'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Lead } from '@/lib/types'
import { calcolaCompletamento } from '@/lib/types'
import StatoBadge from '@/components/StatoBadge'
import PinLogin from '@/components/PinLogin'
import { salvaSessione, leggiSessione, cancellaSessione } from '@/lib/session'

type Filtro = 'tutti' | 'completo' | 'bozza'

export default function Dashboard() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [nomeAzienda, setNomeAzienda] = useState('')
  const [slug, setSlug] = useState('')
  const [pronto, setPronto] = useState(false)

  const [leads, setLeads] = useState<Lead[]>([])
  const [filtro, setFiltro] = useState<Filtro>('tutti')
  const [esportazione, setEsportazione] = useState(false)
  const [esito, setEsito] = useState<string | null>(null)
  const [caricamento, setCaricamento] = useState(true)

  // Determina lo slug dal sottodominio oppure dal parametro ?slug= (per test in locale)
  useEffect(() => {
    const host = window.location.hostname
    const parts = host.split('.')
    const daSottodominio = parts.length >= 3 ? parts[0] : ''
    const daUrl = new URLSearchParams(window.location.search).get('slug') ?? ''
    const rilevato = daSottodominio || daUrl
    setSlug(rilevato)

    // Controlla sessione salvata
    const sessione = leggiSessione()
    if (sessione?.tipo === 'workspace' && sessione.workspaceId) {
      setWorkspaceId(sessione.workspaceId)
    }
    setPronto(true)
  }, [])

  useEffect(() => {
    if (workspaceId) carica()
  }, [workspaceId])

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
    salvaSessione('workspace', data.workspaceId)
    setWorkspaceId(data.workspaceId)
    setNomeAzienda(data.nomeAzienda)
  }

  const logout = () => {
    cancellaSessione()
    setWorkspaceId(null)
    setLeads([])
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
      if (!res.ok) {
        setEsito(`❌ ${data.error ?? 'Errore durante l\'esportazione'}`)
      } else if (data.esportati) {
        setEsito(`✅ ${data.esportati} lead esportati su Google Sheets`)
        carica()
      } else {
        setEsito(data.message || 'Nessun lead da esportare')
      }
    } catch (e: any) {
      setEsito(`❌ ${e?.message ?? 'Errore'}`)
    } finally {
      setEsportazione(false)
    }
  }

  if (!pronto) return null

  if (!workspaceId) {
    return (
      <PinLogin
        titolo="VoiceLead"
        sottotitolo={slug ? `Accesso a ${slug}` : 'Inserisci il PIN'}
        onSuccess={onLogin}
      />
    )
  }

  const totale = leads.length
  const pronti = leads.filter(l => l.stato === 'completo').length
  const daCompletare = leads.filter(l => l.stato === 'bozza').length

  const visibili = leads.filter(l => {
    if (filtro === 'tutti') return true
    if (filtro === 'completo') return l.stato === 'completo' || l.stato === 'esportato'
    return l.stato === 'bozza'
  })

  return (
    <div className="space-y-5">
      {/* Header workspace */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {nomeAzienda && <span className="font-medium text-gray-700">{nomeAzienda}</span>}
        </p>
        <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600">
          Esci
        </button>
      </div>

      {/* Counter */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Totale lead', valore: totale, colore: 'text-gray-900' },
          { label: 'Pronti export', valore: pronti, colore: 'text-green-700' },
          { label: 'Da completare', valore: daCompletare, colore: 'text-amber-700' },
        ].map(({ label, valore, colore }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${colore}`}>{valore}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Azioni */}
      <div className="flex gap-2">
        <Link
          href={`/lead/nuovo?workspace_id=${workspaceId}`}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700"
        >
          🎙️ Nuovo lead
        </Link>
        <button
          onClick={esporta}
          disabled={esportazione || pronti === 0}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {esportazione ? '⏳ Export…' : '📤 Esporta su Sheets'}
        </button>
      </div>

      {esito && (
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700">
          {esito}
        </div>
      )}

      {/* Filtri */}
      <div className="flex gap-2">
        {(['tutti', 'completo', 'bozza'] as Filtro[]).map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtro === f ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'tutti' ? 'Tutti' : f === 'completo' ? '🟢 Pronti' : '🔴 Da completare'}
          </button>
        ))}
      </div>

      {/* Lista lead */}
      {caricamento ? (
        <p className="text-center text-gray-400 py-12">Caricamento…</p>
      ) : visibili.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎙️</p>
          <p className="text-sm">Nessun lead ancora. Registra il primo!</p>
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
                <Link
                  href={`/lead/${lead.id}?workspace_id=${workspaceId}`}
                  className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{lead.nome} {lead.cognome}</p>
                      <p className="text-sm text-gray-500 truncate">{lead.azienda}</p>
                    </div>
                    <StatoBadge stato={lead.stato} />
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{new Date(lead.data_registrazione).toLocaleDateString('it-IT')}</span>
                      <span>{perc}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${perc === 100 ? 'bg-green-500' : 'bg-indigo-400'}`}
                        style={{ width: `${perc}%` }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
