'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Lead, Azione } from '@/lib/types'
import { LABEL_STATO_GESTIONE } from '@/lib/types'
import AppShell from '@/components/AppShell'
import { FaqGestisci } from '@/components/FaqInApp'
import { leggiSessione, workspaceAuthHeader } from '@/lib/session'

interface LeadConAzione extends Lead {
  prossimaAzione?: Azione
}

function scadenzaInfo(scadenza: string): { label: string; colore: string; bg: string; border: string } {
  const ora = Date.now()
  const sc = new Date(scadenza).getTime()
  const oggi = new Date(); oggi.setHours(23, 59, 59, 999)

  if (sc < ora) return { label: 'Scaduta', colore: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' }
  if (sc <= oggi.getTime()) return { label: 'Oggi', colore: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' }
  const giorni = Math.ceil((sc - ora) / (1000 * 60 * 60 * 24))
  return {
    label: giorni === 1 ? 'Domani' : `Fra ${giorni}gg`,
    colore: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200',
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
  const [chiusi, setChiusi] = useState<Lead[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [riaprendo, setRiaprendo] = useState<string | null>(null)

  useEffect(() => {
    if (!workspaceId) { router.push('/'); return }
    carica()
  }, [workspaceId])

  const carica = async () => {
    setCaricamento(true)
    try {
      const authH = workspaceAuthHeader()
      const res = await fetch(`/api/leads?workspace_id=${workspaceId}`, { headers: authH })
      const data: Lead[] = await res.json()

      // Lead attivi in gestione
      const inGestione = data.filter(l => l.in_gestione)
      const leadsConAzione = await Promise.all(
        inGestione.map(async lead => {
          const aRes = await fetch(`/api/azioni?lead_id=${lead.id}`, { headers: authH })
          const azioni: Azione[] = await aRes.json()
          const attive = azioni.filter(a => !a.completata).sort(
            (a, b) => new Date(a.scadenza).getTime() - new Date(b.scadenza).getTime()
          )
          return { ...lead, prossimaAzione: attive[0] }
        })
      )
      setLeads(leadsConAzione)

      // Lead chiusi negli ultimi 30 giorni (poi cancellati automaticamente per GDPR)
      const trentaGiorni = Date.now() - 30 * 24 * 60 * 60 * 1000
      const recentiChiusi = data.filter(l =>
        !l.in_gestione && l.esito && l.data_esito && new Date(l.data_esito).getTime() > trentaGiorni
      )
      setChiusi(recentiChiusi)
    } finally {
      setCaricamento(false)
    }
  }

  const riapri = async (leadId: string) => {
    setRiaprendo(leadId)
    try {
      await fetch('/api/gestisci/riapri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...workspaceAuthHeader() },
        body: JSON.stringify({ lead_id: leadId }),
      })
      carica()
    } finally {
      setRiaprendo(null)
    }
  }

  const scaricaCsv = () => {
    const tuttiLead = [
      ...leads.map(l => ({ ...l, chiuso: false })),
      ...chiusi.map(l => ({ ...l, prossimaAzione: undefined, chiuso: true })),
    ]
    const righe = [
      ['Nome', 'Cognome', 'Azienda', 'Telefono', 'Email', 'Stato', 'Esito', 'Prossima azione', 'Data prossima azione'],
      ...tuttiLead.map(l => [
        l.nome ?? '',
        l.cognome ?? '',
        l.azienda ?? '',
        l.telefono ?? '',
        l.email ?? '',
        l.stato_gestione ?? '',
        l.esito ?? '',
        (l as LeadConAzione).prossimaAzione?.testo ?? '',
        (l as LeadConAzione).prossimaAzione
          ? new Date((l as LeadConAzione).prossimaAzione!.scadenza).toLocaleDateString('it-IT')
          : '',
      ]),
    ]
    const csv = righe.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gestisci_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
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
                  <span className="text-xs text-gray-400">{new Date(lead.prossimaAzione.scadenza).toLocaleDateString('it-IT')}</span>
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
            onClick={scaricaCsv}
            disabled={leads.length === 0 && chiusi.length === 0}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ⬇️ Scarica CSV
          </button>
        </div>

        {caricamento ? (
          <p className="text-center text-gray-400 py-12">Caricamento…</p>
        ) : leads.length === 0 && chiusi.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📋</p>
            <p className="text-sm font-medium">Nessuna trattativa in gestione.</p>
            <p className="text-xs mt-1">Completa un lead dalla sezione Registra per iniziare.</p>
          </div>
        ) : (
          <>
            {leadOggi.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base font-bold text-gray-900">Oggi</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">{leadOggi.length}</span>
                </div>
                <ul className="space-y-3">{leadOggi.map(renderCard)}</ul>
              </div>
            )}

            {leadFuturi.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
                  {leadOggi.length > 0 ? 'Prossimamente' : 'In gestione'}
                </p>
                <ul className="space-y-3">{leadFuturi.map(renderCard)}</ul>
              </div>
            )}

            {/* Chiuse di recente */}
            {chiusi.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">Chiuse di recente</p>
                <ul className="space-y-3">
                  {chiusi.map(lead => (
                    <li key={lead.id} className={`flex items-center gap-4 rounded-2xl border p-4 ${
                      lead.esito === 'vinto' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
                        lead.esito === 'vinto' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {iniziali(lead)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate">{lead.nome} {lead.cognome}</p>
                          <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                            lead.esito === 'vinto' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {lead.esito === 'vinto' ? '🏆 Vinto' : '❌ Perso'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{lead.azienda}</p>
                        {lead.data_esito && (() => {
                          const chiusaIl = new Date(lead.data_esito)
                          const scadenza = new Date(chiusaIl.getTime() + 30 * 24 * 60 * 60 * 1000)
                          const rimanenti = Math.max(0, Math.ceil((scadenza.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                          const urgente = rimanenti <= 3
                          return (
                            <div className="mt-1 space-y-0.5">
                              <p className="text-xs text-gray-400">
                                Chiusa il {chiusaIl.toLocaleDateString('it-IT')}
                                {lead.durata_trattativa_giorni ? ` · ${lead.durata_trattativa_giorni}gg` : ''}
                              </p>
                              <p className={`text-xs font-semibold ${urgente ? 'text-red-500' : 'text-gray-400'}`}>
                                {urgente ? '🔴' : '🕐'} Sparisce tra {rimanenti} giorni
                              </p>
                            </div>
                          )
                        })()}
                      </div>
                      <button
                        onClick={() => riapri(lead.id)}
                        disabled={riaprendo === lead.id}
                        className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        {riaprendo === lead.id ? '…' : '↩ Riapri'}
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-400 text-center mt-2">Visibili per 30 giorni dalla chiusura, poi eliminati automaticamente per la privacy</p>
              </div>
            )}
          </>
        )}

        <FaqGestisci />
      </div>
    </AppShell>
  )
}

export default function GestisciPage() {
  return <Suspense><GestisciDashboard /></Suspense>
}
