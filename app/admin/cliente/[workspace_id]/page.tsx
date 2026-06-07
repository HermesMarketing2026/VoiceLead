'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { leggiSessione } from '@/lib/session'

interface Dati {
  workspace: {
    id: string
    nome_azienda: string
    slug: string
    has_gestisci: boolean
    fatturazione: string | null
    scadenza_il: string | null
    sospeso: boolean
    creato_il: string
    nome_referente: string | null
    cognome_referente: string | null
    logo_url: string | null
    settore: string | null
    num_dipendenti: string | null
    fatturato: string | null
  }
  ordine: {
    id: string
    ragione_sociale: string
    partita_iva: string
    codice_sdi: string | null
    pec: string | null
    indirizzo: string
    cap: string
    citta: string
    provincia: string
    piano: string
    fatturazione: string
    max_commerciali: number
    totale: number
    creato_il: string
  } | null
  utenti: { id: string; nome: string; cognome: string; ruolo: string }[]
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function pianoLabel(has_gestisci: boolean) {
  return has_gestisci ? 'Pro — Registra + Gestisci' : 'Base — Registra'
}

function statoAbb(ws: Dati['workspace']) {
  if (ws.sospeso) return { label: 'Sospeso', color: 'text-red-600' }
  if (!ws.scadenza_il) return { label: 'Attivo', color: 'text-green-600' }
  const giorni = Math.ceil((new Date(ws.scadenza_il).getTime() - Date.now()) / 86400000)
  if (giorni < 0) return { label: 'Scaduto', color: 'text-red-600' }
  if (giorni <= 30) return { label: `Attivo (scade tra ${giorni}gg)`, color: 'text-amber-600' }
  return { label: 'Attivo', color: 'text-green-600' }
}

export default function SchedaClientePage() {
  const { workspace_id } = useParams<{ workspace_id: string }>()
  const router = useRouter()
  const [dati, setDati] = useState<Dati | null>(null)
  const [caricamento, setCaricamento] = useState(true)

  useEffect(() => {
    const sessione = leggiSessione()
    if (sessione?.tipo !== 'admin') { router.replace('/admin'); return }
    fetch(`/api/abbonamenti/${workspace_id}`)
      .then(r => r.json())
      .then(setDati)
      .finally(() => setCaricamento(false))
  }, [workspace_id])

  if (caricamento) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-hermes-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!dati) return null

  const { workspace: ws, ordine, utenti } = dati
  const stato = statoAbb(ws)
  const oggi = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })

  const Riga = ({ label, valore }: { label: string; valore: string | null | undefined }) =>
    valore ? (
      <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-semibold text-gray-900 text-right max-w-xs">{valore}</span>
      </div>
    ) : null

  return (
    <>
      {/* Controlli — nascosti in stampa */}
      <div className="print:hidden bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Admin</button>
          <h1 className="text-lg font-bold text-gray-900 mt-1">Scheda cliente — {ws.nome_azienda}</h1>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-hermes-500 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-hermes-600 transition-colors shadow-sm text-sm"
        >
          🖨️ Stampa / Salva PDF
        </button>
      </div>

      {/* Documento */}
      <div className="max-w-2xl mx-auto px-8 py-10 print:px-6 print:py-8 space-y-8">

        {/* Intestazione */}
        <div className="flex items-start justify-between border-b-2 border-gray-900 pb-6">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Hermes Marketing S.r.l.s — VoiceLeads</p>
            <h1 className="text-3xl font-extrabold text-gray-900">{ws.nome_azienda}</h1>
            {ws.logo_url && (
              <img src={ws.logo_url} alt="Logo" className="h-10 object-contain mt-2 print:h-8" />
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Scheda generata il</p>
            <p className="text-sm font-bold text-gray-900">{oggi}</p>
            <p className="text-xs font-mono text-gray-400 mt-1">{ws.slug}.voiceleads.it</p>
          </div>
        </div>

        {/* Abbonamento */}
        <div>
          <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-widest mb-3">Abbonamento</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-0">
            <Riga label="Piano" valore={pianoLabel(ws.has_gestisci)} />
            <Riga label="Fatturazione" valore={ws.fatturazione ? ws.fatturazione.charAt(0).toUpperCase() + ws.fatturazione.slice(1) : null} />
            <Riga label="N° commerciali" valore={ordine ? String(ordine.max_commerciali) : null} />
            <Riga label="Importo / periodo" valore={ordine ? `€${Number(ordine.totale).toFixed(2)} + IVA` : null} />
            <Riga label="Attivato il" valore={fmt(ws.creato_il)} />
            <Riga label="Scadenza" valore={ws.scadenza_il ? fmt(ws.scadenza_il) : '—'} />
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">Stato</span>
              <span className={`text-sm font-bold ${stato.color}`}>{stato.label}</span>
            </div>
          </div>
        </div>

        {/* Dati fatturazione */}
        {ordine && (
          <div>
            <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-widest mb-3">Dati fatturazione</h2>
            <div className="bg-gray-50 rounded-xl p-4 space-y-0">
              <Riga label="Ragione sociale" valore={ordine.ragione_sociale} />
              <Riga label="Partita IVA" valore={ordine.partita_iva} />
              <Riga label="Codice SDI" valore={ordine.codice_sdi} />
              <Riga label="PEC" valore={ordine.pec} />
              <Riga label="Indirizzo" valore={`${ordine.indirizzo}, ${ordine.cap} ${ordine.citta} (${ordine.provincia})`} />
              <Riga label="Ordine registrato il" valore={fmt(ordine.creato_il)} />
            </div>
          </div>
        )}

        {/* Responsabile */}
        <div>
          <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-widest mb-3">Responsabile workspace</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-0">
            <Riga label="Nome" valore={ws.nome_referente && ws.cognome_referente ? `${ws.nome_referente} ${ws.cognome_referente}` : ws.nome_referente} />
            <Riga label="Settore" valore={ws.settore} />
            <Riga label="N° dipendenti" valore={ws.num_dipendenti} />
            <Riga label="Fatturato annuo" valore={ws.fatturato} />
          </div>
        </div>

        {/* Commerciali */}
        {utenti.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-widest mb-3">
              Commerciali ({utenti.length})
            </h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-2">
                {utenti.map((u, i) => (
                  <div key={u.id} className="flex items-center gap-2 py-1">
                    <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                    <span className="text-sm font-medium text-gray-800">{u.nome} {u.cognome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4 text-xs text-gray-400 text-center">
          Documento riservato — Hermes Marketing S.r.l.s · VoiceLeads · {oggi}
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 1.5cm; }
        }
      `}</style>
    </>
  )
}
