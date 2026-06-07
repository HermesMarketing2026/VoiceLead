'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TrialPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    nome: '',
    cognome: '',
    azienda: '',
    email: '',
    commerciali: 2,
  })
  const [invio, setInvio] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)

  const aggiorna = (campo: string, valore: string | number) =>
    setForm(f => ({ ...f, [campo]: valore }))

  const avvia = async () => {
    if (!form.nome || !form.cognome || !form.azienda) {
      setErrore('Compila almeno nome, cognome e azienda.')
      return
    }
    setErrore(null)
    setInvio(true)
    try {
      const res = await fetch('/api/provisioning-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          piano: 'registra_gestisci',
          max_commerciali: form.commerciali,
          fatturazione: 'prova',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Salvo email/nome per pre-fill eventuale nel checkout futuro
      sessionStorage.setItem('voicelead_trial', JSON.stringify({
        nome: form.nome,
        cognome: form.cognome,
        azienda: form.azienda,
        email: form.email,
      }))
      router.push(`/onboarding/${data.token}`)
    } catch (e: any) {
      setErrore(e.message ?? 'Errore. Riprova.')
      setInvio(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hermes-600 via-hermes-500 to-orange-400 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center text-white">
          <div className="inline-block bg-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            ✓ Piano Pro completo · 14 giorni gratis
          </div>
          <h1 className="text-3xl font-extrabold">Inizia la tua prova</h1>
          <p className="text-hermes-100 mt-2 text-sm">Nessuna carta di credito. Workspace pronto in 2 minuti.</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl p-7 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nome *</label>
              <input
                type="text"
                value={form.nome}
                onChange={e => aggiorna('nome', e.target.value)}
                placeholder="Mario"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Cognome *</label>
              <input
                type="text"
                value={form.cognome}
                onChange={e => aggiorna('cognome', e.target.value)}
                placeholder="Rossi"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Azienda *</label>
            <input
              type="text"
              value={form.azienda}
              onChange={e => aggiorna('azienda', e.target.value)}
              placeholder="Es. Rossi & Partners S.r.l."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Email <span className="text-gray-400 font-normal">(per ricevere il link di accesso)</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => aggiorna('email', e.target.value)}
              placeholder="mario@azienda.it"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-hermes-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Quanti commerciali useranno l'app?</label>
            <div className="flex items-center gap-4 mt-1">
              <button
                onClick={() => aggiorna('commerciali', Math.max(1, form.commerciali - 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-200 text-xl font-bold text-gray-600 hover:border-hermes-400 hover:text-hermes-600 transition-all flex items-center justify-center"
              >−</button>
              <span className="text-3xl font-extrabold text-gray-900 w-10 text-center">{form.commerciali}</span>
              <button
                onClick={() => aggiorna('commerciali', Math.min(10, form.commerciali + 1))}
                className="w-10 h-10 rounded-full border-2 border-gray-200 text-xl font-bold text-gray-600 hover:border-hermes-400 hover:text-hermes-600 transition-all flex items-center justify-center"
              >+</button>
              <span className="text-sm text-gray-500">{form.commerciali === 1 ? 'commerciale' : 'commerciali'}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Il responsabile accede gratuitamente — non conta.</p>
          </div>

          {errore && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{errore}</div>
          )}

          <button
            onClick={avvia}
            disabled={invio}
            className="w-full rounded-xl bg-hermes-500 text-white font-extrabold py-4 text-base hover:bg-hermes-600 transition-colors shadow-md disabled:opacity-50"
          >
            {invio ? '⏳ Creazione workspace…' : 'Crea il mio workspace gratis →'}
          </button>

          <p className="text-center text-xs text-gray-400">
            Continuando accetti la{' '}
            <Link href="/privacy" className="text-hermes-500 underline">Privacy Policy</Link>.
            Dopo 14 giorni puoi scegliere un piano o smettere — senza obblighi.
          </p>
        </div>

        <p className="text-center text-hermes-200 text-xs">
          Hai già un workspace?{' '}
          <Link href="/" className="text-white underline font-semibold">Accedi →</Link>
        </p>
      </div>
    </div>
  )
}
