'use client'
import { useEffect, useState } from 'react'
import type { Workspace } from '@/lib/types'
import PinLogin from '@/components/PinLogin'
import { salvaSessione, leggiSessione, cancellaSessione } from '@/lib/session'

export default function Admin() {
  const [autenticato, setAutenticato] = useState(false)
  const [pronto, setPronto] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [form, setForm] = useState({ nome_azienda: '', google_sheet_id: '', logo_url: '' })
  const [creazione, setCreazione] = useState(false)
  const [nuovoWs, setNuovoWs] = useState<Workspace | null>(null)
  const [errore, setErrore] = useState<string | null>(null)

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

  if (!pronto) return null
  if (!autenticato) {
    return <PinLogin titolo="Admin VoiceLead" sottotitolo="Accesso riservato" onSuccess={onLogin} />
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400 bg-gray-50 focus:bg-white transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-600 mb-1.5'

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pannello Admin</h1>
          <p className="text-xs text-gray-400 mt-0.5">VoiceLead by Hermes Marketing</p>
        </div>
        <button
          onClick={() => { cancellaSessione(); setAutenticato(false) }}
          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
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
          <label className={labelClass}>URL Logo cliente <span className="text-gray-400 font-normal">(opzionale)</span></label>
          <input className={inputClass} value={form.logo_url} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} placeholder="https://esempio.com/logo.png" />
          <p className="text-xs text-gray-400 mt-1">Il logo apparirà nella schermata di accesso del cliente</p>
          {form.logo_url && (
            <img src={form.logo_url} alt="Anteprima logo" className="mt-2 h-10 object-contain rounded border border-gray-100 p-1" />
          )}
        </div>

        {errore && <p className="text-sm text-red-500">{errore}</p>}

        <button
          onClick={creaWorkspace}
          disabled={creazione || !form.nome_azienda || !form.google_sheet_id}
          className="w-full rounded-xl bg-hermes-500 py-3 text-sm font-semibold text-white hover:bg-hermes-600 disabled:opacity-40 transition-colors shadow-sm"
        >
          {creazione ? 'Creazione…' : 'Crea workspace'}
        </button>
      </div>

      {/* Credenziali nuovo workspace */}
      {nuovoWs && (
        <div className="rounded-2xl bg-green-50 border border-green-200 p-5 space-y-3">
          <p className="font-bold text-green-800">✅ Workspace creato!</p>
          <p className="text-sm text-green-700">Invia queste credenziali al cliente:</p>
          <div className="bg-white rounded-xl border border-green-200 p-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">URL accesso:</span>
              <span className="font-mono font-semibold text-gray-800">{nuovoWs.slug}.demohermes.it</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">PIN:</span>
              <span className="font-mono text-2xl font-bold tracking-widest text-hermes-500">{nuovoWs.pin}</span>
            </div>
          </div>
          <p className="text-xs text-green-600">Il PIN è sempre visibile qui sotto nella lista workspace.</p>
        </div>
      )}

      {/* Lista workspace */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-wider">
          📋 Workspace attivi ({workspaces.length})
        </h2>
        {workspaces.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nessun workspace ancora.</p>
        ) : (
          <ul className="space-y-3">
            {workspaces.map(ws => (
              <li key={ws.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ws.logo_url && (
                      <img src={ws.logo_url} alt={ws.nome_azienda} className="h-8 w-auto object-contain" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{ws.nome_azienda}</p>
                      <p className="text-xs text-gray-400 font-mono">{ws.slug}.demohermes.it</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(ws.creato_il).toLocaleDateString('it-IT')}
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-hermes-50 rounded-xl px-4 py-2.5">
                  <span className="text-xs text-hermes-600 font-medium">PIN accesso:</span>
                  <span className="text-xl font-bold tracking-widest text-hermes-600 font-mono">{ws.pin}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
