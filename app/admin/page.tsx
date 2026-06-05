'use client'
import { useEffect, useState } from 'react'
import type { Workspace } from '@/lib/types'
import PinLogin from '@/components/PinLogin'
import { salvaSessione, leggiSessione, cancellaSessione } from '@/lib/session'

type Modalita = 'lista' | 'modifica'

export default function Admin() {
  const [autenticato, setAutenticato] = useState(false)
  const [pronto, setPronto] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [form, setForm] = useState({ nome_azienda: '', google_sheet_id: '', logo_url: '' })
  const [creazione, setCreazione] = useState(false)
  const [nuovoWs, setNuovoWs] = useState<Workspace | null>(null)
  const [errore, setErrore] = useState<string | null>(null)
  const [modalita, setModalita] = useState<Modalita>('lista')
  const [wsInModifica, setWsInModifica] = useState<Workspace | null>(null)
  const [formModifica, setFormModifica] = useState({ nome_azienda: '', google_sheet_id: '', logo_url: '' })
  const [salvataggio, setSalvataggio] = useState(false)
  const [eliminazione, setEliminazione] = useState<string | null>(null)
  const [confermaElimina, setConfermaElimina] = useState<string | null>(null)

  useEffect(() => {
    const sessione = leggiSessione()
    if (sessione?.tipo === 'admin') setAutenticato(true)
    setPronto(true)
  }, [])

  useEffect(() => {
    if (autenticato) caricaWorkspaces()
  }, [autenticato])

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
    if (!form.nome_azienda || !form.google_sheet_id) return
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
      setForm({ nome_azienda: '', google_sheet_id: '', logo_url: '' })
      caricaWorkspaces()
    } catch (e: any) {
      setErrore(e.message)
    } finally {
      setCreazione(false)
    }
  }

  const apriModifica = (ws: Workspace) => {
    setWsInModifica(ws)
    setFormModifica({ nome_azienda: ws.nome_azienda, google_sheet_id: ws.google_sheet_id, logo_url: ws.logo_url ?? '' })
    setModalita('modifica')
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
    return <PinLogin titolo="Admin VoiceLead" sottotitolo="Accesso riservato" onSuccess={onLogin} />
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-hermes-400 transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-600 mb-1.5'

  // Vista modifica
  if (modalita === 'modifica' && wsInModifica) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setModalita('lista')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Modifica workspace</h1>
            <p className="text-xs text-gray-400 font-mono">{wsInModifica.slug}.demohermes.it</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className={labelClass}>Nome azienda cliente</label>
            <input className={inputClass} value={formModifica.nome_azienda} onChange={e => setFormModifica(f => ({ ...f, nome_azienda: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>Google Sheet ID</label>
            <input className={inputClass} value={formModifica.google_sheet_id} onChange={e => setFormModifica(f => ({ ...f, google_sheet_id: e.target.value }))} />
          </div>
          <div>
            <label className={labelClass}>URL Logo <span className="text-gray-400 font-normal">(opzionale)</span></label>
            <input className={inputClass} value={formModifica.logo_url} onChange={e => setFormModifica(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://..." />
            {formModifica.logo_url && (
              <img src={formModifica.logo_url} alt="Logo" className="mt-2 h-10 object-contain rounded border border-gray-100 p-1" />
            )}
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
      </div>
    )
  }

  // Vista lista
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pannello Admin</h1>
          <p className="text-xs text-gray-400 mt-0.5">VoiceLead by Hermes Marketing</p>
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
        <div>
          <label className={labelClass}>Google Sheet ID</label>
          <input className={inputClass} value={form.google_sheet_id} onChange={e => setForm(f => ({ ...f, google_sheet_id: e.target.value }))} placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" />
          <p className="text-xs text-gray-400 mt-1">Dall'URL del foglio: /spreadsheets/d/<strong>[ID]</strong>/edit</p>
        </div>
        <div>
          <label className={labelClass}>URL Logo <span className="text-gray-400 font-normal">(opzionale)</span></label>
          <input className={inputClass} value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://esempio.com/logo.png" />
          {form.logo_url && <img src={form.logo_url} alt="Anteprima" className="mt-2 h-10 object-contain rounded border border-gray-100 p-1" />}
        </div>
        {errore && <p className="text-sm text-red-500">{errore}</p>}
        <button onClick={creaWorkspace} disabled={creazione || !form.nome_azienda || !form.google_sheet_id}
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
              <span className="font-mono font-semibold text-gray-800">{nuovoWs.slug}.demohermes.it</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">PIN:</span>
              <span className="font-mono text-2xl font-bold tracking-widest text-hermes-500">{nuovoWs.pin}</span>
            </div>
          </div>
        </div>
      )}

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
                      <p className="text-xs text-gray-400 font-mono">{ws.slug}.demohermes.it</p>
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
    </div>
  )
}
