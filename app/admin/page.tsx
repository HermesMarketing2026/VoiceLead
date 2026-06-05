'use client'
import { useEffect, useState } from 'react'
import type { Workspace } from '@/lib/types'
import PinLogin from '@/components/PinLogin'
import { salvaSessione, leggiSessione, cancellaSessione } from '@/lib/session'

export default function Admin() {
  const [autenticato, setAutenticato] = useState(false)
  const [pronto, setPronto] = useState(false)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [form, setForm] = useState({ nome_azienda: '', google_sheet_id: '' })
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
      setForm({ nome_azienda: '', google_sheet_id: '' })
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

  const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Admin — Workspace</h1>
        <button
          onClick={() => { cancellaSessione(); setAutenticato(false) }}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Esci
        </button>
      </div>

      {/* Crea nuovo workspace */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-700">Nuovo workspace</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome azienda cliente</label>
          <input
            className={inputClass}
            value={form.nome_azienda}
            onChange={e => setForm(f => ({ ...f, nome_azienda: e.target.value }))}
            placeholder="Acme S.r.l."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Google Sheet ID</label>
          <input
            className={inputClass}
            value={form.google_sheet_id}
            onChange={e => setForm(f => ({ ...f, google_sheet_id: e.target.value }))}
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
          />
          <p className="text-xs text-gray-400 mt-1">Dall'URL del foglio: /spreadsheets/d/<strong>[ID]</strong>/edit</p>
        </div>
        {errore && <p className="text-sm text-red-600">{errore}</p>}
        <button
          onClick={creaWorkspace}
          disabled={creazione || !form.nome_azienda || !form.google_sheet_id}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {creazione ? 'Creazione…' : 'Crea workspace'}
        </button>
      </div>

      {/* Credenziali nuovo workspace */}
      {nuovoWs && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-5 space-y-2">
          <p className="font-semibold text-green-800">✅ Workspace creato!</p>
          <p className="text-sm text-green-700">Invia queste credenziali al cliente:</p>
          <div className="bg-white rounded-lg border border-green-200 p-4 space-y-1 text-sm font-mono">
            <p><span className="text-gray-500">URL:</span> <strong>{nuovoWs.slug}.voicelead.io</strong></p>
            <p><span className="text-gray-500">PIN:</span> <strong className="text-2xl tracking-widest">{nuovoWs.pin}</strong></p>
          </div>
          <p className="text-xs text-green-600">⚠️ Salva il PIN ora — non sarà più mostrato in chiaro.</p>
        </div>
      )}

      {/* Lista workspace esistenti */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700">Workspace attivi ({workspaces.length})</h2>
        {workspaces.length === 0 ? (
          <p className="text-sm text-gray-400">Nessun workspace ancora.</p>
        ) : (
          <ul className="space-y-2">
            {workspaces.map(ws => (
              <li key={ws.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{ws.nome_azienda}</p>
                    <p className="text-sm text-gray-500">{ws.slug}.voicelead.io</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(ws.creato_il).toLocaleDateString('it-IT')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
