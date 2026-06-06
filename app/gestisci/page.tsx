'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Lead, Azione } from '@/lib/types'
import { LABEL_STATO_GESTIONE } from '@/lib/types'
import AppShell from '@/components/AppShell'
import { leggiSessione } from '@/lib/session'

interface LeadConAzione extends Lead {
  prossimaAzione?: Azione
}

function scadenzaInfo(scadenza: string): { label: string; colore: string; bg: string; border: string } {
  const ora = Date.now()
  const sc = new Date(scadenza).getTime()
  const oggi = new Date()
  oggi.setHours(23, 59, 59, 999)
  const domani = new Date(oggi); domani.setDate(domani.getDate() + 1)

  if (sc < ora) return { label: 'Scaduta', colore: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
  if (sc <= oggi.getTime()) return { label: 'Oggi', colore: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' }
  const giorni = Math.ceil((sc - ora) / (1000 * 60 * 60 * 24))
  return {
    label: giorni === 1 ? 'Domani' : `Fra ${giorni}gg`,
    colore: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
  }
}

function iniziali(lead: Lead) {
  return `${lead.nome?.[0] ?? ''}${lead.cognome?.[0] ?? ''}`.toUpperCase()
}

function GestisciDashboard() {
  const params = useSearchParams()
  const router = useRouter()
  const workspaceId = params.get('workspace_id') ?? leggiSessione()?.workspaceId ?? ''

  const [leads, setLeads] = useState<LeadConAzione[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [sincronizzazione, setSincronizzazione] = useState(false)
  const [esitoSync, setEsitoSync] = useState<string | null>(null)

  useEffect(() => {
    if (!workspaceId) { router.push('/'); return }
    carica()
  }, [workspaceId])

  const carica = async () => {
    setCaricamento(true)
    try {
      const res = await fetch(`/api/leads?workspace_id=${workspaceId}`)
      const data: Lead[] = await res.json()
      const inGestione = data.filter(l => l.in_gestione)

      // Fetch prossima azione per ogni lead
      const leadsConAzione = await Promise.all(
        inGestione.map(async lead => {
          const aRes = await fetch(`/api/azioni?lead_id=${lead.id}`)
          const azioni: Azione[] = await aRes.json()
          const attive = azioni.filter(a => !a.completata).sort(
            (a, b) => new Date(a.scadenza).getTime() - new Date(b.scadenza).getTime()
          )
          return { ...lead, prossimaAzione: attive[0] }
        })
      )

      setLeads(leadsConAzione)
    } finally {
      setCaricamento(false)
    }
  }

  const sincronizzaSheets = async () => {
    setSincronizzazione(true)
    setEsitoSync(null)
    try {
      const res = await fetch('/api/gestisci/sync-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: workspaceId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEsitoSync(`✅ ${data.aggiornati} lead aggiornati su Google Sheets`)
    } catch (e: any) {
      setEsitoSync(`❌ ${e?.message ?? 'Errore sincronizzazione'}`)
    } finally {
      setSincronizzazione(false)
      setTimeout(() => setEsitoSync(null), 4000)
    }
  }

  const oggi = new Date(); oggi.setHours(23, 59, 59, 999)
  const leadOggi = leads.filter(l => l.prossimaAzione && new Date(l.prossimaAzione.scadenza) <= oggi)
  const leadFuturi = leads.filter(l => !l.prossimaAzione || new Date(l.prossimaAzione.scadenza) > oggi)

  const renderCard = (lead: LeadConAzione) => {
    const info = lead.prossimaAzione ? scadenzaInfo(lead.prossimaAzione.scadenza) : null
    return (
      <li key={lead.id}>
        <Link
          href={`/gestisci/${lead.id}?workspace_id=${workspaceId}`}
          className="flex items-start gap-4 bg-white rounded-2xl border border-gray-200 p-4 hover:border-hermes-300 hover:shadow-md transition-all"
        >
          {/* Avatar */}
          <div className="shrink-0 w-11 h-11 rounded-full bg-hermes-100 flex items-center justify-center text-hermes-700 font-bold text-sm">
            {iniziali(lead)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-gray-900 truncate">{lead.nome} {lead.cognome}</p>
              <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-hermes-50 text-hermes-700 border border-hermes-200">
                {LABEL_STATO_GESTIONE[lead.stato_gestione]}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate">{lead.azienda}</p>

            {lead.prossimaAzione && info ? (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600 truncate">→ {lead.prossimaAzione.testo}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.bg} ${info.colore} border ${info.border}`}>
                    {info.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(lead.prossimaAzione.scadenza).toLocaleDateString('it-IT')}
                  </span>
                  {lead.prossimaAzione.scadenza_automatica && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-200">auto</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Nessuna azione pianificata</p>
            )}
          </div>
        </Link>
      </li>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Home</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-700">📋 Gestisci trattative</span>
          </div>
          <button
            onClick={sincronizzaSheets}
            disabled={sincronizzazione || leads.length === 0}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {sincronizzazione ? '⏳ Sync…' : '📤 Aggiorna Sheets'}
          </button>
        </div>

        {esitoSync && (
          <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-700">
            {esitoSync}
          </div>
        )}

        {caricamento ? (
          <p className="text-center text-gray-400 py-12">Caricamento…</p>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-sm font-medium">Nessuna trattativa in gestione.</p>
            <p className="text-xs mt-1">Promuovi un lead completo dalla scheda lead.</p>
          </div>
        ) : (
          <>
            {/* Sezione Oggi */}
            {leadOggi.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base font-bold text-gray-900">Oggi</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    {leadOggi.length}
                  </span>
                </div>
                <ul className="space-y-3">{leadOggi.map(renderCard)}</ul>
              </div>
            )}

            {/* Lista completa */}
            {leadFuturi.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
                  {leadOggi.length > 0 ? 'Prossimamente' : 'In gestione'}
                </p>
                <ul className="space-y-3">{leadFuturi.map(renderCard)}</ul>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}

export default function GestisciPage() {
  return <Suspense><GestisciDashboard /></Suspense>
}
