'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const PROVINCE = [
  'AG','AL','AN','AO','AR','AP','AT','AV','BA','BT','BL','BN','BG','BI','BO','BZ','BS','BR',
  'CA','CL','CB','CI','CE','CT','CZ','CH','CO','CS','CR','KR','CN','EN','FM','FE','FI','FG',
  'FC','FR','GE','GO','GR','IM','IS','SP','LT','LE','LC','LI','LO','LU','MC','MN','MS','MT',
  'ME','MI','MO','MB','NA','NO','NU','OG','OT','OR','PD','PA','PR','PV','PG','PU','PE','PC',
  'PI','PT','PN','PZ','PO','RG','RA','RC','RE','RI','RN','RO','RM','SA','SS','SV','SI','SR',
  'SO','TA','TE','TR','TO','OT','TP','TN','TV','TS','UD','VA','VE','VB','VC','VR','VV','VI','VT',
]

function FatturazioneForm() {
  const params = useSearchParams()
  const router = useRouter()

  const piano = params.get('piano') ?? 'pro'
  const fatturazione = params.get('fatturazione') ?? 'mensile'
  const commerciali = params.get('commerciali') ?? '1'
  const totale = params.get('totale') ?? '0'

  const [form, setForm] = useState({
    ragione_sociale: '',
    partita_iva: '',
    codice_sdi: '',
    pec: '',
    indirizzo: '',
    cap: '',
    citta: '',
    provincia: '',
  })
  const [errore, setErrore] = useState<string | null>(null)

  const aggiorna = (campo: string, valore: string) =>
    setForm(f => ({ ...f, [campo]: valore }))

  const valida = () => {
    if (!form.ragione_sociale.trim()) return 'Inserisci la ragione sociale'
    if (!/^\d{11}$/.test(form.partita_iva.replace(/\s/g, '')))
      return 'La Partita IVA deve essere di 11 cifre'
    if (!form.codice_sdi && !form.pec)
      return 'Inserisci almeno il Codice SDI o la PEC'
    if (!form.indirizzo.trim()) return 'Inserisci l\'indirizzo'
    if (!/^\d{5}$/.test(form.cap)) return 'Il CAP deve essere di 5 cifre'
    if (!form.citta.trim()) return 'Inserisci la città'
    if (!form.provincia) return 'Seleziona la provincia'
    return null
  }

  const vai = () => {
    const err = valida()
    if (err) { setErrore(err); return }
    setErrore(null)
    // Salvo i dati in sessionStorage per leggerli nella pagina pagamento
    sessionStorage.setItem('voicelead_fatturazione', JSON.stringify(form))
    const qs = new URLSearchParams({ piano, fatturazione, commerciali, totale })
    router.push(`/checkout/pagamento?${qs}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-lg mx-auto space-y-6">

        <div>
          <Link href={`/checkout?piano=${piano}`} className="text-sm text-gray-400 hover:text-gray-600">← Torna alla configurazione</Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-3">Dati di fatturazione</h1>
          <p className="text-sm text-gray-500 mt-1">Necessari per l'emissione della fattura elettronica.</p>
        </div>

        {/* Dati azienda */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <p className="font-bold text-gray-900">Azienda</p>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ragione sociale *</label>
            <input
              type="text"
              value={form.ragione_sociale}
              onChange={e => aggiorna('ragione_sociale', e.target.value)}
              placeholder="Es. Rossi & Partners S.r.l."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Partita IVA *</label>
            <input
              type="text"
              inputMode="numeric"
              value={form.partita_iva}
              onChange={e => aggiorna('partita_iva', e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="12345678901"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400"
            />
          </div>
        </div>

        {/* Fatturazione elettronica */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div>
            <p className="font-bold text-gray-900">Fatturazione elettronica</p>
            <p className="text-xs text-gray-400 mt-0.5">Inserisci almeno uno tra Codice SDI e PEC.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Codice SDI</label>
            <input
              type="text"
              value={form.codice_sdi}
              onChange={e => aggiorna('codice_sdi', e.target.value.toUpperCase().slice(0, 7))}
              placeholder="Es. ABCDE12"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400 font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">oppure</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">PEC aziendale</label>
            <input
              type="email"
              value={form.pec}
              onChange={e => aggiorna('pec', e.target.value)}
              placeholder="azienda@pec.it"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400"
            />
          </div>
        </div>

        {/* Indirizzo */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <p className="font-bold text-gray-900">Indirizzo sede legale</p>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Indirizzo *</label>
            <input
              type="text"
              value={form.indirizzo}
              onChange={e => aggiorna('indirizzo', e.target.value)}
              placeholder="Via Roma 1"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">CAP *</label>
              <input
                type="text"
                inputMode="numeric"
                value={form.cap}
                onChange={e => aggiorna('cap', e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="20100"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Città *</label>
              <input
                type="text"
                value={form.citta}
                onChange={e => aggiorna('citta', e.target.value)}
                placeholder="Milano"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Provincia *</label>
            <select
              value={form.provincia}
              onChange={e => aggiorna('provincia', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400 bg-white"
            >
              <option value="">Seleziona…</option>
              {PROVINCE.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {errore && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{errore}</div>
        )}

        <button
          onClick={vai}
          className="w-full rounded-xl bg-hermes-500 text-white font-bold py-4 text-base hover:bg-hermes-600 transition-colors shadow-md"
        >
          Vai al pagamento →
        </button>

        <p className="text-center text-xs text-gray-400 pb-6">
          I tuoi dati sono trattati secondo la nostra{' '}
          <a href="/privacy" className="text-hermes-500 underline">Privacy Policy</a> e il{' '}
          <a href="/dpa" className="text-hermes-500 underline">DPA</a>.
        </p>
      </div>
    </div>
  )
}

export default function FatturazionePage() {
  return <Suspense><FatturazioneForm /></Suspense>
}
