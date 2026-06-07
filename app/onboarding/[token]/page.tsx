'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'

type Fase = 'caricamento' | 'form' | 'animazione' | 'errore'

interface Commerciale {
  nome: string
  cognome: string
  pin: string
  pinConferma: string
}

const SETTORI = [
  'Manifatturiero', 'Commercio', 'Servizi', 'Edilizia', 'Tecnologia',
  'Sanità', 'Trasporti', 'Agroalimentare', 'Finanza', 'Altro',
]

const STEPS_ANIMAZIONE = [
  'Inizializziamo il tuo workspace...',
  'Configuriamo i tuoi commerciali...',
  'Prepariamo l\'export CSV dei lead...',
  'Stiamo sistemando gli ultimi dettagli...',
  'Il tuo workspace è quasi pronto!',
]

export default function OnboardingPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  const [fase, setFase] = useState<Fase>('caricamento')
  const [errore, setErrore] = useState<string | null>(null)
  const [piano, setPiano] = useState<'registra' | 'registra_gestisci'>('registra')
  const [maxCommerciali, setMaxCommerciali] = useState(1)

  // Form fields
  const [nomeAzienda, setNomeAzienda] = useState('')
  const [nomeReferente, setNomeReferente] = useState('')
  const [cognomeReferente, setCognomeReferente] = useState('')
  const [pinReferente, setPinReferente] = useState('')
  const [pinReferenteConferma, setPinReferenteConferma] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [fatturato, setFatturato] = useState('')
  const [numDipendenti, setNumDipendenti] = useState('')
  const [settore, setSettore] = useState('')
  const [commerciali, setCommerciali] = useState<Commerciale[]>([])
  const [invio, setInvio] = useState(false)
  const [erroreForm, setErroreForm] = useState<string | null>(null)

  // Animazione
  const [stepAnimazione, setStepAnimazione] = useState(0)
  const [slugCreato, setSlugCreato] = useState<string | null>(null)

  useEffect(() => {
    verificaToken()
  }, [token])

  const verificaToken = async () => {
    try {
      const res = await fetch(`/api/onboarding?token=${token}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPiano(data.piano)
      setMaxCommerciali(data.max_commerciali)
      setCommerciali(
        Array.from({ length: data.max_commerciali }, () => ({ nome: '', cognome: '', pin: '', pinConferma: '' }))
      )
      setFase('form')
    } catch (e: any) {
      setErrore(e.message)
      setFase('errore')
    }
  }

  const aggiornaCommerciale = (i: number, campo: keyof Commerciale, valore: string) => {
    setCommerciali(prev => prev.map((c, idx) => idx === i ? { ...c, [campo]: valore } : c))
  }

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const validaForm = () => {
    if (!nomeAzienda.trim()) return 'Inserisci il nome della tua azienda'
    if (!nomeReferente.trim() || !cognomeReferente.trim()) return 'Inserisci nome e cognome del responsabile'
    if (!/^\d{6}$/.test(pinReferente)) return 'Il PIN del responsabile deve essere di 6 cifre'
    if (pinReferente !== pinReferenteConferma) return 'I PIN del responsabile non coincidono'
    for (let i = 0; i < commerciali.length; i++) {
      const c = commerciali[i]
      if (!c.nome.trim() || !c.cognome.trim()) return `Inserisci nome e cognome del commerciale ${i + 1}`
      if (!/^\d{6}$/.test(c.pin)) return `Il PIN del commerciale ${i + 1} deve essere di 6 cifre`
      if (c.pin !== c.pinConferma) return `I PIN del commerciale ${i + 1} non coincidono`
    }
    return null
  }

  const avviaAnimazione = async (slug: string) => {
    setSlugCreato(slug)
    setFase('animazione')
    for (let i = 0; i < STEPS_ANIMAZIONE.length; i++) {
      await new Promise(r => setTimeout(r, 1800))
      setStepAnimazione(i + 1)
    }
    await new Promise(r => setTimeout(r, 800))
    window.location.href = `https://${slug}.voiceleads.it`
  }

  const invia = async () => {
    const err = validaForm()
    if (err) { setErroreForm(err); return }
    setErroreForm(null)
    setInvio(true)

    try {
      // Upload logo se presente (base64 → salviamo come data URL per semplicità,
      // in produzione si può uploadare su Supabase Storage)
      const logoUrl = logoPreview || null

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          nome_azienda: nomeAzienda,
          nome_referente: nomeReferente,
          cognome_referente: cognomeReferente,
          pin_referente: pinReferente,
          logo_url: logoUrl,
          fatturato,
          num_dipendenti: numDipendenti,
          settore,
          commerciali: commerciali.map(c => ({ nome: c.nome, cognome: c.cognome, pin: c.pin })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      avviaAnimazione(data.slug)
    } catch (e: any) {
      setErroreForm(e.message)
      setInvio(false)
    }
  }

  // --- RENDER ---

  if (fase === 'caricamento') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-hermes-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Verifica in corso...</p>
        </div>
      </div>
    )
  }

  if (fase === 'errore') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm border border-gray-200">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Link non valido</h2>
          <p className="text-gray-500 text-sm">{errore}</p>
        </div>
      </div>
    )
  }

  if (fase === 'animazione') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <style>{`
          @keyframes flap {
            0%   { transform: translateY(0px) scaleY(1); }
            15%  { transform: translateY(-10px) scaleY(0.85); }
            30%  { transform: translateY(-18px) scaleY(1); }
            45%  { transform: translateY(-10px) scaleY(0.88); }
            60%  { transform: translateY(-20px) scaleY(1); }
            75%  { transform: translateY(-12px) scaleY(0.9); }
            90%  { transform: translateY(-6px) scaleY(1); }
            100% { transform: translateY(0px) scaleY(1); }
          }
          @keyframes glow-pulse {
            0%, 100% { opacity: 0.15; transform: scale(1); }
            50%       { opacity: 0.35; transform: scale(1.2); }
          }
          .hermes-flap { animation: flap 1.4s ease-in-out infinite; transform-origin: center bottom; }
          .hermes-glow { animation: glow-pulse 1.4s ease-in-out infinite; }
        `}</style>

        <div className="text-center max-w-sm w-full">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="hermes-glow absolute inset-0 rounded-full blur-2xl" style={{ background: 'radial-gradient(circle, #ff7930, transparent)' }} />
            <div className="hermes-flap relative w-full h-full">
              <Image src="/favicon.png" alt="Hermes" fill className="object-contain drop-shadow-lg" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Stiamo creando il tuo workspace</h2>
          <p className="text-gray-400 text-sm mb-8">L'AI di Hermes sta configurando tutto per te...</p>

          <div className="space-y-3 text-left bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            {STEPS_ANIMAZIONE.map((step, i) => (
              <div key={i} className={`flex items-center gap-3 transition-all duration-700 ${i < stepAnimazione ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${i < stepAnimazione ? 'scale-110' : 'bg-gray-100'}`}
                  style={i < stepAnimazione ? { background: 'linear-gradient(135deg, #ff7930, #ff4500)' } : {}}>
                  {i < stepAnimazione ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                  )}
                </div>
                <span className={`text-sm transition-colors duration-500 ${i < stepAnimazione ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{step}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${(stepAnimazione / STEPS_ANIMAZIONE.length) * 100}%`, background: 'linear-gradient(90deg, #ff7930, #ff4500)' }} />
          </div>
        </div>
      </div>
    )
  }

  // --- FORM ---
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <Image src="/favicon.png" alt="Hermes" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configura il tuo workspace</h1>
          <p className="text-gray-400 text-sm mt-1">
            Piano: <span className="font-semibold text-hermes-500">
              {piano === 'registra_gestisci' ? 'Registra + Gestisci' : 'Registra'}
            </span>
          </p>
        </div>

        <div className="space-y-5">
          {/* Azienda */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">La tua azienda</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome azienda *</label>
                <input
                  type="text"
                  value={nomeAzienda}
                  onChange={e => setNomeAzienda(e.target.value)}
                  placeholder="es. Acme Srl"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Settore</label>
                  <select
                    value={settore}
                    onChange={e => setSettore(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  >
                    <option value="">Seleziona...</option>
                    {SETTORI.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N° dipendenti</label>
                  <select
                    value={numDipendenti}
                    onChange={e => setNumDipendenti(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  >
                    <option value="">Seleziona...</option>
                    {['1-5', '6-15', '16-50', '51-200', '200+'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fatturato annuo</label>
                <select
                  value={fatturato}
                  onChange={e => setFatturato(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                >
                  <option value="">Seleziona...</option>
                  {['< 500k', '500k – 1M', '1M – 5M', '5M – 20M', '> 20M'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo aziendale (opzionale)</label>
                <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-xl px-4 py-4 cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo" className="w-10 h-10 object-contain rounded flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-700">{logoPreview ? 'Cambia logo' : 'Carica il tuo logo'}</span>
                    {!logoPreview && <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, SVG</p>}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                </label>
              </div>
            </div>
          </div>

          {/* Responsabile */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Responsabile del workspace</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={nomeReferente}
                  onChange={e => setNomeReferente(e.target.value)}
                  placeholder="Mario"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                <input
                  type="text"
                  value={cognomeReferente}
                  onChange={e => setCognomeReferente(e.target.value)}
                  placeholder="Rossi"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN accesso (6 cifre) *</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinReferente}
                  onChange={e => setPinReferente(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conferma PIN *</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={pinReferenteConferma}
                  onChange={e => setPinReferenteConferma(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                    pinReferenteConferma && pinReferente !== pinReferenteConferma ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Commerciali */}
          {commerciali.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-1">
                {commerciali.length === 1 ? 'Il tuo commerciale' : `I tuoi ${commerciali.length} commerciali`}
              </h3>
              <p className="text-xs text-gray-400 mb-4">Ogni commerciale avrà un PIN di 6 cifre per accedere</p>
              <div className="space-y-5">
                {commerciali.map((c, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-orange-500 uppercase mb-3">Commerciale {i + 1}</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
                        <input
                          type="text"
                          value={c.nome}
                          onChange={e => aggiornaCommerciale(i, 'nome', e.target.value)}
                          placeholder="Nome"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Cognome</label>
                        <input
                          type="text"
                          value={c.cognome}
                          onChange={e => aggiornaCommerciale(i, 'cognome', e.target.value)}
                          placeholder="Cognome"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">PIN (6 cifre)</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={6}
                          value={c.pin}
                          onChange={e => aggiornaCommerciale(i, 'pin', e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Conferma PIN</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={6}
                          value={c.pinConferma}
                          onChange={e => aggiornaCommerciale(i, 'pinConferma', e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                            c.pinConferma && c.pin !== c.pinConferma ? 'border-red-300' : 'border-gray-200'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {erroreForm && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              ⚠️ {erroreForm}
            </div>
          )}

          <button
            onClick={invia}
            disabled={invio}
            className="w-full text-white font-bold rounded-2xl py-4 text-base transition-all shadow-md disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}
          >
            {invio ? 'Creazione in corso...' : 'Crea il mio workspace →'}
          </button>

          <p className="text-center text-xs text-gray-400 pb-4">
            Cliccando "Crea il mio workspace" accetti i{' '}
            <a href="/privacy" className="underline text-hermes-500">termini di utilizzo</a>
          </p>
        </div>
      </div>
    </div>
  )
}
