'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Lead } from '@/lib/types'
import { calcolaCompletamento } from '@/lib/types'
import StatoBadge from '@/components/StatoBadge'
import AppShell from '@/components/AppShell'
import { FaqRegistra } from '@/components/FaqInApp'
import { leggiSessione, workspaceAuthHeader } from '@/lib/session'

type Filtro = 'tutti' | 'completo' | 'bozza'
type Ordinamento = 'recenti' | 'meno-recenti' | 'nome-az'

function RegistraDashboard() {
  const params = useSearchParams()
  const router = useRouter()
  const workspaceId = params.get('workspace_id') ?? leggiSessione()?.workspaceId ?? ''
  const utenteId = params.get('utente_id') ?? leggiSessione()?.utenteId ?? ''

  const [leads, setLeads] = useState<Lead[]>([])
  const filtroParam = (params.get('filtro') as Filtro) ?? 'tutti'
  const [filtro, setFiltro] = useState<Filtro>(filtroParam)
  const [ricerca, setRicerca] = useState('')
  const [ordinamento, setOrdinamento] = useState<Ordinamento>('recenti')
  const [esportazione, setEsportazione] = useState(false)
  const [svuotamento, setSvuotamento] = useState(false)
  const [confermaSvuota, setConfermaSvuota] = useState(false)
  const [esito, setEsito] = useState<string | null>(null)
  const [caricamento, setCaricamento] = useState(true)
  const esitoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!workspaceId) { router.push('/'); return }
    carica()
  }, [workspaceId])

  const mostraEsito = (msg: string, autoDismiss = true) => {
    setEsito(msg)
    if (autoDismiss) {
      clearTimeout(esitoTimerRef.current!)
      esitoTimerRef.current = setTimeout(() => setEsito(null), 4000)
    }
  }

  useEffect(() => () => clearTimeout(esitoTimerRef.current!), [])

  const carica = async () => {
    setCaricamento(true)
    const url = utenteId ? `/api/leads?workspace_id=${workspaceId}&utente_id=${utenteId}` : `/api/leads?workspace_id=${workspaceId}`
    const res = await fetch(url, { headers: workspaceAuthHeader() })
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
        headers: { 'Content-Type': 'application/json', ...workspaceAuthHeader() },
        body: JSON.stringify({ workspace_id: workspaceId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      mostraEsito(`🗑️ ${data.cancellati} lead esportati rimossi dall'archivio`)
      setConfermaSvuota(false)
      carica()
    } catch (e: any) {
      mostraEsito(`❌ ${e?.message ?? 'Errore'}`)
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
        headers: { 'Content-Type': 'application/json', ...workspaceAuthHeader() },
        body: JSON.stringify({ workspace_id: workspaceId }),
      })
      if (res.status === 200 && res.headers.get('content-type')?.includes('text/csv')) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
        mostraEsito('✅ CSV scaricato con successo!')
        carica()
      } else {
        const data = await res.json()
        if (!res.ok) mostraEsito(`❌ ${data.error ?? 'Errore'}`)
        else mostraEsito(data.message || 'Nessun lead da esportare')
      }
    } catch (e: any) {
      mostraEsito(`❌ ${e?.message ?? 'Errore'}`)
    } finally {
      setEsportazione(false)
    }
  }

  const totale = leads.length
  const pronti = leads.filter(l => l.stato === 'completo').length
  const daCompletare = leads.filter(l => l.stato === 'bozza').length
  const esportati = leads.filter(l => l.stato === 'esportato').length
  const visibili = leads
    .filter(l => {
      if (filtro === 'completo') return l.stato === 'completo' || l.stato === 'esportato'
      if (filtro === 'bozza') return l.stato === 'bozza'
      return true
    })
    .filter(l => {
      if (!ricerca.trim()) return true
      const q = ricerca.toLowerCase()
      return `${l.nome ?? ''} ${l.cognome ?? ''} ${l.azienda ?? ''}`.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (ordinamento === 'nome-az') return `${a.nome ?? ''} ${a.cognome ?? ''}`.localeCompare(`${b.nome ?? ''} ${b.cognome ?? ''}`, 'it')
      if (ordinamento === 'meno-recenti') return new Date(a.data_registrazione).getTime() - new Date(b.data_registrazione).getTime()
      return new Date(b.data_registrazione).getTime() - new Date(a.data_registrazione).getTime()
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
            {esportazione ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Esportazione…
            </>
          ) : '📥 Scarica CSV'}
          </button>
        </div>

        {esito && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
            esito.startsWith('✅') ? 'bg-green-50 border border-green-200 text-green-700'
            : esito.startsWith('❌') ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-gray-50 border border-gray-200 text-gray-700'
          }`}>
            {esito}
          </div>
        )}

        {esportati > 0 && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  🔒 {esportati} lead {esportati === 1 ? 'è stato esportato' : 'sono stati esportati'} via CSV
                </p>
                <p className="text-xs text-blue-600 mt-0.5">Verranno rimossi automaticamente dopo 60 giorni.</p>
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

        {/* Ricerca */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
          </svg>
          <input
            type="text"
            value={ricerca}
            onChange={e => setRicerca(e.target.value)}
            placeholder="Cerca per nome o azienda…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hermes-400 focus:border-transparent"
          />
          {ricerca && (
            <button onClick={() => setRicerca('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              ×
            </button>
          )}
        </div>

        {/* Filtri + ordinamento */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1.5">
            {(['tutti', 'completo', 'bozza'] as Filtro[]).map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filtro === f ? 'bg-hermes-500 text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f === 'tutti' ? 'Tutti' : f === 'completo' ? '🟢 Pronti' : '🔴 Bozze'}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <select
              value={ordinamento}
              onChange={e => setOrdinamento(e.target.value as Ordinamento)}
              className="text-xs rounded-lg border border-gray-200 px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-hermes-400"
            >
              <option value="recenti">Più recenti</option>
              <option value="meno-recenti">Meno recenti</option>
              <option value="nome-az">Nome A→Z</option>
            </select>
          </div>
        </div>

        {ricerca && visibili.length > 0 && (
          <p className="text-xs text-gray-400">{visibili.length} {visibili.length === 1 ? 'risultato' : 'risultati'} per "<strong>{ricerca}</strong>"</p>
        )}

        {caricamento ? (
          <p className="text-center text-gray-400 py-12">Caricamento…</p>
        ) : visibili.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">{ricerca ? '🔍' : '🎙️'}</p>
            <p className="text-sm font-medium">{ricerca ? 'Nessun lead trovato.' : 'Nessun lead ancora.'}</p>
            <p className="text-xs mt-1">{ricerca ? 'Prova con un nome diverso.' : 'Registra il primo con la voce!'}</p>
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

        <FaqRegistra />
      </div>
    </AppShell>
  )
}

export default function RegistraPage() {
  return <Suspense><RegistraDashboard /></Suspense>
}
