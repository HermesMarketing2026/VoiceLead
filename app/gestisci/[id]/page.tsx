'use client'
import { useEffect, useState, useRef, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Lead, Azione, StatoGestione } from '@/lib/types'
import { STEP_GESTIONE, LABEL_STATO_GESTIONE } from '@/lib/types'
import AppShell from '@/components/AppShell'
import { leggiSessione, workspaceAuthHeader } from '@/lib/session'

// ───── Progress bar step ─────
function BarraProgresso({ stato, esito }: { stato: StatoGestione; esito: string | null }) {
  const steps = [...STEP_GESTIONE, 'decisione'] as const
  const labels = [...STEP_GESTIONE.map(s => LABEL_STATO_GESTIONE[s]), 'Decisione']
  const current = esito ? steps.length - 1 : STEP_GESTIONE.indexOf(stato)

  return (
    <div className="flex items-start w-full">
      {steps.map((step, i) => {
        const attivo = i <= current
        const isLast = i === steps.length - 1
        return (
          <div key={step} className={`flex items-start flex-1 ${isLast ? 'justify-end' : ''}`}>
            {/* Cerchio + label */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                attivo ? 'bg-hermes-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                {i < current ? '✓' : i + 1}
              </div>
              <span className={`text-xs text-center leading-tight ${attivo ? 'text-hermes-600 font-semibold' : 'text-gray-400'}`}>
                {labels[i]}
              </span>
            </div>
            {/* Linea connettore */}
            {!isLast && (
              <div className={`h-1 flex-1 mt-3 mx-1 transition-colors rounded-full ${i < current ? 'bg-hermes-500' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ───── Mic button per aggiornamenti gestisci ─────
function MicGestisci({ onAggiornamento }: { onAggiornamento: (testo: string) => Promise<void> }) {
  const [stato, setStato] = useState<'idle' | 'ascolto' | 'elaborazione'>('idle')
  const [errore, setErrore] = useState<string | null>(null)
  const [supportato, setSupportato] = useState<boolean | null>(null)
  const riconoscimento = useRef<any>(null)

  useEffect(() => {
    setSupportato('SpeechRecognition' in window || 'webkitSpeechRecognition' in (window as any))
  }, [])

  const avvia = useCallback(async () => {
    setErrore(null)
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'it-IT'
    rec.continuous = false
    rec.interimResults = false
    riconoscimento.current = rec

    rec.onresult = async (e: any) => {
      const testo = e.results[0][0].transcript
      setStato('elaborazione')
      try {
        await onAggiornamento(testo)
      } catch {
        setErrore('Impossibile elaborare il testo. Riprova.')
      } finally {
        setStato('idle')
      }
    }

    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed') {
        setErrore('Permesso microfono negato.')
      } else {
        setErrore(`Errore microfono: ${e.error}`)
      }
      setStato('idle')
    }

    rec.onend = () => setStato(s => s === 'ascolto' ? 'elaborazione' : s)
    rec.start()
    setStato('ascolto')
  }, [onAggiornamento])

  const ferma = useCallback(() => {
    riconoscimento.current?.stop()
    setStato('idle')
  }, [])

  if (supportato === null) return <div className="h-32" />
  if (!supportato) return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      ⚠️ La dettatura vocale funziona solo su <strong>Chrome</strong> o <strong>Edge</strong>.
    </div>
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={stato === 'ascolto' ? ferma : avvia}
        disabled={stato === 'elaborazione'}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg transition-all duration-200 ${
          stato === 'ascolto'
            ? 'bg-red-500 text-white scale-110 shadow-red-200 shadow-xl'
            : stato === 'elaborazione'
            ? 'bg-gray-200 text-gray-400 cursor-wait'
            : 'bg-hermes-500 text-white hover:bg-hermes-600 active:scale-95 shadow-hermes-200'
        }`}
      >
        {stato === 'elaborazione' ? '⏳' : stato === 'ascolto' ? '⏹️' : '🎙️'}
        {stato === 'ascolto' && (
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
        )}
      </button>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {stato === 'ascolto' ? 'In ascolto… parla adesso'
            : stato === 'elaborazione' ? 'Elaborazione aggiornamento…'
            : 'Tocca per dettare un aggiornamento'}
        </p>
        {stato === 'idle' && (
          <p className="text-xs text-gray-400 mt-1">Es: "Ho chiamato Mario, vuole una proposta entro venerdì"</p>
        )}
      </div>
      {errore && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600 text-center">{errore}</div>
      )}
    </div>
  )
}

// ───── Main scheda ─────
function SchedaGestisciInner({ id }: { id: string }) {
  const params = useSearchParams()
  const router = useRouter()
  const workspaceId = params.get('workspace_id') ?? leggiSessione()?.workspaceId ?? ''

  const [lead, setLead] = useState<Lead | null>(null)
  const [azioni, setAzioni] = useState<Azione[]>([])
  const [confermaEsito, setConfermaEsito] = useState<'vinto' | 'perso' | null>(null)
  const [invioEsito, setInvioEsito] = useState(false)
  const [nota, setNota] = useState<string | null>(null)
  const [testoManuale, setTestoManuale] = useState('')
  const [invioManuale, setInvioManuale] = useState(false)
  const [confermaElimina, setConfermaElimina] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [modificaData, setModificaData] = useState(false)
  const [nuovaData, setNuovaData] = useState('')
  const [salvandoData, setSalvandoData] = useState(false)
  const [erroreAzione, setErroreAzione] = useState<string | null>(null)
  const [erroreCaricamento, setErroreCaricamento] = useState<string | null>(null)

  const caricaLead = async () => {
    try {
      const res = await fetch(`/api/leads/${id}`, { headers: workspaceAuthHeader() })
      if (!res.ok) throw new Error(`Errore ${res.status}`)
      setLead(await res.json())
    } catch {
      setErroreCaricamento('Impossibile caricare il lead. Riprova o torna indietro.')
    }
  }

  const caricaAzioni = async () => {
    try {
      const res = await fetch(`/api/azioni?lead_id=${id}`, { headers: workspaceAuthHeader() })
      if (!res.ok) throw new Error(`Errore ${res.status}`)
      setAzioni(await res.json())
    } catch {
      // non blocca il render, le azioni sono opzionali per la visualizzazione
    }
  }

  useEffect(() => {
    if (!workspaceId) { router.push('/'); return }
    caricaLead()
    caricaAzioni()
  }, [id])

  const onAggiornamento = async (testo: string) => {
    const res = await fetch('/api/aggiorna-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...workspaceAuthHeader() },
      body: JSON.stringify({ lead_id: id, testo, workspace_id: workspaceId }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)

    // Claude ha rilevato un esito definitivo → redirect automatico
    if (data.chiusaAutomaticamente) {
      const emoji = data.esito === 'vinto' ? '🏆' : '❌'
      setNota(`${emoji} Trattativa ${data.esito === 'vinto' ? 'vinta' : 'persa'} — ${data.noteAggiornamento}`)
      setTimeout(() => router.push(`/gestisci?workspace_id=${workspaceId}`), 2000)
      return
    }

    setNota(`✅ ${data.noteAggiornamento}`)
    await caricaLead()
    await caricaAzioni()
    setTimeout(() => setNota(null), 5000)
  }

  const inviaTestoManuale = async () => {
    if (!testoManuale.trim()) return
    setInvioManuale(true)
    try {
      await onAggiornamento(testoManuale.trim())
      setTestoManuale('')
    } catch {
      setNota('❌ Errore durante l\'elaborazione. Riprova.')
    } finally {
      setInvioManuale(false)
    }
  }

  const salvaData = async (azId: string) => {
    if (!nuovaData) return
    setSalvandoData(true)
    try {
      const res = await fetch('/api/azioni', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...workspaceAuthHeader() },
        body: JSON.stringify({ id: azId, scadenza: new Date(nuovaData).toISOString(), scadenza_automatica: false }),
      })
      if (!res.ok) throw new Error()
      setModificaData(false)
      setNuovaData('')
      caricaAzioni()
    } catch {
      setErroreAzione('Salvataggio data fallito. Riprova.')
    } finally {
      setSalvandoData(false)
    }
  }

  const completaAzione = async (azId: string, completata: boolean) => {
    try {
      const res = await fetch('/api/azioni', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...workspaceAuthHeader() },
        body: JSON.stringify({ id: azId, completata }),
      })
      if (!res.ok) throw new Error()
      caricaAzioni()
    } catch {
      setErroreAzione('Aggiornamento azione fallito. Riprova.')
    }
  }

  const eliminaTrattativa = async () => {
    setEliminando(true)
    try {
      const res = await fetch('/api/gestisci/elimina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...workspaceAuthHeader() },
        body: JSON.stringify({ lead_id: id }),
      })
      if (!res.ok) throw new Error('Errore')
      router.push(`/gestisci?workspace_id=${workspaceId}`)
    } catch {
      setEliminando(false)
      setConfermaElimina(false)
    }
  }

  const confermaChiudi = async (esito: 'vinto' | 'perso') => {
    setInvioEsito(true)
    try {
      const res = await fetch('/api/gestisci/esito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...workspaceAuthHeader() },
        body: JSON.stringify({ lead_id: id, esito, workspace_id: workspaceId }),
      })
      if (!res.ok) throw new Error('Errore')
      router.push(`/gestisci?workspace_id=${workspaceId}`)
    } catch {
      setInvioEsito(false)
      setConfermaEsito(null)
    }
  }

  if (!lead) return <AppShell><p className="text-center text-gray-400 py-12">Caricamento…</p></AppShell>

  const azioniAttive = azioni.filter(a => !a.completata).sort(
    (a, b) => new Date(a.scadenza).getTime() - new Date(b.scadenza).getTime()
  )
  const azioniCompletateRecenti = azioni
    .filter(a => a.completata)
    .sort((a, b) => new Date(b.scadenza).getTime() - new Date(a.scadenza).getTime())
    .slice(0, 2)
  const prossimaAzione = azioniAttive[0]
  const storicoAggiornamenti = azioni.filter(a => a.aggiornamento_dettato)

  if (erroreCaricamento) return (
    <AppShell>
      <div className="space-y-4 pt-8 text-center">
        <p className="text-red-600 text-sm font-medium">{erroreCaricamento}</p>
        <button onClick={() => { setErroreCaricamento(null); caricaLead(); caricaAzioni() }}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          Riprova
        </button>
      </div>
    </AppShell>
  )

  return (
    <AppShell>
      <div className="space-y-5 pb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link href={`/gestisci?workspace_id=${workspaceId}`} className="text-gray-400 hover:text-gray-600 text-sm">← Gestisci</Link>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{lead.nome} {lead.cognome}</h1>
          <p className="text-sm text-gray-500">{lead.azienda}</p>
        </div>

        {/* Barra progresso */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <BarraProgresso stato={lead.stato_gestione} esito={lead.esito} />
        </div>

        {erroreAzione && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center justify-between gap-3">
            <span>{erroreAzione}</span>
            <button onClick={() => setErroreAzione(null)} className="text-red-400 hover:text-red-600 shrink-0">×</button>
          </div>
        )}

        {/* Prossima azione */}
        {prossimaAzione && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs font-bold text-hermes-500 uppercase tracking-wider mb-3">📌 Prossima azione</p>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{prossimaAzione.testo}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs text-gray-500">
                    {new Date(prossimaAzione.scadenza).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => { setModificaData(v => !v); setNuovaData('') }}
                    className="text-xs text-hermes-500 hover:underline"
                  >
                    modifica data
                  </button>
                </div>
                {modificaData && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="date"
                      value={nuovaData}
                      onChange={e => setNuovaData(e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-hermes-400"
                    />
                    <button
                      onClick={() => salvaData(prossimaAzione.id)}
                      disabled={salvandoData || !nuovaData}
                      className="text-xs font-semibold px-3 py-1 rounded-lg bg-hermes-500 text-white hover:bg-hermes-600 disabled:opacity-40 transition-colors"
                    >
                      {salvandoData ? '…' : 'Salva'}
                    </button>
                    <button
                      onClick={() => setModificaData(false)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Annulla
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => completaAzione(prossimaAzione.id, true)}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
              >
                ✓ Fatto
              </button>
            </div>
          </div>
        )}

        {/* Azioni completate di recente */}
        {azioniCompletateRecenti.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">✅ Completate di recente</p>
            <div className="space-y-2">
              {azioniCompletateRecenti.map(az => (
                <div key={az.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-500 line-through truncate">{az.testo}</p>
                      <p className="text-xs text-gray-400">{new Date(az.scadenza).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => completaAzione(az.id, false)}
                    className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    title="Rimetti come da fare"
                  >
                    ↩ Riapri
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sezione aggiornamento: voce + testo */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <p className="text-xs font-bold text-hermes-500 uppercase tracking-wider">🎙️ Aggiorna trattativa</p>

          {/* Mic */}
          <MicGestisci onAggiornamento={onAggiornamento} />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">oppure scrivi</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Input testo manuale */}
          <div className="space-y-2">
            <textarea
              rows={3}
              value={testoManuale}
              onChange={e => setTestoManuale(e.target.value)}
              placeholder="Es. Ho chiamato Mario, vuole una proposta entro venerdì prossimo…"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors resize-none"
            />
            <button
              type="button"
              onClick={inviaTestoManuale}
              disabled={invioManuale || !testoManuale.trim()}
              className="w-full rounded-xl bg-hermes-500 py-2.5 text-sm font-semibold text-white hover:bg-hermes-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {invioManuale ? '⏳ Elaborazione…' : 'Invia aggiornamento'}
            </button>
          </div>

          {nota && (
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
              {nota}
            </div>
          )}
        </div>

        {/* Storico aggiornamenti */}
        {storicoAggiornamenti.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs font-bold text-hermes-500 uppercase tracking-wider mb-4">📖 Diario trattativa</p>
            <div className="space-y-4">
              {storicoAggiornamenti.map(az => (
                <div key={az.id} className="border-l-2 border-hermes-200 pl-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs text-gray-400">
                      {new Date(az.created_at).toLocaleString('it-IT', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    {az.completata && (
                      <span className="text-xs text-green-600 font-medium">✓ Completata</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 italic">"{az.aggiornamento_dettato}"</p>
                  <p className="text-sm text-gray-800 font-medium mt-1">→ {az.testo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      Scadenza: {new Date(az.scadenza).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottoni esito */}
        {!confermaEsito ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setConfermaEsito('perso')}
              className="rounded-xl border-2 border-red-200 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              ❌ Perso
            </button>
            <button
              onClick={() => setConfermaEsito('vinto')}
              className="rounded-xl bg-green-500 py-4 text-sm font-bold text-white hover:bg-green-600 shadow-sm transition-colors"
            >
              🏆 Vinto
            </button>
          </div>
        ) : (
          <div className={`rounded-2xl border-2 p-5 space-y-4 ${
            confermaEsito === 'vinto' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
          }`}>
            <p className="text-sm font-bold text-center text-gray-800">
              Confermi di chiudere questa trattativa come{' '}
              <span className={confermaEsito === 'vinto' ? 'text-green-700' : 'text-red-700'}>
                {confermaEsito === 'vinto' ? '🏆 VINTO' : '❌ PERSO'}
              </span>?
            </p>
            <p className="text-xs text-gray-500 text-center">
              L'esito verrà salvato su Supabase e aggiornato su Google Sheets.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfermaEsito(null)}
                disabled={invioEsito}
                className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-600 hover:bg-white transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => confermaChiudi(confermaEsito)}
                disabled={invioEsito}
                className={`flex-1 rounded-xl py-3 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-50 ${
                  confermaEsito === 'vinto' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {invioEsito ? 'Salvataggio…' : 'Conferma'}
              </button>
            </div>
          </div>
        )}

        {/* Riapri trattativa — visibile solo se chiusa */}
        {lead.esito && (
          <div className={`rounded-2xl border-2 p-5 space-y-3 ${
            lead.esito === 'vinto' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
          }`}>
            <p className="text-sm font-bold text-center text-gray-800">
              Trattativa chiusa come{' '}
              <span className={lead.esito === 'vinto' ? 'text-green-700' : 'text-red-700'}>
                {lead.esito === 'vinto' ? '🏆 VINTO' : '❌ PERSO'}
              </span>
            </p>
            <button
              onClick={async () => {
                await fetch('/api/gestisci/riapri', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...workspaceAuthHeader() },
                  body: JSON.stringify({ lead_id: id }),
                })
                caricaLead()
              }}
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ↩ Riapri trattativa
            </button>
          </div>
        )}

        {/* Elimina trattativa */}
        <div className="border-t border-gray-200 pt-4">
          {!confermaElimina ? (
            <button
              onClick={() => setConfermaElimina(true)}
              className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
            >
              🗑️ Elimina trattativa
            </button>
          ) : (
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-3">
              <p className="text-sm text-gray-700 font-medium text-center">
                Rimuovere questa trattativa da Gestisci?
              </p>
              <p className="text-xs text-gray-400 text-center">
                Il lead rimane in Registra. Le azioni vengono cancellate.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfermaElimina(false)}
                  disabled={eliminando}
                  className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:bg-white transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={eliminaTrattativa}
                  disabled={eliminando}
                  className="flex-1 rounded-xl bg-gray-700 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {eliminando ? 'Rimozione…' : 'Sì, elimina'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  )
}

export default function SchedaGestisci({ params }: { params: { id: string } }) {
  return <Suspense><SchedaGestisciInner id={params.id} /></Suspense>
}
