'use client'
import { useEffect, useState } from 'react'
import { leggiSessione, adminAuthHeader } from '@/lib/session'
import { useRouter } from 'next/navigation'

interface Ordine {
  id: string
  piano: string
  fatturazione: string
  max_commerciali: number
  totale: number
  ragione_sociale: string
  partita_iva: string
  codice_sdi: string | null
  pec: string | null
  indirizzo: string
  cap: string
  citta: string
  provincia: string
  stato: string
  creato_il: string
}

interface Workspace {
  id: string
  nome_azienda: string
  slug: string
  has_gestisci: boolean
  fatturazione: string | null
  scadenza_il: string | null
  sospeso: boolean
  creato_il: string
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function pianoLabel(piano: string) {
  return piano === 'registra_gestisci' ? 'Pro — Registra + Gestisci' : 'Base — Registra'
}

export default function FatturePage() {
  const router = useRouter()
  const [ordini, setOrdini] = useState<Ordine[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [confermaElimina, setConfermaElimina] = useState<string | null>(null)

  const eliminaOrdine = async (id: string) => {
    setEliminando(id)
    await fetch('/api/abbonamenti', { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...adminAuthHeader() }, body: JSON.stringify({ id }) })
    setOrdini(prev => prev.filter(o => o.id !== id))
    setConfermaElimina(null)
    setEliminando(null)
  }

  useEffect(() => {
    const sessione = leggiSessione()
    if (sessione?.tipo !== 'admin') { router.replace('/admin'); return }
    fetch('/api/abbonamenti', { headers: adminAuthHeader() })
      .then(r => r.json())
      .then(d => { setOrdini(d.ordini ?? []); setWorkspaces(d.workspaces ?? []) })
      .finally(() => setCaricamento(false))
  }, [])

  const oggi = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
  const totaleOrdini = ordini.reduce((s, o) => s + Number(o.totale), 0)

  if (caricamento) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-hermes-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <>
      {/* Controlli — nascosti in stampa */}
      <div className="print:hidden bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">← Admin</button>
          <h1 className="text-lg font-bold text-gray-900 mt-1">Report abbonamenti per amministrazione</h1>
          <p className="text-xs text-gray-400">Stampabile / Salvabile come PDF</p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-hermes-500 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-hermes-600 transition-colors shadow-sm text-sm"
        >
          🖨️ Stampa / Salva PDF
        </button>
      </div>

      {/* Documento stampabile */}
      <div className="max-w-4xl mx-auto px-8 py-10 print:px-6 print:py-8 space-y-10">

        {/* Intestazione */}
        <div className="flex items-start justify-between border-b-2 border-gray-900 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Hermes Marketing S.r.l.s</h1>
            <p className="text-sm text-gray-500 mt-1">VoiceLeads — Report abbonamenti</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Data documento</p>
            <p className="text-base font-bold text-gray-900">{oggi}</p>
          </div>
        </div>

        {/* Riepilogo */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Workspace attivi', valore: workspaces.filter(w => !w.sospeso).length },
            { label: 'Workspace sospesi', valore: workspaces.filter(w => w.sospeso).length },
            { label: 'Ordini verificati', valore: ordini.length },
          ].map(({ label, valore }) => (
            <div key={label} className="border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-3xl font-extrabold text-gray-900">{valore}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabella ordini */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ordini verificati — Dati fatturazione</h2>
          {ordini.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Nessun ordine verificato ancora.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200">Data</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200">Ragione sociale</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200">P.IVA</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200">SDI / PEC</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200">Piano</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200">Comm.</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200">Fattur.</th>
                  <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200 text-right">Totale</th>
                  <th className="px-3 py-2.5 border border-gray-200 print:hidden" />
                </tr>
              </thead>
              <tbody>
                {ordini.map((o, i) => (
                  <tr key={o.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2.5 border border-gray-200 whitespace-nowrap">{fmt(o.creato_il)}</td>
                    <td className="px-3 py-2.5 border border-gray-200 font-medium">{o.ragione_sociale}</td>
                    <td className="px-3 py-2.5 border border-gray-200 font-mono text-xs">{o.partita_iva}</td>
                    <td className="px-3 py-2.5 border border-gray-200 text-xs">{o.codice_sdi || o.pec || '—'}</td>
                    <td className="px-3 py-2.5 border border-gray-200">{pianoLabel(o.piano)}</td>
                    <td className="px-3 py-2.5 border border-gray-200 text-center">{o.max_commerciali}</td>
                    <td className="px-3 py-2.5 border border-gray-200 capitalize">{o.fatturazione}</td>
                    <td className="px-3 py-2.5 border border-gray-200 text-right font-bold">€{Number(o.totale).toFixed(2)}</td>
                    <td className="px-3 py-2.5 border border-gray-200 text-center print:hidden">
                      {confermaElimina === o.id ? (
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => setConfermaElimina(null)} className="text-xs text-gray-500 border border-gray-300 rounded px-2 py-1">No</button>
                          <button onClick={() => eliminaOrdine(o.id)} disabled={eliminando === o.id} className="text-xs text-white bg-red-500 rounded px-2 py-1 disabled:opacity-50">
                            {eliminando === o.id ? '…' : 'Sì'}
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfermaElimina(o.id)} className="text-xs text-red-400 hover:text-red-600">🗑️</button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-900 text-white">
                  <td colSpan={7} className="px-3 py-3 font-bold text-right">Totale imponibile</td>
                  <td className="px-3 py-3 font-extrabold text-right">€{totaleOrdini.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Tabella workspace attivi con scadenze */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Workspace — Stato abbonamenti</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200">Azienda</th>
                <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200">Piano</th>
                <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200">Fattur.</th>
                <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200">Attivato il</th>
                <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200">Scadenza</th>
                <th className="px-3 py-2.5 font-semibold text-gray-700 border border-gray-200 text-center">Stato</th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map((ws, i) => {
                const scaduto = ws.scadenza_il ? new Date(ws.scadenza_il) < new Date() : false
                const giorni = ws.scadenza_il
                  ? Math.ceil((new Date(ws.scadenza_il).getTime() - Date.now()) / 86400000)
                  : null
                return (
                  <tr key={ws.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2.5 border border-gray-200 font-medium">{ws.nome_azienda}</td>
                    <td className="px-3 py-2.5 border border-gray-200">{ws.has_gestisci ? 'Pro' : 'Base'}</td>
                    <td className="px-3 py-2.5 border border-gray-200 capitalize">{ws.fatturazione ?? '—'}</td>
                    <td className="px-3 py-2.5 border border-gray-200">{fmt(ws.creato_il)}</td>
                    <td className="px-3 py-2.5 border border-gray-200">
                      {ws.scadenza_il ? fmt(ws.scadenza_il) : '—'}
                      {giorni !== null && !ws.sospeso && giorni <= 30 && (
                        <span className="ml-2 text-xs text-amber-600 font-semibold">({giorni}gg)</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 border border-gray-200 text-center">
                      {ws.sospeso
                        ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Sospeso</span>
                        : scaduto
                          ? <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Da rinnovare</span>
                          : <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Attivo</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-200 pt-6 text-xs text-gray-400 text-center print:block">
          Documento generato automaticamente da VoiceLeads · Hermes Marketing S.r.l.s · {oggi}
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 1.5cm; }
          body { font-size: 11px; }
        }
      `}</style>
    </>
  )
}
