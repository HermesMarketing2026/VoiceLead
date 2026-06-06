'use client'
import { useEffect, useState } from 'react'
import type { Workspace, Utente, ProvisioningToken } from '@/lib/types'
import PinLogin from '@/components/PinLogin'
import { salvaSessione, leggiSessione, cancellaSessione } from '@/lib/session'
import AppShell from '@/components/AppShell'

type Modalita = 'lista' | 'modifica'

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
    const res = await fetch('/api/provisioning-tokens')
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
        headers: { 'Content-Type': 'application/json' },
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
    await fetch(`/api/provisioning-tokens/${id}`, { method: 'DELETE' })
    caricaTokens()
  }

  const caricaWorkspaces = async () => {
    const res = await fetch('/api/workspaces')
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
    salvaSessione('admin')
    setAutenticato(true)
  }

  const creaWorkspace = async () => {
    if (!form.nome_azienda) return
    setCreazione(true)
    setErrore(null)
    setNuovoWs(null)
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNuovoWs(data)
      setForm({ nome_azienda: '', logo_url: '', nome_referente: '', cognome_referente: '', has_gestisci: false })
      caricaWorkspaces()
    } catch (e: any) {
      setErrore(e.message)
    } finally {
      setCreazione(false)
    }
  }

  const apriModifica = (ws: Workspace) => {
    setWsInModifica(ws)
    setFormModifica({ nome_azienda: ws.nome_azienda, logo_url: ws.logo_url ?? '', nome_referente: ws.nome_referente ?? '', cognome_referente: ws.cognome_referente ?? '', has_gestisci: ws.has_gestisci ?? false, pin: ws.pin })
    setModalita('modifica')
    caricaUtenti(ws.id)
  }

  const caricaUtenti = async (workspaceId: string) => {
    const res = await fetch(`/api/utenti?workspace_id=${workspaceId}`)
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
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`/api/utenti/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Errore eliminazione')
      setConfermaEliminaUtente(null)
      if (wsInModifica) caricaUtenti(wsInModifica.id)
    } catch (e: any) {
      setErroreUtente(e.message)
    } finally {
      setEliminazioneUtente(null)
    }
  }

  const salvaModifica = async () => {
    if (!wsInModifica) return
    setSalvataggio(true)
    try {
      const res = await fetch(`/api/workspaces/${wsInModifica.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formModifica),
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

  const elimina = async (id: string) => {
    setEliminazione(id)
    try {
      const res = await fetch(`/api/workspaces/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Errore eliminazione')
      setConfermaElimina(null)
      caricaWorkspaces()
    } catch (e: any) {
      setErrore(e.message)
    } finally {
      setEliminazione(null)
    }
  }

  if (!pronto) return null
  if (!autenticato) {
    return <AppShell><PinLogin titolo="Admin VoiceLeads" sottotitolo="Accesso riservato" onSuccess={onLogin} /></AppShell>
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
            <input
              className={inputClass}
              value={formModifica.pin}
              onChange={e => setFormModifica(f => ({ ...f, pin: e.target.value.replace(/\D/g, '') }))}
              maxLength={6}
              inputMode="numeric"
              placeholder="6 cifre"
            />
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

        {/* Sezione commerciali */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-wider">👥 Commerciali</h2>
          <p className="text-xs text-gray-400">Ogni commerciale ha il suo PIN e vede solo i propri lead. Il PIN del workspace è riservato al responsabile.</p>

          {utenti.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">Nessun commerciale ancora — accesso singolo con PIN workspace.</p>
          ) : (
            <ul className="space-y-2">
              {utenti.map(u => (
                <li key={u.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-hermes-100 flex items-center justify-center text-hermes-600 font-bold text-sm shrink-0">
                      {u.nome[0]}{u.cognome[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{u.nome} {u.cognome}</p>
                      <p className="text-xs text-gray-400 font-mono">PIN: {u.pin}</p>
                    </div>
                  </div>
                  {confermaEliminaUtente === u.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => setConfermaEliminaUtente(null)} className="text-xs text-gray-500 px-2 py-1 rounded-lg border border-gray-300 bg-white">Annulla</button>
                      <button onClick={() => eliminaUtente(u.id)} disabled={eliminazioneUtente === u.id} className="text-xs text-white bg-red-500 px-2 py-1 rounded-lg disabled:opacity-50">
                        {eliminazioneUtente === u.id ? '…' : 'Elimina'}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfermaEliminaUtente(u.id)} className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                      🗑️
                    </button>
                  )}
                </li>
              ))}
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
        <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-wider">➕ Nuovo workspace cliente</h2>
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
        {/* Toggle Gestisci */}
        <div
          onClick={() => setForm(f => ({ ...f, has_gestisci: !f.has_gestisci }))}
          className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors ${
            form.has_gestisci ? 'border-hermes-400 bg-hermes-50' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div>
            <p className={`text-sm font-bold ${form.has_gestisci ? 'text-hermes-700' : 'text-gray-600'}`}>
              📋 Abilita Gestisci trattative
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {form.has_gestisci ? 'Pacchetto completo — Registra + Gestisci' : 'Solo Registra lead (Pacchetto base)'}
            </p>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors relative ${form.has_gestisci ? 'bg-hermes-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.has_gestisci ? 'left-7' : 'left-1'}`} />
          </div>
        </div>

        {errore && <p className="text-sm text-red-500">{errore}</p>}
        <button onClick={creaWorkspace} disabled={creazione || !form.nome_azienda}
          className="w-full rounded-xl bg-hermes-500 py-3 text-sm font-semibold text-white hover:bg-hermes-600 disabled:opacity-40 shadow-sm">
          {creazione ? 'Creazione…' : 'Crea workspace'}
        </button>
      </div>

      {/* Credenziali nuovo workspace */}
      {nuovoWs && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-5 space-y-3">
          <p className="font-bold text-green-800">✅ Workspace creato!</p>
          <div className="bg-white rounded-xl border border-green-200 p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">URL:</span>
              <span className="font-mono font-semibold text-gray-800">{nuovoWs.slug}.voiceleads.it</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">PIN:</span>
              <span className="font-mono text-2xl font-bold tracking-widest text-hermes-500">{nuovoWs.pin}</span>
            </div>
          </div>
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
            <p className="text-xs font-semibold text-green-700">Link generato! Mandalo al cliente:</p>
            <div className="flex items-center gap-2 bg-white border border-green-200 rounded-lg px-3 py-2">
              <span className="text-xs font-mono text-gray-600 flex-1 truncate">{nuovoLink}</span>
              <button
                onClick={() => copiaLink(nuovoLink)}
                className="text-xs font-semibold text-hermes-600 hover:text-hermes-800 shrink-0"
              >
                {linkCopiato ? '✅ Copiato!' : '📋 Copia'}
              </button>
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
                      <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${ws.has_gestisci ? 'bg-hermes-100 text-hermes-700' : 'bg-gray-100 text-gray-500'}`}>
                        {ws.has_gestisci ? '📋 Registra + Gestisci' : '🎙️ Solo Registra'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(ws.creato_il).toLocaleDateString('it-IT')}</span>
                </div>

                <div className="flex items-center gap-3 bg-hermes-50 rounded-xl px-4 py-2.5">
                  <span className="text-xs text-hermes-600 font-medium">PIN:</span>
                  <span className="text-xl font-bold tracking-widest text-hermes-600 font-mono">{ws.pin}</span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => apriModifica(ws)}
                    className="flex-1 rounded-xl border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    ✏️ Modifica
                  </button>
                  {confermaElimina === ws.id ? (
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
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sezione GDPR */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-bold text-blue-500 uppercase tracking-wider">🔒 GDPR — Gestione dati</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Usa questa sezione per rispondere a richieste di cancellazione o portabilità dati
          da parte degli interessati (Art. 17 e 20 GDPR).
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <a
            href="mailto:privacy@hermesmarketing.it?subject=Richiesta cancellazione dati&body=Workspace ID: %0AMotivo: diritto all'oblio Art. 17 GDPR"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🗑️</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">Richiesta cancellazione</p>
              <p className="text-xs text-gray-400">Invia richiesta formale via email</p>
            </div>
          </a>
          <a
            href="mailto:privacy@hermesmarketing.it?subject=Richiesta export dati&body=Workspace ID: %0AMotivo: portabilità dati Art. 20 GDPR"
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">📤</span>
            <div>
              <p className="text-sm font-semibold text-gray-800">Richiesta export dati</p>
              <p className="text-xs text-gray-400">Portabilità dati Art. 20 GDPR</p>
            </div>
          </a>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
          <span className="text-blue-400 text-lg shrink-0">ℹ️</span>
          <div className="text-xs text-blue-600 space-y-1">
            <p><strong>Documenti legali disponibili:</strong></p>
            <div className="flex gap-3 flex-wrap mt-1">
              <a href="/privacy" target="_blank" className="underline hover:text-blue-800">Privacy Policy</a>
              <a href="/cookie" target="_blank" className="underline hover:text-blue-800">Cookie Policy</a>
              <a href="/dpa" target="_blank" className="underline hover:text-blue-800">DPA (Art. 28 GDPR)</a>
            </div>
          </div>
        </div>
      </div>

    </div></AppShell>
  )
}
