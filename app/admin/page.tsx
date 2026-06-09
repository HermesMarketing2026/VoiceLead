'use client'
import { useEffect, useState } from 'react'
import type { Workspace, Utente, ProvisioningToken } from '@/lib/types'
import PinLogin from '@/components/PinLogin'
import { salvaSessioneAdmin, leggiSessione, cancellaSessione, adminAuthHeader } from '@/lib/session'
import AppShell from '@/components/AppShell'

type Modalita = 'lista' | 'modifica' | 'breach'

interface Ordine {
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
}

export default function Admin() {
  const [autenticato, setAutenticato] = useState(false)
  const [pronto, setPronto] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [form, setForm] = useState({ nome_azienda: '', logo_url: '', nome_referente: '', cognome_referente: '', has_gestisci: false })
  const [creazione, setCreazione] = useState(false)
  const [nuovoWs, setNuovoWs] = useState<Workspace | null>(null)
  const [errore, setErrore] = useState<string | null>(null)
  const [modalita, setModalita] = useState<Modalita>('lista')
  const [wsInModifica, setWsInModifica] = useState<Workspace | null>(null)
  const [formModifica, setFormModifica] = useState({ nome_azienda: '', logo_url: '', nome_referente: '', cognome_referente: '', has_gestisci: false, pin: '' })
  const [salvataggio, setSalvataggio] = useState(false)
  const [eliminazione, setEliminazione] = useState<string | null>(null)
  const [confermaElimina, setConfermaElimina] = useState<string | null>(null)
  const [sospensione, setSospensione] = useState<string | null>(null)
  const [confermaSospendi, setConfermaSospendi] = useState<string | null>(null)
  // Anagrafica cliente
  const [ordineWs, setOrdineWs] = useState<Ordine | null>(null)

  // Breach notification
  const CATEGORIE_DATI_OPZIONI = [
    'Nome e cognome', 'Email', 'Numero di telefono', 'Dati aziendali',
    'Note sui lead', 'Dati di fatturazione (P.IVA, SDI, PEC)', 'Log di accesso',
  ]
  const [breachForm, setBreachForm] = useState({
    descrizione: '',
    data_scoperta: new Date().toISOString().slice(0, 16),
    categorie_dati: [] as string[],
    misure_adottate: '',
    workspace_ids: [] as string[], // vuoto = tutti
  })
  const [breachPreview, setBreachPreview] = useState<{ destinatari: { email: string; nomeAzienda: string }[]; anteprima_html: string } | null>(null)
  const [breachConferma, setBreachConferma] = useState(false)
  const [breachInvio, setBreachInvio] = useState(false)
  const [breachRisultato, setBreachRisultato] = useState<{ inviati: number; errori: { email: string; errore: string }[] } | null>(null)
  const [breachErrore, setBreachErrore] = useState<string | null>(null)

  // Utenti
  const [utenti, setUtenti] = useState<Utente[]>([])
  const [formUtente, setFormUtente] = useState({ nome: '', cognome: '', pin: '' })
  const [creazioneUtente, setCreazioneUtente] = useState(false)
  const [erroreUtente, setErroreUtente] = useState<string | null>(null)
  const [confermaEliminaUtente, setConfermaEliminaUtente] = useState<string | null>(null)
  const [eliminazioneUtente, setEliminazioneUtente] = useState<string | null>(null)
  // Token onboarding
  const [tokens, setTokens] = useState<ProvisioningToken[]>([])
  const [formToken, setFormToken] = useState({ piano: 'registra' as 'registra' | 'registra_gestisci', max_commerciali: 1 })
  const [creazioneToken, setCreazioneToken] = useState(false)
  const [nuovoLink, setNuovoLink] = useState<string | null>(null)
  const [linkCopiato, setLinkCopiato] = useState(false)
  const [linkOnboardingWs, setLinkOnboardingWs] = useState<string | null>(null)
  const [linkOnboardingWsCopiato, setLinkOnboardingWsCopiato] = useState(false)
  const [formCrea, setFormCrea] = useState({ piano: 'registra' as 'registra' | 'registra_gestisci', max_commerciali: 2 })
  const [pinVisibile, setPinVisibile] = useState<Record<string, boolean>>({})
  const [pinOrigHashato, setPinOrigHashato] = useState(false)
  const [utenteInModifica, setUtenteInModifica] = useState<string | null>(null)
  const [formModificaUtente, setFormModificaUtente] = useState({ nome: '', cognome: '', pin: '' })
  const [salvaUtenteLoading, setSalvaUtenteLoading] = useState(false)

  useEffect(() => {
    const sessione = leggiSessione()
    if (sessione?.tipo === 'admin') setAutenticato(true)
    setPronto(true)
  }, [])

  useEffect(() => {
    if (autenticato) {
      caricaWorkspaces()
      caricaTokens()
    }
  }, [autenticato])

  const caricaTokens = async () => {
    const res = await fetch('/api/provisioning-tokens', { headers: adminAuthHeader() })
    const data = await res.json()
    setTokens(Array.isArray(data) ? data : [])
  }

  const creaToken = async () => {
    if (!formToken.max_commerciali) return
    setCreazioneToken(true)
    setNuovoLink(null)
    try {
      const res = await fetch('/api/provisioning-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminAuthHeader() },
        body: JSON.stringify(formToken),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const link = `${window.location.origin}/onboarding/${data.token}`
      setNuovoLink(link)
      setFormToken({ piano: 'registra', max_commerciali: 1 })
      caricaTokens()
    } finally {
      setCreazioneToken(false)
    }
  }

  const copiaLink = async (link: string) => {
    await navigator.clipboard.writeText(link)
    setLinkCopiato(true)
    setTimeout(() => setLinkCopiato(false), 2000)
  }

  const eliminaToken = async (id: string) => {
    await fetch(`/api/provisioning-tokens/${id}`, { method: 'DELETE', headers: adminAuthHeader() })
    caricaTokens()
  }

  const caricaWorkspaces = async () => {
    const res = await fetch('/api/workspaces', { headers: adminAuthHeader() })
    const data = await res.json()
    setWorkspaces(Array.isArray(data) ? data : [])
  }

  const onLogin = async (pin: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    salvaSessioneAdmin(data.adminToken)
    setAutenticato(true)
  }

  const creaWorkspace = async () => {
    if (!form.nome_azienda) return
    setCreazione(true)
    setErrore(null)
    setNuovoWs(null)
    setLinkOnboardingWs(null)
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminAuthHeader() },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNuovoWs(data)
      const resToken = await fetch('/api/provisioning-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminAuthHeader() },
        body: JSON.stringify({ piano: formCrea.piano === 'registra_gestisci' ? 'registra_gestisci' : 'registra', max_commerciali: formCrea.max_commerciali }),
      })
      const tokenData = await resToken.json()
      if (resToken.ok && tokenData.token) {
        setLinkOnboardingWs(`${window.location.origin}/onboarding/${tokenData.token}`)
      }
      setForm({ nome_azienda: '', logo_url: '', nome_referente: '', cognome_referente: '', has_gestisci: false })
      setFormCrea({ piano: 'registra', max_commerciali: 2 })
      caricaWorkspaces()
      caricaTokens()
    } catch (e: any) {
      setErrore(e.message)
    } finally {
      setCreazione(false)
    }
  }

  const apriModifica = (ws: Workspace) => {
    setWsInModifica(ws)
    const isHashato = ws.pin.startsWith('$2')
    setPinOrigHashato(isHashato)
    setFormModifica({ nome_azienda: ws.nome_azienda, logo_url: ws.logo_url ?? '', nome_referente: ws.nome_referente ?? '', cognome_referente: ws.cognome_referente ?? '', has_gestisci: ws.has_gestisci ?? false, pin: isHashato ? '' : ws.pin })
    setOrdineWs(null)
    setModalita('modifica')
    caricaUtenti(ws.id)
    fetch(`/api/abbonamenti/${ws.id}`).then(r => r.json()).then(d => setOrdineWs(d.ordine ?? null))
  }

  const caricaUtenti = async (workspaceId: string) => {
    const res = await fetch(`/api/utenti?workspace_id=${workspaceId}&admin=1`, { headers: adminAuthHeader() })
    const data = await res.json()
    setUtenti(Array.isArray(data) ? data : [])
  }

  const aggiungiUtente = async () => {
    if (!wsInModifica || !formUtente.nome || !formUtente.cognome || !formUtente.pin) return
    setCreazioneUtente(true)
    setErroreUtente(null)
    try {
      const res = await fetch('/api/utenti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminAuthHeader() },
        body: JSON.stringify({ workspace_id: wsInModifica.id, ...formUtente, ruolo: 'commerciale' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFormUtente({ nome: '', cognome: '', pin: '' })
      caricaUtenti(wsInModifica.id)
    } catch (e: any) {
      setErroreUtente(e.message)
    } finally {
      setCreazioneUtente(false)
    }
  }

  const eliminaUtente = async (id: string) => {
    setEliminazioneUtente(id)
    try {
      const res = await fetch(`/api/utenti/${id}`, { method: 'DELETE', headers: adminAuthHeader() })
      if (!res.ok) throw new Error('Errore eliminazione')
      setConfermaEliminaUtente(null)
      if (wsInModifica) caricaUtenti(wsInModifica.id)
    } catch (e: any) {
      setErroreUtente(e.message)
    } finally {
      setEliminazioneUtente(null)
    }
  }

  const salvaModificaUtente = async (id: string) => {
    setSalvaUtenteLoading(true)
    setErroreUtente(null)
    try {
      const body: Record<string, string> = {}
      if (formModificaUtente.nome) body.nome = formModificaUtente.nome
      if (formModificaUtente.cognome) body.cognome = formModificaUtente.cognome
      if (formModificaUtente.pin) body.pin = formModificaUtente.pin
      const res = await fetch(`/api/utenti/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...adminAuthHeader() },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUtenteInModifica(null)
      if (wsInModifica) caricaUtenti(wsInModifica.id)
    } catch (e: any) {
      setErroreUtente(e.message)
    } finally {
      setSalvaUtenteLoading(false)
    }
  }

  const salvaModifica = async () => {
    if (!wsInModifica) return
    setSalvataggio(true)
    try {
      const payload: Record<string, unknown> = {
        nome_azienda: formModifica.nome_azienda,
        logo_url: formModifica.logo_url,
        nome_referente: formModifica.nome_referente,
        cognome_referente: formModifica.cognome_referente,
        has_gestisci: formModifica.has_gestisci,
      }
      if (formModifica.pin) payload.pin = formModifica.pin
      const res = await fetch(`/api/workspaces/${wsInModifica.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...adminAuthHeader() },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setModalita('lista')
      caricaWorkspaces()
    } catch (e: any) {
      setErrore(e.message)
    } finally {
      setSalvataggio(false)
    }
  }

  const sospendi = async (id: string) => {
    setSospensione(id)
    try {
      const res = await fetch(`/api/workspaces/${id}/sospendi`, { method: 'POST', headers: adminAuthHeader() })
      if (!res.ok) throw new Error('Errore sospensione')
      setWorkspaces(ws => ws.map(w => w.id === id ? { ...w, stripe_subscription_status: 'canceling' } : w))
      setConfermaSospendi(null)
    } catch {
      alert('Errore durante la sospensione. Riprova.')
    } finally {
      setSospensione(null)
    }
  }

  const elimina = async (id: string) => {
    setEliminazione(id)
    try {
      const res = await fetch(`/api/workspaces/${id}`, { method: 'DELETE', headers: adminAuthHeader() })
      if (!res.ok) throw new Error('Errore eliminazione')
      setConfermaElimina(null)
      caricaWorkspaces()
    } catch (e: any) {
      setErrore(e.message)
    } finally {
      setEliminazione(null)
    }
  }

  const breachPreviewRichiedi = async () => {
    setBreachErrore(null)
    setBreachPreview(null)
    if (!breachForm.descrizione || !breachForm.data_scoperta || !breachForm.categorie_dati.length || !breachForm.misure_adottate) {
      setBreachErrore('Compila tutti i campi obbligatori.')
      return
    }
    try {
      const res = await fetch('/api/breach-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminAuthHeader() },
        body: JSON.stringify({ ...breachForm, modalita_invio: 'preview' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBreachPreview(data)
    } catch (e: any) {
      setBreachErrore(e.message)
    }
  }

  const breachInvia = async () => {
    setBreachInvio(true)
    setBreachRisultato(null)
    try {
      const res = await fetch('/api/breach-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...adminAuthHeader() },
        body: JSON.stringify({ ...breachForm, modalita_invio: 'invia' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBreachRisultato(data)
      setBreachConferma(false)
      setBreachPreview(null)
    } catch (e: any) {
      setBreachErrore(e.message)
    } finally {
      setBreachInvio(false)
    }
  }

  if (!pronto) return null
  if (!autenticato) {
    return <AppShell><PinLogin titolo="Admin VoiceLeads" sottotitolo="Accesso riservato" tipo="testo" onSuccess={onLogin} /></AppShell>
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-hermes-400 transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-600 mb-1.5'

  // Vista modifica
  if (modalita === 'modifica' && wsInModifica) {
    return (
      <AppShell><div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setModalita('lista')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Modifica workspace</h1>
            <p className="text-xs text-gray-400 font-mono">{wsInModifica.slug}.voiceleads.it</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className={labelClass}>Nome azienda cliente</label>
            <input className={inputClass} value={formModifica.nome_azienda} onChange={e => setFormModifica(f => ({ ...f, nome_azienda: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>PIN responsabile</label>
            {pinOrigHashato && !formModifica.pin ? (
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5">
                <span className="text-sm text-gray-400 font-mono tracking-widest">••••••</span>
                <button
                  type="button"
                  onClick={() => setFormModifica(f => ({ ...f, pin: '' }))}
                  className="text-xs text-hermes-600 hover:text-hermes-800 font-medium"
                >
                  Reimposta
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {pinOrigHashato && <p className="text-xs text-amber-600">Inserisci il nuovo PIN (lascia vuoto per non cambiarlo)</p>}
                <div className="relative">
                  <input
                    className={inputClass + ' pr-10'}
                    value={formModifica.pin}
                    onChange={e => setFormModifica(f => ({ ...f, pin: e.target.value.replace(/\D/g, '') }))}
                    maxLength={6}
                    inputMode="numeric"
                    placeholder="6 cifre"
                    type={pinVisibile['modifica_ws'] ? 'text' : 'password'}
                  />
                  <button
                    type="button"
                    onClick={() => setPinVisibile(v => ({ ...v, modifica_ws: !v['modifica_ws'] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {pinVisibile['modifica_ws'] ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nome responsabile</label>
              <input className={inputClass} value={formModifica.nome_referente} onChange={e => setFormModifica(f => ({ ...f, nome_referente: e.target.value }))} placeholder="Mario" />
            </div>
            <div>
              <label className={labelClass}>Cognome responsabile</label>
              <input className={inputClass} value={formModifica.cognome_referente} onChange={e => setFormModifica(f => ({ ...f, cognome_referente: e.target.value }))} placeholder="Rossi" />
            </div>
          </div>
          <div>
            <label className={labelClass}>URL Logo <span className="text-gray-400 font-normal">(opzionale)</span></label>
            <input className={inputClass} value={formModifica.logo_url} onChange={e => setFormModifica(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." />
            {formModifica.logo_url && (
              <img src={formModifica.logo_url} alt="Logo" className="mt-2 h-10 object-contain rounded border border-gray-100 p-1" />
            )}
          </div>
          {/* Toggle Gestisci */}
          <div
            onClick={() => setFormModifica(f => ({ ...f, has_gestisci: !f.has_gestisci }))}
            className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors ${
              formModifica.has_gestisci ? 'border-hermes-400 bg-hermes-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div>
              <p className={`text-sm font-bold ${formModifica.has_gestisci ? 'text-hermes-700' : 'text-gray-600'}`}>
                📋 Abilita Gestisci trattative
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formModifica.has_gestisci ? 'Pacchetto completo — Registra + Gestisci' : 'Solo Registra lead (Pacchetto base)'}
              </p>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors relative ${formModifica.has_gestisci ? 'bg-hermes-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${formModifica.has_gestisci ? 'left-7' : 'left-1'}`} />
            </div>
          </div>

          {errore && <p className="text-sm text-red-500">{errore}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalita('lista')} className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Annulla
            </button>
            <button onClick={salvaModifica} disabled={salvataggio} className="flex-1 rounded-xl bg-hermes-500 py-3 text-sm font-semibold text-white hover:bg-hermes-600 disabled:opacity-50">
              {salvataggio ? 'Salvataggio…' : 'Salva modifiche'}
            </button>
          </div>
        </div>

        {/* Anagrafica cliente */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-wider">🗂️ Anagrafica cliente</h2>
            <a
              href={`/admin/cliente/${wsInModifica.id}`}
              target="_blank"
              className="text-xs text-hermes-600 border border-hermes-300 rounded-lg px-3 py-1.5 hover:bg-hermes-50 font-medium"
            >
              🖨️ Scheda PDF
            </a>
          </div>

          {/* Abbonamento */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">Abbonamento</p>
            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Piano</span><span className="font-semibold">{wsInModifica.has_gestisci ? 'Pro — Registra + Gestisci' : 'Base — Registra'}</span></div>
              {wsInModifica.fatturazione && <div className="flex justify-between"><span className="text-gray-500">Fatturazione</span><span className="font-semibold capitalize">{wsInModifica.fatturazione === 'prova' ? '🧪 Prova gratuita 14 giorni' : wsInModifica.fatturazione}</span></div>}
              {wsInModifica.scadenza_il && (() => {
                const g = Math.max(0, Math.ceil((new Date(wsInModifica.scadenza_il).getTime() - Date.now()) / 86400000))
                const urgente = g <= 3
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Scadenza</span>
                      <span className={`font-semibold ${wsInModifica.sospeso ? 'text-red-600' : urgente ? 'text-amber-600' : 'text-gray-900'}`}>
                        {new Date(wsInModifica.scadenza_il).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    {!wsInModifica.sospeso && wsInModifica.fatturazione === 'prova' && (
                      <div className={`rounded-lg px-3 py-2 flex items-center gap-2 ${urgente ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                        <span>{urgente ? '⚠️' : '⏳'}</span>
                        <span className={`text-xs font-bold ${urgente ? 'text-red-600' : 'text-amber-700'}`}>
                          {g === 0 ? 'Scade oggi' : `${g} ${g === 1 ? 'giorno rimanente' : 'giorni rimanenti'} di prova`}
                        </span>
                      </div>
                    )}
                  </>
                )
              })()}
              <div className="flex justify-between"><span className="text-gray-500">Stato</span><span className={`font-bold ${wsInModifica.sospeso ? 'text-red-600' : 'text-green-600'}`}>{wsInModifica.sospeso ? 'Sospeso' : 'Attivo'}</span></div>
            </div>
          </div>

          {/* Dati fatturazione */}
          {ordineWs ? (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">Dati fatturazione</p>
              <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Ragione sociale</span><span className="font-semibold">{ordineWs.ragione_sociale}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">P.IVA</span><span className="font-mono font-semibold">{ordineWs.partita_iva}</span></div>
                {ordineWs.codice_sdi && <div className="flex justify-between"><span className="text-gray-500">Codice SDI</span><span className="font-mono">{ordineWs.codice_sdi}</span></div>}
                {ordineWs.pec && <div className="flex justify-between"><span className="text-gray-500">PEC</span><span className="text-xs">{ordineWs.pec}</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Indirizzo</span><span className="text-right text-xs">{ordineWs.indirizzo}, {ordineWs.cap} {ordineWs.citta} ({ordineWs.provincia})</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Importo</span><span className="font-bold">€{Number(ordineWs.totale).toFixed(2)} + IVA</span></div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Nessun ordine verificato collegato a questo workspace.</p>
          )}
        </div>

        {/* Sezione commerciali */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-wider">👥 Commerciali</h2>
          <p className="text-xs text-gray-400">Ogni commerciale ha il suo PIN e vede solo i propri lead. Il PIN del workspace è riservato al responsabile.</p>

          {utenti.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">Nessun commerciale ancora — accesso singolo con PIN workspace.</p>
          ) : (
            <ul className="space-y-2">
              {utenti.map(u => {
                const pinHashato = u.pin?.startsWith('$2') ?? false
                const pinMostrato = pinVisibile[u.id]
                return (
                  <li key={u.id} className="bg-gray-50 rounded-xl px-4 py-3 space-y-3">
                    {utenteInModifica === u.id ? (
                      /* Form modifica inline */
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className={inputClass}
                            placeholder="Nome"
                            value={formModificaUtente.nome}
                            onChange={e => setFormModificaUtente(f => ({ ...f, nome: e.target.value }))}
                          />
                          <input
                            className={inputClass}
                            placeholder="Cognome"
                            value={formModificaUtente.cognome}
                            onChange={e => setFormModificaUtente(f => ({ ...f, cognome: e.target.value }))}
                          />
                        </div>
                        <input
                          className={inputClass}
                          placeholder={pinHashato ? 'Nuovo PIN (lascia vuoto per non cambiarlo)' : 'Nuovo PIN a 6 cifre'}
                          maxLength={6}
                          inputMode="numeric"
                          value={formModificaUtente.pin}
                          onChange={e => setFormModificaUtente(f => ({ ...f, pin: e.target.value.replace(/\D/g, '') }))}
                        />
                        {erroreUtente && <p className="text-xs text-red-500">{erroreUtente}</p>}
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setUtenteInModifica(null); setErroreUtente(null) }}
                            className="flex-1 rounded-lg border border-gray-300 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100"
                          >
                            Annulla
                          </button>
                          <button
                            onClick={() => salvaModificaUtente(u.id)}
                            disabled={salvaUtenteLoading}
                            className="flex-1 rounded-lg bg-hermes-500 py-2 text-xs font-semibold text-white hover:bg-hermes-600 disabled:opacity-50"
                          >
                            {salvaUtenteLoading ? '…' : 'Salva'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Vista normale */
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-hermes-100 flex items-center justify-center text-hermes-600 font-bold text-sm shrink-0">
                            {u.nome[0]}{u.cognome[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{u.nome} {u.cognome}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-400 font-mono">
                                PIN: {pinHashato ? '••••••' : (pinMostrato ? u.pin : '••••••')}
                              </span>
                              {!pinHashato && (
                                <button
                                  onClick={() => setPinVisibile(v => ({ ...v, [u.id]: !v[u.id] }))}
                                  className="text-gray-300 hover:text-gray-500 text-xs"
                                >
                                  {pinMostrato ? '🙈' : '👁️'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {confermaEliminaUtente === u.id ? (
                            <>
                              <button onClick={() => setConfermaEliminaUtente(null)} className="text-xs text-gray-500 px-2 py-1 rounded-lg border border-gray-300 bg-white">Annulla</button>
                              <button onClick={() => eliminaUtente(u.id)} disabled={eliminazioneUtente === u.id} className="text-xs text-white bg-red-500 px-2 py-1 rounded-lg disabled:opacity-50">
                                {eliminazioneUtente === u.id ? '…' : 'Elimina'}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setUtenteInModifica(u.id)
                                  setFormModificaUtente({ nome: u.nome, cognome: u.cognome, pin: '' })
                                  setErroreUtente(null)
                                }}
                                className="text-xs text-hermes-500 hover:text-hermes-700 px-2 py-1 rounded-lg hover:bg-hermes-50 transition-colors"
                              >
                                ✏️
                              </button>
                              <button onClick={() => setConfermaEliminaUtente(u.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {/* Form aggiungi commerciale */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-600">Aggiungi commerciale</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                className={inputClass}
                placeholder="Nome"
                value={formUtente.nome}
                onChange={e => setFormUtente(f => ({ ...f, nome: e.target.value }))}
              />
              <input
                className={inputClass}
                placeholder="Cognome"
                value={formUtente.cognome}
                onChange={e => setFormUtente(f => ({ ...f, cognome: e.target.value }))}
              />
            </div>
            <input
              className={inputClass}
              placeholder="PIN a 6 cifre"
              maxLength={6}
              inputMode="numeric"
              value={formUtente.pin}
              onChange={e => setFormUtente(f => ({ ...f, pin: e.target.value.replace(/\D/g, '') }))}
            />
            {erroreUtente && <p className="text-xs text-red-500">{erroreUtente}</p>}
            <button
              onClick={aggiungiUtente}
              disabled={creazioneUtente || !formUtente.nome || !formUtente.cognome || formUtente.pin.length !== 6}
              className="w-full rounded-xl bg-hermes-500 py-2.5 text-sm font-semibold text-white hover:bg-hermes-600 disabled:opacity-40 transition-colors"
            >
              {creazioneUtente ? 'Aggiunta…' : '+ Aggiungi commerciale'}
            </button>
          </div>
        </div>
      </div></AppShell>
    )
  }

  // Vista breach notification
  if (modalita === 'breach') {
    const tuttiWorkspacesSelezionati = breachForm.workspace_ids.length === 0
    return (
      <AppShell><div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => { setModalita('lista'); setBreachPreview(null); setBreachRisultato(null); setBreachErrore(null) }} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifica Data Breach</h1>
            <p className="text-xs text-gray-400">Invia solo in caso di violazione reale accertata — Art. 33-34 GDPR</p>
          </div>
        </div>

        {breachRisultato ? (
          <div className={`rounded-2xl border p-6 space-y-3 ${breachRisultato.errori.length === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
            <p className="font-bold text-gray-900">
              {breachRisultato.errori.length === 0 ? '✅ Notifiche inviate correttamente' : '⚠️ Invio parziale'}
            </p>
            <p className="text-sm text-gray-700">Email inviate con successo: <strong>{breachRisultato.inviati}</strong></p>
            {breachRisultato.errori.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-red-600">Errori ({breachRisultato.errori.length}):</p>
                <ul className="text-xs text-red-500 space-y-1 mt-1">
                  {breachRisultato.errori.map(e => <li key={e.email}>{e.email}: {e.errore}</li>)}
                </ul>
              </div>
            )}
            <p className="text-xs text-gray-500">L'evento è stato registrato nel log interno.</p>
            <button
              onClick={() => { setBreachRisultato(null); setBreachForm({ descrizione: '', data_scoperta: new Date().toISOString().slice(0, 16), categorie_dati: [], misure_adottate: '', workspace_ids: [] }) }}
              className="text-sm text-hermes-600 underline"
            >
              Nuova notifica
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Avviso */}
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 space-y-1">
              <p className="font-bold">Attenzione — usa solo in caso di breach accertato.</p>
              <p>Questa funzione invia email ai clienti selezionati comunicando una violazione dei loro dati. Non esiste annulla dopo l'invio.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
              {/* Data scoperta */}
              <div>
                <label className={labelClass}>Data e ora di scoperta <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={breachForm.data_scoperta}
                  onChange={e => setBreachForm(f => ({ ...f, data_scoperta: e.target.value }))}
                />
              </div>

              {/* Descrizione */}
              <div>
                <label className={labelClass}>Descrizione dell'incidente <span className="text-red-500">*</span></label>
                <textarea
                  className={inputClass + ' resize-none'}
                  rows={4}
                  placeholder="Descrivi cosa è successo in modo chiaro e non tecnico. Es: un accesso non autorizzato al database ha esposto dati di X workspace..."
                  value={breachForm.descrizione}
                  onChange={e => setBreachForm(f => ({ ...f, descrizione: e.target.value }))}
                />
              </div>

              {/* Categorie dati */}
              <div>
                <label className={labelClass}>Categorie di dati coinvolti <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {CATEGORIE_DATI_OPZIONI.map(cat => (
                    <label key={cat} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={breachForm.categorie_dati.includes(cat)}
                        onChange={e => setBreachForm(f => ({
                          ...f,
                          categorie_dati: e.target.checked
                            ? [...f.categorie_dati, cat]
                            : f.categorie_dati.filter(c => c !== cat),
                        }))}
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              {/* Misure adottate */}
              <div>
                <label className={labelClass}>Misure adottate / azioni in corso <span className="text-red-500">*</span></label>
                <textarea
                  className={inputClass + ' resize-none'}
                  rows={3}
                  placeholder="Es: l'accesso è stato immediatamente bloccato, le credenziali compromesse sono state revocate, è in corso un'analisi forense..."
                  value={breachForm.misure_adottate}
                  onChange={e => setBreachForm(f => ({ ...f, misure_adottate: e.target.value }))}
                />
              </div>

              {/* Selezione workspace */}
              <div>
                <label className={labelClass}>Workspace coinvolti</label>
                <div
                  onClick={() => setBreachForm(f => ({ ...f, workspace_ids: [] }))}
                  className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 cursor-pointer mb-2 transition-colors ${tuttiWorkspacesSelezionati ? 'border-hermes-400 bg-hermes-50' : 'border-gray-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tuttiWorkspacesSelezionati ? 'border-hermes-500 bg-hermes-500' : 'border-gray-400'}`}>
                    {tuttiWorkspacesSelezionati && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700">Tutti i workspace ({workspaces.length})</span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {workspaces.map(ws => (
                    <label key={ws.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer px-2 py-1 hover:bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={breachForm.workspace_ids.includes(ws.id)}
                        onChange={e => setBreachForm(f => ({
                          ...f,
                          workspace_ids: e.target.checked
                            ? [...f.workspace_ids, ws.id]
                            : f.workspace_ids.filter(id => id !== ws.id),
                        }))}
                      />
                      {ws.nome_azienda} <span className="text-gray-400 text-xs font-mono">({ws.slug})</span>
                    </label>
                  ))}
                </div>
                {!tuttiWorkspacesSelezionati && breachForm.workspace_ids.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{breachForm.workspace_ids.length} workspace selezionati</p>
                )}
              </div>

              {breachErrore && <p className="text-sm text-red-500">{breachErrore}</p>}

              <button
                onClick={breachPreviewRichiedi}
                className="w-full rounded-xl border border-hermes-400 py-3 text-sm font-semibold text-hermes-600 hover:bg-hermes-50 transition-colors"
              >
                Anteprima email e destinatari →
              </button>
            </div>

            {/* Preview */}
            {breachPreview && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h2 className="text-sm font-bold text-gray-900">Anteprima</h2>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Destinatari ({breachPreview.destinatari.length})</p>
                  <ul className="space-y-1 max-h-32 overflow-y-auto">
                    {breachPreview.destinatari.map(d => (
                      <li key={d.email} className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">
                        <span className="font-semibold">{d.nomeAzienda || '—'}</span> — {d.email}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Anteprima email</p>
                  <div
                    className="border border-gray-200 rounded-xl p-4 text-xs overflow-auto max-h-64 bg-gray-50"
                    dangerouslySetInnerHTML={{ __html: breachPreview.anteprima_html }}
                  />
                </div>

                {!breachConferma ? (
                  <button
                    onClick={() => setBreachConferma(true)}
                    className="w-full rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 transition-colors"
                  >
                    Invia notifica a {breachPreview.destinatari.length} {breachPreview.destinatari.length === 1 ? 'cliente' : 'clienti'}
                  </button>
                ) : (
                  <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 space-y-3">
                    <p className="text-sm font-bold text-red-700">Conferma invio definitivo</p>
                    <p className="text-xs text-red-600">
                      Stai per inviare una notifica di data breach a <strong>{breachPreview.destinatari.length} clienti</strong>.
                      L'azione non è reversibile. Sei sicuro?
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setBreachConferma(false)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm text-gray-600 hover:bg-white">
                        Annulla
                      </button>
                      <button onClick={breachInvia} disabled={breachInvio} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
                        {breachInvio ? 'Invio in corso…' : 'Sì, invia ora'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div></AppShell>
    )
  }

  // Vista lista
  return (
    <AppShell><div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pannello Admin</h1>
          <p className="text-xs text-gray-400 mt-0.5">VoiceLeads by Hermes Marketing</p>
        </div>
        <button onClick={() => { cancellaSessione(); setAutenticato(false) }} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100">
          Esci
        </button>
      </div>

      {/* Crea workspace */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-wider">➕ Nuovo workspace cliente</h2>
          <p className="text-xs text-gray-400 mt-1">Crea il workspace e configura tu stesso i commerciali tramite il link di onboarding generato automaticamente.</p>
        </div>

        <div>
          <label className={labelClass}>Nome azienda cliente</label>
          <input className={inputClass} value={form.nome_azienda} onChange={e => setForm(f => ({ ...f, nome_azienda: e.target.value }))} placeholder="Es. Mulino Val d'Orcia" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Nome responsabile</label>
            <input className={inputClass} value={form.nome_referente} onChange={e => setForm(f => ({ ...f, nome_referente: e.target.value }))} placeholder="Mario" />
          </div>
          <div>
            <label className={labelClass}>Cognome responsabile</label>
            <input className={inputClass} value={form.cognome_referente} onChange={e => setForm(f => ({ ...f, cognome_referente: e.target.value }))} placeholder="Rossi" />
          </div>
        </div>
        <div>
          <label className={labelClass}>URL Logo <span className="text-gray-400 font-normal">(opzionale)</span></label>
          <input className={inputClass} value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://esempio.com/logo.png" />
          {form.logo_url && <img src={form.logo_url} alt="Anteprima" className="mt-2 h-10 object-contain rounded border border-gray-100 p-1" />}
        </div>

        {/* Piano */}
        <div>
          <label className={labelClass}>Piano abbonamento</label>
          <div className="grid grid-cols-2 gap-2">
            {(['registra', 'registra_gestisci'] as const).map(p => (
              <button key={p}
                onClick={() => {
                  setFormCrea(f => ({ ...f, piano: p }))
                  setForm(f => ({ ...f, has_gestisci: p === 'registra_gestisci' }))
                }}
                className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  formCrea.piano === p ? 'border-hermes-400 bg-hermes-50 text-hermes-700' : 'border-gray-200 text-gray-500'
                }`}
              >
                {p === 'registra' ? '🎙️ Solo Registra' : '📋 Registra + Gestisci'}
              </button>
            ))}
          </div>
        </div>

        {/* N° commerciali */}
        <div>
          <label className={labelClass}>N° commerciali da configurare</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setFormCrea(f => ({ ...f, max_commerciali: Math.max(1, f.max_commerciali - 1) }))}
              className="w-10 h-10 rounded-xl border border-gray-200 text-lg font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center">−</button>
            <span className="text-2xl font-bold text-gray-800 w-8 text-center">{formCrea.max_commerciali}</span>
            <button onClick={() => setFormCrea(f => ({ ...f, max_commerciali: Math.min(20, f.max_commerciali + 1) }))}
              className="w-10 h-10 rounded-xl border border-gray-200 text-lg font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center">+</button>
          </div>
        </div>

        {errore && <p className="text-sm text-red-500">{errore}</p>}
        <button onClick={creaWorkspace} disabled={creazione || !form.nome_azienda}
          className="w-full rounded-xl bg-hermes-500 py-3 text-sm font-semibold text-white hover:bg-hermes-600 disabled:opacity-40 shadow-sm">
          {creazione ? 'Creazione in corso…' : '✅ Crea workspace e genera link'}
        </button>
      </div>

      {/* Risultato creazione workspace */}
      {nuovoWs && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-5 space-y-4">
          <p className="font-bold text-green-800">✅ Workspace creato!</p>
          <div className="bg-white rounded-xl border border-green-200 p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">URL:</span>
              <span className="font-mono font-semibold text-gray-800">{nuovoWs.slug}.voiceleads.it</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">PIN responsabile:</span>
              <span className="font-mono text-2xl font-bold tracking-widest text-hermes-500">{nuovoWs.pin}</span>
            </div>
          </div>
          {linkOnboardingWs && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-green-700">Link di onboarding generato — configuralo tu stesso o mandalo al cliente:</p>
              <div className="flex items-center gap-2 bg-white border border-green-200 rounded-xl px-3 py-2">
                <span className="text-xs font-mono text-gray-600 flex-1 truncate">{linkOnboardingWs}</span>
                <button
                  onClick={async () => { await navigator.clipboard.writeText(linkOnboardingWs); setLinkOnboardingWsCopiato(true); setTimeout(() => setLinkOnboardingWsCopiato(false), 2000) }}
                  className="text-xs font-semibold text-hermes-600 hover:text-hermes-800 shrink-0"
                >
                  {linkOnboardingWsCopiato ? '✅ Copiato!' : '📋 Copia'}
                </button>
              </div>
              <a href={linkOnboardingWs} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-hermes-500 py-3 text-sm font-bold text-white hover:bg-hermes-600 transition-colors">
                🚀 Configura workspace ora →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Link onboarding */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-wider">🔗 Genera link onboarding</h2>
        <p className="text-xs text-gray-400">Genera un link da mandare al cliente — configurerà da solo il proprio workspace.</p>

        <div>
          <label className={labelClass}>Piano</label>
          <div className="grid grid-cols-2 gap-2">
            {(['registra', 'registra_gestisci'] as const).map(p => (
              <button
                key={p}
                onClick={() => setFormToken(f => ({ ...f, piano: p }))}
                className={`rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  formToken.piano === p ? 'border-hermes-400 bg-hermes-50 text-hermes-700' : 'border-gray-200 text-gray-500'
                }`}
              >
                {p === 'registra' ? '🎙️ Solo Registra' : '📋 Registra + Gestisci'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>N° commerciali</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFormToken(f => ({ ...f, max_commerciali: Math.max(1, f.max_commerciali - 1) }))}
              className="w-10 h-10 rounded-xl border border-gray-200 text-lg font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center"
            >−</button>
            <span className="text-2xl font-bold text-gray-800 w-8 text-center">{formToken.max_commerciali}</span>
            <button
              onClick={() => setFormToken(f => ({ ...f, max_commerciali: Math.min(20, f.max_commerciali + 1) }))}
              className="w-10 h-10 rounded-xl border border-gray-200 text-lg font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center"
            >+</button>
          </div>
        </div>

        <button
          onClick={creaToken}
          disabled={creazioneToken}
          className="w-full rounded-xl bg-hermes-500 py-3 text-sm font-semibold text-white hover:bg-hermes-600 disabled:opacity-40 shadow-sm"
        >
          {creazioneToken ? 'Generazione…' : '🔗 Genera link'}
        </button>

        {nuovoLink && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-green-700">Link generato!</p>
            <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2">
              <span className="text-xs font-mono text-gray-600 flex-1 truncate">{nuovoLink}</span>
              <button onClick={() => copiaLink(nuovoLink)} className="text-xs font-semibold text-hermes-600 hover:text-hermes-800 shrink-0">
                {linkCopiato ? '✅ Copiato!' : '📋 Copia'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => copiaLink(nuovoLink)}
                className="rounded-lg border border-green-300 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors">
                📋 Copia e manda al cliente
              </button>
              <a href={nuovoLink} target="_blank" rel="noreferrer"
                className="rounded-lg bg-hermes-500 py-2 text-xs font-bold text-white text-center hover:bg-hermes-600 transition-colors">
                🚀 Configura tu stesso →
              </a>
            </div>
          </div>
        )}

        {/* Token attivi */}
        {tokens.filter(t => !t.usato).length > 0 && (
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500">Link in attesa ({tokens.filter(t => !t.usato).length})</p>
            {tokens.filter(t => !t.usato).map(t => (
              <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                <div>
                  <span className="text-xs font-medium text-gray-700">
                    {t.piano === 'registra_gestisci' ? '📋' : '🎙️'} {t.piano === 'registra_gestisci' ? 'Registra + Gestisci' : 'Solo Registra'} · {t.max_commerciali} comm.
                  </span>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">Scade: {new Date(t.scadenza).toLocaleDateString('it-IT')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copiaLink(`${window.location.origin}/onboarding/${t.token}`)}
                    className="text-xs text-hermes-600 hover:text-hermes-800 font-medium"
                  >
                    Copia
                  </button>
                  <button onClick={() => eliminaToken(t.id)} className="text-xs text-red-400 hover:text-red-600">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista workspace */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-wider">📋 Workspace attivi ({workspaces.length})</h2>
        {workspaces.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nessun workspace ancora.</p>
        ) : (
          <ul className="space-y-3">
            {workspaces.map(ws => (
              <li key={ws.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ws.logo_url && <img src={ws.logo_url} alt={ws.nome_azienda} className="h-8 w-auto object-contain" />}
                    <div>
                      <p className="font-semibold text-gray-900">{ws.nome_azienda}</p>
                      <p className="text-xs text-gray-400 font-mono">{ws.slug}.voiceleads.it</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ws.has_gestisci ? 'bg-hermes-100 text-hermes-700' : 'bg-gray-100 text-gray-500'}`}>
                          {ws.has_gestisci ? '📋 Registra + Gestisci' : '🎙️ Solo Registra'}
                        </span>
                        {ws.fatturazione === 'prova' && !ws.sospeso && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            ⏳ In prova gratuita
                            {ws.scadenza_il && (() => {
                              const g = Math.max(0, Math.ceil((new Date(ws.scadenza_il).getTime() - Date.now()) / 86400000))
                              return ` — ${g}gg`
                            })()}
                          </span>
                        )}
                        {ws.sospeso && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                            ⛔ Sospeso
                          </span>
                        )}
                        {ws.stripe_subscription_status === 'active' && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            💳 Pagante
                          </span>
                        )}
                        {ws.stripe_subscription_status === 'canceling' && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                            ⏸️ Non si rinnova
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(ws.creato_il).toLocaleDateString('it-IT')}</span>
                </div>

                <div className="flex items-center gap-3 bg-hermes-50 rounded-xl px-4 py-2.5">
                  <span className="text-xs text-hermes-600 font-medium">PIN:</span>
                  {ws.pin.startsWith('$2') ? (
                    <span className="text-xl font-bold tracking-widest text-hermes-300 font-mono">••••••</span>
                  ) : (
                    <>
                      <span className="text-xl font-bold tracking-widest text-hermes-600 font-mono">
                        {pinVisibile[ws.id] ? ws.pin : '••••••'}
                      </span>
                      <button
                        onClick={() => setPinVisibile(v => ({ ...v, [ws.id]: !v[ws.id] }))}
                        className="ml-auto text-hermes-400 hover:text-hermes-600 text-sm"
                      >
                        {pinVisibile[ws.id] ? '🙈' : '👁️'}
                      </button>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => apriModifica(ws)}
                    className="flex-1 rounded-xl border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    ✏️ Modifica
                  </button>

                  {/* Abbonamento attivo → solo Sospendi rinnovo */}
                  {ws.stripe_subscription_status === 'active' && (
                    confermaSospendi === ws.id ? (
                      <div className="flex-1 flex gap-1">
                        <button onClick={() => setConfermaSospendi(null)}
                          className="flex-1 rounded-xl border border-gray-300 py-2 text-sm text-gray-500 hover:bg-gray-50">
                          Annulla
                        </button>
                        <button onClick={() => sospendi(ws.id)} disabled={sospensione === ws.id}
                          className="flex-1 rounded-xl bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
                          {sospensione === ws.id ? '…' : 'Conferma'}
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfermaSospendi(ws.id)}
                        className="flex-1 rounded-xl border border-amber-300 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors">
                        ⏸️ Sospendi rinnovo
                      </button>
                    )
                  )}

                  {/* Rinnovo sospeso → info */}
                  {ws.stripe_subscription_status === 'canceling' && (
                    <div className="flex-1 rounded-xl border border-gray-200 py-2 text-xs text-center text-gray-400">
                      ⏳ Attivo fino a scadenza
                    </div>
                  )}

                  {/* Nessun abbonamento attivo → Elimina */}
                  {(!ws.stripe_subscription_status || ws.stripe_subscription_status === 'canceled' || ws.stripe_subscription_status === 'trialing') && (
                    confermaElimina === ws.id ? (
                      <div className="flex-1 flex gap-1">
                        <button onClick={() => setConfermaElimina(null)}
                          className="flex-1 rounded-xl border border-gray-300 py-2 text-sm text-gray-500 hover:bg-gray-50">
                          Annulla
                        </button>
                        <button onClick={() => elimina(ws.id)} disabled={eliminazione === ws.id}
                          className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                          {eliminazione === ws.id ? '…' : 'Conferma'}
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfermaElimina(ws.id)}
                        className="flex-1 rounded-xl border border-red-200 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                        🗑️ Elimina
                      </button>
                    )
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Abbonamenti */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-3">
        <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-wider">💳 Abbonamenti & Fatturazione</h2>
        <p className="text-xs text-gray-400">Visualizza tutti gli abbonamenti attivi, le scadenze e i dati per la fatturazione.</p>
        <a
          href="/admin/fatture"
          className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="text-2xl">📊</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">Report abbonamenti</p>
            <p className="text-xs text-gray-400">Tutti gli ordini con dati P.IVA, scadenze e importi — esportabile in PDF</p>
          </div>
          <span className="ml-auto text-gray-400">→</span>
        </a>
      </div>

      {/* Nota GDPR + breach */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
        <span className="text-blue-400 text-lg shrink-0">ℹ️</span>
        <div className="text-xs text-blue-600 space-y-1.5 w-full">
          <p><strong>Richieste GDPR dei clienti</strong> — Le richieste di cancellazione o portabilità dati (Art. 17 e 20 GDPR) vengono inoltrate direttamente dai clienti tramite il loro workspace. Ricevi le richieste a <strong>info@hermesmarketing.it</strong>.</p>
          <div className="flex gap-3 flex-wrap pt-1 items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              <a href="/privacy" target="_blank" className="underline hover:text-blue-800">Privacy Policy</a>
              <a href="/cookie" target="_blank" className="underline hover:text-blue-800">Cookie Policy</a>
              <a href="/dpa" target="_blank" className="underline hover:text-blue-800">DPA (Art. 28 GDPR)</a>
            </div>
            <button
              onClick={() => { setModalita('breach'); setBreachRisultato(null); setBreachErrore(null); setBreachPreview(null) }}
              className="text-xs font-semibold text-red-600 border border-red-300 bg-white rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
            >
              ⚠️ Notifica Data Breach
            </button>
          </div>
        </div>
      </div>

    </div></AppShell>
  )
}
