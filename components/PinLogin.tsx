'use client'
import { useState, useEffect } from 'react'

interface UtenteInfo {
  id: string
  nome: string
  cognome: string
  ruolo: string
}

interface Props {
  titolo: string
  sottotitolo?: string
  nomeAzienda?: string
  logoUrl?: string
  slug?: string
  onSuccess: (pin: string, utenteId?: string) => Promise<void>
}

interface WorkspaceInfo {
  nome_azienda: string
  nome_referente?: string
  cognome_referente?: string
  logo_url?: string
  fatturazione?: string | null
  scadenza_il?: string | null
  utenti: UtenteInfo[]
}

function giorniRimanenti(scadenza_il: string): number {
  const diff = new Date(scadenza_il).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function PinLogin({ titolo, sottotitolo, slug, onSuccess }: Props) {
  const [pin, setPin] = useState('')
  const [errore, setErrore] = useState<string | null>(null)
  const [caricamento, setCaricamento] = useState(false)
  const [info, setInfo] = useState<WorkspaceInfo | null>(null)
  const [utenteSelezionato, setUtenteSelezionato] = useState<UtenteInfo | null>(null)
  const [schermata, setSchermata] = useState<'selezione' | 'pin' | 'reset'>('pin')
  const [resetInvio, setResetInvio] = useState(false)
  const [resetEsito, setResetEsito] = useState<string | null>(null)
  const [tentativiErrati, setTentativiErrati] = useState(0)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/workspace-info?slug=${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setInfo(data)
          if (data.utenti?.length > 0) setSchermata('selezione')
        }
      })
      .catch(() => {})
  }, [slug])

  const digita = (cifra: string) => {
    if (pin.length < 6) setPin(p => p + cifra)
  }
  const cancella = () => setPin(p => p.slice(0, -1))

  const conferma = async () => {
    if (pin.length !== 6) return
    setCaricamento(true)
    setErrore(null)
    try {
      await onSuccess(pin, utenteSelezionato?.id)
    } catch (e: any) {
      setErrore(e.message || 'PIN non corretto')
      setPin('')
      setTentativiErrati(t => {
        const nuovi = t + 1
        if (nuovi >= 3) setSchermata('reset')
        return nuovi
      })
    } finally {
      setCaricamento(false)
    }
  }

  const selezionaUtente = (u: UtenteInfo) => {
    setUtenteSelezionato(u)
    setSchermata('pin')
    setPin('')
    setTentativiErrati(0)
    setErrore(null)
  }

  const tornaASelezione = () => {
    setUtenteSelezionato(null)
    setSchermata('selezione')
    setPin('')
    setErrore(null)
  }

  const richiestaReset = async () => {
    setResetInvio(true)
    setResetEsito(null)
    try {
      const res = await fetch('/api/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, utente_id: utenteSelezionato?.id ?? null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResetEsito('✅ Email inviata! Controlla la casella del responsabile.')
    } catch (e: any) {
      setResetEsito(`❌ ${e.message}`)
    } finally {
      setResetInvio(false)
    }
  }

  useEffect(() => {
    if (schermata !== 'pin') return
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') digita(e.key)
      else if (e.key === 'Backspace') cancella()
      else if (e.key === 'Enter') conferma()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [schermata, pin, caricamento])

  const tasti = ['1','2','3','4','5','6','7','8','9','','0','⌫']
  const logoUrl = info?.logo_url
  const isTrial = info?.fatturazione === 'prova' && info?.scadenza_il
  const giorniLeft = isTrial ? giorniRimanenti(info!.scadenza_il!) : null

  const TrialBanner = () => {
    if (!isTrial || giorniLeft === null) return null
    const urgente = giorniLeft <= 3
    return (
      <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 border ${urgente ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
        <span className="text-xl shrink-0">{urgente ? '⚠️' : '⏳'}</span>
        <div>
          <p className={`text-xs font-bold ${urgente ? 'text-red-600' : 'text-amber-700'}`}>
            Prova gratuita — {giorniLeft === 0 ? 'scade oggi' : `${giorniLeft} ${giorniLeft === 1 ? 'giorno rimanente' : 'giorni rimanenti'}`}
          </p>
          <p className={`text-xs mt-0.5 ${urgente ? 'text-red-500' : 'text-amber-600'}`}>
            {urgente ? 'Abbonati per non perdere i tuoi lead →' : 'Stai usando il Piano Pro completo'}
          </p>
        </div>
      </div>
    )
  }

  // ── Schermata selezione utente ──
  if (schermata === 'selezione' && info && info.utenti.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-4">
          <TrialBanner />

          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200">
            <div className="px-6 pt-7 pb-5 text-center border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #fff7f0, #fff3eb)' }}>
              {logoUrl && (
                <img src={logoUrl} alt={info.nome_azienda} className="h-10 w-auto mx-auto object-contain mb-3" />
              )}
              {!logoUrl && (
                <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>
                  <span className="text-2xl">🎙️</span>
                </div>
              )}
              <p className="text-xs font-bold text-hermes-500 uppercase tracking-widest mb-1">{info.nome_azienda}</p>
              <h1 className="text-gray-900 text-xl font-extrabold">Chi sei?</h1>
              <p className="text-gray-400 text-sm mt-1">Scegli il tuo profilo</p>
            </div>

            <div className="px-5 py-5 space-y-2">
              {info.utenti.map(u => (
                <button
                  key={u.id}
                  onClick={() => selezionaUtente(u)}
                  className="w-full flex items-center gap-4 rounded-2xl px-4 py-3.5 hover:bg-gray-50 active:scale-95 transition-all text-left group border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 text-white"
                    style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>
                    {u.nome[0]}{u.cognome[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{u.nome} {u.cognome}</p>
                    <p className="text-xs text-gray-400 capitalize">{u.ruolo}</p>
                  </div>
                  <span className="ml-auto text-gray-300 text-lg group-hover:text-hermes-400 transition-colors">›</span>
                </button>
              ))}
              <button
                onClick={() => { setUtenteSelezionato(null); setSchermata('pin') }}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-2 transition-colors"
              >
                Accedi come responsabile →
              </button>
            </div>
          </div>

          <FaqSection />
          <p className="text-center text-xs text-gray-300">Hermes Marketing S.r.l.s</p>
        </div>
      </div>
    )
  }

  // ── Schermata PIN ──
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4">
        <TrialBanner />

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200">
          {/* Header card */}
          <div className="px-6 pt-7 pb-5 text-center border-b border-gray-100" style={{ background: 'linear-gradient(135deg, #fff7f0, #fff3eb)' }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>
              {utenteSelezionato
                ? <span className="text-xl font-extrabold text-white">{utenteSelezionato.nome[0]}{utenteSelezionato.cognome[0]}</span>
                : logoUrl
                  ? <img src={logoUrl} alt="" className="h-8 w-auto object-contain" />
                  : <span className="text-3xl">🎙️</span>
              }
            </div>

            {utenteSelezionato ? (
              <>
                <p className="text-xs font-bold text-hermes-500 uppercase tracking-widest mb-0.5">{info?.nome_azienda}</p>
                <h1 className="text-gray-900 text-xl font-extrabold">Ciao, {utenteSelezionato.nome}! 👋</h1>
                <p className="text-gray-400 text-xs mt-1">Inserisci il tuo PIN personale</p>
              </>
            ) : info?.nome_referente ? (
              <>
                <p className="text-xs font-bold text-hermes-500 uppercase tracking-widest mb-0.5">{info?.nome_azienda}</p>
                <h1 className="text-gray-900 text-xl font-extrabold">Ciao, {info.nome_referente}! 👋</h1>
                <p className="text-gray-400 text-xs mt-1">Pronto a registrare nuovi contatti?</p>
              </>
            ) : (
              <>
                <h1 className="text-gray-900 text-2xl font-extrabold">VoiceLeads</h1>
                <p className="text-gray-400 text-sm mt-0.5">Inserisci il PIN per accedere</p>
              </>
            )}
          </div>

          {/* PIN area */}
          <div className="px-5 pt-5 pb-6">
            <div className="flex justify-center gap-3 mb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                  i < pin.length ? 'scale-110 border-hermes-500' : 'bg-gray-100 border-gray-200'
                }`}
                  style={i < pin.length ? { background: 'linear-gradient(135deg, #ff7930, #ff4500)' } : {}} />
              ))}
            </div>

            {errore && (
              <p className="text-sm text-red-500 text-center mb-3">{errore}</p>
            )}

            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {tasti.map((t, i) => (
                t === '' ? <div key={i} /> :
                t === '⌫' ? (
                  <button key={i} onClick={cancella}
                    className="h-14 rounded-xl text-gray-400 text-xl font-medium hover:bg-gray-50 active:scale-95 transition-all border border-gray-100">
                    ⌫
                  </button>
                ) : (
                  <button key={i} onClick={() => digita(t)}
                    className="h-14 rounded-xl text-gray-900 text-xl font-semibold bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all border border-gray-100">
                    {t}
                  </button>
                )
              ))}
            </div>

            <button onClick={conferma} disabled={pin.length !== 6 || caricamento}
              className="w-full rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-30 transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>
              {caricamento ? 'Verifica…' : 'Accedi →'}
            </button>

            {info && info.utenti.length > 0 && (
              <button onClick={tornaASelezione}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors">
                ← Cambia utente
              </button>
            )}

            {schermata !== 'reset' ? (
              <button
                onClick={() => { setSchermata('reset'); setResetEsito(null) }}
                className="w-full text-center text-xs text-gray-300 hover:text-hermes-400 mt-2 transition-colors"
              >
                PIN dimenticato?
              </button>
            ) : (
              <div className="mt-3 rounded-xl bg-hermes-50 border border-hermes-200 p-4 space-y-3">
                <p className="text-sm font-semibold text-hermes-700">Reimposta PIN</p>
                <p className="text-xs text-hermes-600">
                  {utenteSelezionato
                    ? `Invieremo un link al responsabile per reimpostare il PIN di ${utenteSelezionato.nome}.`
                    : 'Invieremo un link di reset all\'email del responsabile del workspace.'}
                </p>
                {resetEsito ? (
                  <p className="text-xs font-medium text-gray-700">{resetEsito}</p>
                ) : (
                  <button
                    onClick={richiestaReset}
                    disabled={resetInvio}
                    className="w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-50 transition-all"
                    style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}
                  >
                    {resetInvio ? 'Invio in corso…' : 'Invia email di reset →'}
                  </button>
                )}
                <button
                  onClick={() => setSchermata('pin')}
                  className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Torna al login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messaggi di conferma */}
        <ConfirmMessages />

        {/* Come funziona */}
        <ComeFunziona />

        {/* FAQ */}
        <FaqSection />

        <p className="text-center text-xs text-gray-300">Hermes Marketing S.r.l.s</p>
      </div>
    </div>
  )
}

function ConfirmMessages() {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {[
        { icon: '🔒', label: 'Accesso protetto da PIN individuale' },
        { icon: '🤖', label: 'AI sempre pronta a catturare i lead' },
        { icon: '📥', label: 'Export CSV in un click quando vuoi' },
      ].map(({ icon, label }) => (
        <div key={label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
          <p className="text-xl mb-1">{icon}</p>
          <p className="text-xs text-gray-400 leading-snug">{label}</p>
        </div>
      ))}
    </div>
  )
}

function ComeFunziona() {
  const [aperta, setAperta] = useState(false)
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <button onClick={() => setAperta(a => !a)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
        <span className="flex items-center gap-2"><span>💡</span> Come funziona VoiceLeads?</span>
        <span className="text-gray-300 text-lg transition-transform duration-200" style={{ transform: aperta ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
      </button>
      {aperta && (
        <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
          {[
            { icon: '🎙️', titolo: 'Ditta il lead', testo: 'Premi il microfono e parla liberamente dopo un appuntamento. Puoi anche scattare la foto di un biglietto da visita.' },
            { icon: '🤖', titolo: "L'AI estrae i dati", testo: 'Nome, cognome, azienda, email e telefono vengono rilevati automaticamente dal testo dettato o dall\'immagine.' },
            { icon: '✏️', titolo: 'Correggi e salva', testo: 'Verifica i campi estratti — puoi correggerli prima di salvare definitivamente il lead.' },
            { icon: '📥', titolo: 'Esporta in CSV', testo: 'Un click → file CSV pronto. Importabile su Excel, Google Sheets, o qualsiasi CRM.' },
          ].map(({ icon, titolo, testo }) => (
            <div key={titolo} className="flex gap-3">
              <span className="text-xl shrink-0">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{titolo}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{testo}</p>
              </div>
            </div>
          ))}
          <div className="rounded-xl px-3 py-2 text-xs mt-2 bg-amber-50 border border-amber-200">
            <span className="text-amber-700">⚠️ La dettatura funziona su </span>
            <strong className="text-amber-800">Chrome</strong><span className="text-amber-700">, </span>
            <strong className="text-amber-800">Edge</strong><span className="text-amber-700"> e </span>
            <strong className="text-amber-800">Safari iOS</strong><span className="text-amber-700">.</span>
          </div>
        </div>
      )}
    </div>
  )
}

const FAQ_ITEMS = [
  {
    q: 'Non ricordo il PIN. Come faccio?',
    a: 'Clicca su "PIN dimenticato?" nella schermata di login. Verrà inviata un\'email al responsabile del workspace con un link per reimpostare il PIN.',
  },
  {
    q: 'Il microfono non parte. Cosa devo fare?',
    a: 'Usa Chrome, Edge o Safari iOS. Verifica che il browser abbia il permesso al microfono nelle impostazioni del dispositivo.',
  },
  {
    q: 'Posso usare VoiceLeads da più dispositivi?',
    a: 'Sì, da qualsiasi dispositivo con lo stesso PIN. Ogni sessione è indipendente e le tue registrazioni sono sincronizzate.',
  },
  {
    q: 'Cosa succede ai lead se l\'abbonamento scade?',
    a: 'I dati vengono conservati per 60 giorni dopo la scadenza. Puoi esportarli in CSV in qualsiasi momento durante questo periodo.',
  },
]

function FaqSection() {
  const [aperta, setAperta] = useState<number | null>(null)
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Domande frequenti</p>
      </div>
      <div className="divide-y divide-gray-100">
        {FAQ_ITEMS.map(({ q, a }, i) => (
          <div key={i}>
            <button
              onClick={() => setAperta(aperta === i ? null : i)}
              className="w-full flex items-start justify-between px-5 py-3.5 text-left gap-3 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm text-gray-700 font-medium leading-snug">{q}</p>
              <span className="text-gray-300 text-base shrink-0 mt-0.5 transition-transform duration-150" style={{ transform: aperta === i ? 'rotate(45deg)' : 'none' }}>+</span>
            </button>
            {aperta === i && (
              <div className="px-5 pb-4">
                <p className="text-xs text-gray-500 leading-relaxed">{a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
