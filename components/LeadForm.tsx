'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Lead, LeadFormData } from '@/lib/types'
import { campiMancanti, calcolaCompletamento } from '@/lib/types'
import MicButton from './MicButton'

interface Props {
  lead?: Lead
  workspaceId: string
}

const VUOTO: LeadFormData = { nome: '', cognome: '', azienda: '', email: '', telefono: '', note: '' }

export default function LeadForm({ lead, workspaceId }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<LeadFormData>(lead ? {
    nome: lead.nome, cognome: lead.cognome, azienda: lead.azienda,
    email: lead.email, telefono: lead.telefono, note: lead.note ?? '',
  } : VUOTO)
  const [trascrizione, setTrascrizione] = useState('')
  const [salvataggio, setSalvataggio] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)

  const mancanti = campiMancanti(form)
  const completamento = calcolaCompletamento(form)
  const isNuovo = !lead

  const aggiorna = (campo: keyof LeadFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [campo]: e.target.value }))

  const onEstrazione = (dati: Record<string, string>) => {
    setForm(f => ({
      nome:     dati.nome     || f.nome,
      cognome:  dati.cognome  || f.cognome,
      azienda:  dati.azienda  || f.azienda,
      email:    dati.email    || f.email,
      telefono: dati.telefono || f.telefono,
      note:     dati.note     || f.note,
    }))
  }

  const salva = async () => {
    setSalvataggio(true)
    setErrore(null)
    try {
      const url = isNuovo ? '/api/leads' : `/api/leads/${lead!.id}`
      const method = isNuovo ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, workspace_id: workspaceId }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Errore ${res.status}`)
      }
      router.push('/')
      router.refresh()
    } catch (e: any) {
      setErrore(e.message)
    } finally {
      setSalvataggio(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-600 mb-1.5'

  return (
    <div className="space-y-5">

      {/* Dettatura */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-wider mb-5">🎙️ Dettatura vocale</h2>
        <MicButton onTrascrizione={setTrascrizione} onEstrazione={onEstrazione} />
        {trascrizione && (
          <div className="mt-5 rounded-xl bg-hermes-50 border border-hermes-200 p-3.5">
            <p className="text-xs text-hermes-500 font-medium mb-1">Testo riconosciuto:</p>
            <p className="text-sm text-gray-700 italic leading-relaxed">"{trascrizione}"</p>
          </div>
        )}
      </div>

      {/* Banner stato */}
      {mancanti.length === 0 ? (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-center gap-2">
          ✅ <span>Tutti i campi obbligatori sono compilati — il lead è pronto per l'export.</span>
        </div>
      ) : (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold mb-0.5">⚠️ Campi mancanti:</p>
          <p>{mancanti.join(', ')}</p>
        </div>
      )}

      {/* Barra completamento */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Completamento scheda</span>
          <span className="font-semibold text-hermes-500">{completamento}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${completamento === 100 ? 'bg-green-500' : 'bg-hermes-500'}`}
            style={{ width: `${completamento}%` }}
          />
        </div>
      </div>

      {/* Campi */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-bold text-hermes-500 uppercase tracking-wider">📋 Dati contatto</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Nome <span className="text-red-400">*</span></label>
            <input className={inputClass} value={form.nome} onChange={aggiorna('nome')} placeholder="Mario" />
          </div>
          <div>
            <label className={labelClass}>Cognome <span className="text-red-400">*</span></label>
            <input className={inputClass} value={form.cognome} onChange={aggiorna('cognome')} placeholder="Rossi" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Azienda <span className="text-red-400">*</span></label>
          <input className={inputClass} value={form.azienda} onChange={aggiorna('azienda')} placeholder="Acme S.r.l." />
        </div>

        <div>
          <label className={labelClass}>Email <span className="text-red-400">*</span></label>
          <input className={inputClass} type="email" value={form.email} onChange={aggiorna('email')} placeholder="mario@acme.it" />
        </div>

        <div>
          <label className={labelClass}>Telefono <span className="text-red-400">*</span></label>
          <input className={inputClass} type="tel" value={form.telefono} onChange={aggiorna('telefono')} placeholder="+39 333 1234567" />
        </div>

        <div>
          <label className={labelClass}>Note</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            value={form.note}
            onChange={aggiorna('note')}
            placeholder="Appunti liberi sull'incontro, interesse mostrato, follow-up…"
          />
        </div>
      </div>

      {errore && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {errore}
        </div>
      )}

      <div className="flex gap-3 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Annulla
        </button>
        <button
          type="button"
          onClick={salva}
          disabled={salvataggio}
          className="flex-1 rounded-xl bg-hermes-500 py-3 text-sm font-semibold text-white hover:bg-hermes-600 disabled:opacity-50 transition-colors shadow-sm"
        >
          {salvataggio ? 'Salvataggio…' : 'Salva lead'}
        </button>
      </div>
    </div>
  )
}
