'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Lead } from '@/lib/types'
import { calcolaCompletamento } from '@/lib/types'
import StatoBadge from '@/components/StatoBadge'
import AppShell from '@/components/AppShell'
import { leggiSessione } from '@/lib/session'

type Filtro = 'tutti' | 'completo' | 'bozza'

function RegistraDashboard() {
  const params = useSearchParams()
  const router = useRouter()
  const workspaceId = params.get('workspace_id') ?? leggiSessione()?.workspaceId ?? ''
  const utenteId = params.get('utente_id') ?? leggiSessione()?.utenteId ?? ''

  const [leads, setLeads] = useState<Lead[]>([])
  const [filtro, setFiltro] = useState<Filtro>('tutti')
  const [esportazione, setEsportazione] = useState(false)
  const [svuotamento, setSvuotamento] = useState(false)
  const [confermaSvuota, setConfermaSvuota] = useState(false)
  const [esito, setEsito] = useState<string | null>(null)
  const [caricamento, setCaricamento] = useState(true)

  useEffect(() => {
    if (!workspaceId) { router.push('/'); return }
    carica()
  }, [workspaceId])

  const carica = async () => {
    setCaricamento(true)
    const url = utenteId ? `/api/leads?workspace_id=${workspaceId}&utente_id=${utenteId}` : `/api/leads?workspace_id=${workspaceId}`
    const res = await fetch(url)
    const data = await res.json()
    setLeads(Array.isArray(data) ? data : [])
    setCaricamento(false)
  }

  const giorniRimanenti = (dataRegistrazione: string) => {
    const creato = new Date(dataRegistrazione).getTime()
    const scadenza = creato + 30 * 24 * 60 * 60 * 1000
    return Math.max(0, Math.ceil((scadenza - Date.now()) / (1000 * 60 * 60 * 24)))
  }

  const svuotaEsportati = async () => {
    setSvuotamento(true)
    setEsito(null)
    try {
      const res = await fetch('/api/leads/svuota', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: workspaceId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEsito(`🗑️ ${data.cancellati} lead esportati rimossi dall'archivio`)
      setConfermaSvuota(false)
      carica()
    } catch (e: any) {
      setEsito(`❌ ${e?.message ?? 'Errore'}`)
    } finally {
      setSvuotamento(false)
    }
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

  const totale = leads.length
  const pronti = leads.filter(l => l.stato === 'completo').length
  const daCompletare = leads.filter(l => l.stato === 'bozza').length
  const esportati = leads.filter(l => l.stato === 'esportato').length
  const visibili = leads.filter(l => {
    if (filtro === 'tutti') return true
    if (filtro === 'completo') return l.stato === 'completo' || l.stato === 'esportato'
    return l.stato === 'bozza'
  })

  return (
    <AppShell>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Home</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-700">🎙️ Registra lead</span>
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
            href={`/lead/nuovo?workspace_id=${workspaceId}${utenteId ? `&utente_id=${utenteId}` : ''}`}
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

        {esportati > 0 && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  🔒 {esportati} lead {esportati === 1 ? 'è stato esportato' : 'sono stati esportati'} su Google Sheets
                </p>
                <p className="text-xs text-blue-600 mt-0.5">Verranno rimossi automaticamente dopo 30 giorni.</p>
              </div>
              {!confermaSvuota ? (
                <button onClick={() => setConfermaSvuota(true)} className="shrink-0 text-xs text-blue-600 underline hover:text-blue-800 whitespace-nowrap">
                  Svuota ora
                </button>
              ) : (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setConfermaSvuota(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg border border-gray-300 bg-white">Annulla</button>
                  <button onClick={svuotaEsportati} disabled={svuotamento} className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-lg disabled:opacity-50">
                    {svuotamento ? '…' : 'Conferma'}
                  </button>
                </div>
              )}
            </div>
          </div>
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
              const giorni = giorniRimanenti(lead.data_registrazione)
              const urgente = giorni <= 3
              const avviso = giorni <= 10
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
                      <div className={`mt-2 flex items-center gap-1.5 text-xs font-semibold rounded-lg px-2.5 py-1.5 ${
                        urgente ? 'bg-red-50 text-red-600 border border-red-200'
                        : avviso ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-gray-50 text-gray-400 border border-gray-200'
                      }`}>
                        <span>{urgente ? '🔴' : avviso ? '⚠️' : '🕐'}</span>
                        <span>
                          {giorni === 0 ? 'Eliminato oggi'
                            : giorni === 1 ? 'Sparisce domani — esporta subito!'
                            : `Sparisce tra ${giorni} giorni`}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </AppShell>
  )
}

export default function RegistraPage() {
  return <Suspense><RegistraDashboard /></Suspense>
}
