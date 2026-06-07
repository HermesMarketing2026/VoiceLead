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

const FAQ_LOGIN = [
  {
    q: 'Non ricordo il mio PIN. Cosa faccio?',
    a: 'Il PIN è stato creato dal tuo responsabile durante la configurazione. Chiedilo direttamente a lui — non è possibile recuperarlo dall\'app.',
  },
  {
    q: 'Il microfono non funziona. Cosa devo fare?',
    a: 'Assicurati di usare Chrome, Edge o Safari su iOS. Verifica che il browser abbia il permesso di accedere al microfono nelle impostazioni del dispositivo.',
  },
  {
    q: 'Posso usare VoiceLeads da più dispositivi contemporaneamente?',
    a: 'Sì. Puoi accedere da qualsiasi dispositivo con lo stesso PIN. Le sessioni sono indipendenti.',
  },
  {
    q: 'Cosa succede ai miei lead se il workspace viene sospeso?',
    a: 'I tuoi dati vengono conservati per 30 giorni dopo la scadenza. Il tuo responsabile può esportarli in CSV in qualsiasi momento prima della cancellazione.',
  },
]

export default function PinLogin({ titolo, sottotitolo, slug, onSuccess }: Props) {
  const [pin, setPin] = useState('')
  const [errore, setErrore] = useState<string | null>(null)
  const [caricamento, setCaricamento] = useState(false)
  const [faqAperta, setFaqAperta] = useState<number | null>(null)
  const [info, setInfo] = useState<WorkspaceInfo | null>(null)
  const [utenteSelezionato, setUtenteSelezionato] = useState<UtenteInfo | null>(null)
  const [schermata, setSchermata] = useState<'selezione' | 'pin'>('pin')

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
    } finally {
      setCaricamento(false)
    }
  }

  const selezionaUtente = (u: UtenteInfo) => {
    setUtenteSelezionato(u)
    setSchermata('pin')
    setPin('')
    setErrore(null)
  }

  const tornaASelezione = () => {
    setUtenteSelezionato(null)
    setSchermata('selezione')
    setPin('')
    setErrore(null)
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
      <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${urgente ? 'bg-red-500/10 border border-red-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
        <span className="text-xl shrink-0">{urgente ? '⚠️' : '⏳'}</span>
        <div>
          <p className={`text-xs font-bold ${urgente ? 'text-red-400' : 'text-amber-400'}`}>
            Prova gratuita — {giorniLeft === 0 ? 'scade oggi' : `${giorniLeft} ${giorniLeft === 1 ? 'giorno rimanente' : 'giorni rimanenti'}`}
          </p>
          <p className="text-xs text-white/40 mt-0.5">
            {urgente ? 'Abbonati per non perdere i tuoi lead →' : 'Stai usando il Piano Pro completo'}
          </p>
        </div>
      </div>
    )
  }

  // ── Schermata selezione utente ──
  if (schermata === 'selezione' && info && info.utenti.length > 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
        {/* Sfondo decorativo */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #ff7930, transparent)' }} />
          <div className="absolute inset-0 opacity-3" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative w-full max-w-sm space-y-4">
          <TrialBanner />

          <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)' }}>
            <div className="px-6 pt-8 pb-6 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,121,48,0.15), rgba(255,69,0,0.08))' }}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 rounded-full border border-white/5 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute w-56 h-56 rounded-full border border-white/5 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.8s' }} />
              </div>
              {logoUrl && (
                <div className="mb-3 relative z-10">
                  <img src={logoUrl} alt={info.nome_azienda} className="h-10 w-auto mx-auto object-contain brightness-0 invert opacity-80" />
                </div>
              )}
              <div className="relative z-10">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">{info.nome_azienda}</p>
                <h1 className="text-white text-2xl font-extrabold">Chi sei?</h1>
                <p className="text-white/40 text-sm mt-1">Scegli il tuo profilo</p>
              </div>
            </div>

            <div className="px-5 py-5 space-y-2.5">
              {info.utenti.map(u => (
                <button
                  key={u.id}
                  onClick={() => selezionaUtente(u)}
                  className="w-full flex items-center gap-4 rounded-2xl px-4 py-3.5 hover:bg-white/5 active:scale-95 transition-all text-left group"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)', color: 'white' }}>
                    {u.nome[0]}{u.cognome[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{u.nome} {u.cognome}</p>
                    <p className="text-xs text-white/30 capitalize">{u.ruolo}</p>
                  </div>
                  <span className="ml-auto text-white/20 text-lg group-hover:text-white/50 transition-colors">›</span>
                </button>
              ))}
              <button
                onClick={() => { setUtenteSelezionato(null); setSchermata('pin') }}
                className="w-full text-center text-xs text-white/25 hover:text-white/50 py-2 transition-colors"
              >
                Accedi come responsabile →
              </button>
            </div>
          </div>

          <FaqSection />
          <p className="text-center text-xs text-white/15">Hermes Marketing S.r.l.s</p>
        </div>
      </div>
    )
  }

  // ── Schermata PIN ──
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-8">
      {/* Sfondo decorativo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #ff7930, transparent)' }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative w-full max-w-sm space-y-4">
        <TrialBanner />

        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)' }}>
          {/* Header card */}
          <div className="px-6 pt-7 pb-5 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,121,48,0.12), rgba(255,69,0,0.06))' }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full border border-white/5 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute w-56 h-56 rounded-full border border-white/5 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.8s' }} />
              <div className="absolute w-80 h-80 rounded-full border border-white/5 animate-ping" style={{ animationDuration: '3s', animationDelay: '1.6s' }} />
            </div>

            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,121,48,0.15)', border: '1px solid rgba(255,121,48,0.25)' }}>
                {utenteSelezionato
                  ? <span className="text-xl font-extrabold text-white">{utenteSelezionato.nome[0]}{utenteSelezionato.cognome[0]}</span>
                  : logoUrl
                    ? <img src={logoUrl} alt="" className="h-8 w-auto object-contain brightness-0 invert opacity-80" />
                    : <span className="text-3xl">🎙️</span>
                }
              </div>
            </div>

            <div className="relative z-10">
              {utenteSelezionato ? (
                <>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-0.5">{info?.nome_azienda}</p>
                  <h1 className="text-white text-xl font-extrabold">Ciao, {utenteSelezionato.nome}! 👋</h1>
                  <p className="text-white/40 text-xs mt-1">Inserisci il tuo PIN personale</p>
                </>
              ) : info?.nome_referente ? (
                <>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-0.5">{info?.nome_azienda}</p>
                  <h1 className="text-white text-xl font-extrabold">Ciao, {info.nome_referente}! 👋</h1>
                  <p className="text-white/40 text-xs mt-1">Pronto a registrare nuovi contatti?</p>
                </>
              ) : (
                <>
                  <h1 className="text-white text-2xl font-extrabold">VoiceLeads</h1>
                  <p className="text-white/40 text-sm mt-0.5">Inserisci il PIN per accedere</p>
                </>
              )}
            </div>
          </div>

          {/* PIN area */}
          <div className="px-5 pt-5 pb-6">
            <div className="flex justify-center gap-3 mb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                  i < pin.length
                    ? 'scale-110'
                    : 'bg-white/5 border-white/15'
                }`}
                  style={i < pin.length ? { background: 'linear-gradient(135deg, #ff7930, #ff4500)', borderColor: '#ff7930' } : {}} />
              ))}
            </div>

            {errore && (
              <p className="text-sm text-red-400 text-center mb-3 animate-pulse">{errore}</p>
            )}

            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {tasti.map((t, i) => (
                t === '' ? <div key={i} /> :
                t === '⌫' ? (
                  <button key={i} onClick={cancella}
                    className="h-14 rounded-xl text-white/50 text-xl font-medium hover:bg-white/5 active:scale-95 transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    ⌫
                  </button>
                ) : (
                  <button key={i} onClick={() => digita(t)}
                    className="h-14 rounded-xl text-white text-xl font-semibold hover:bg-white/8 active:scale-95 transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
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
                className="w-full text-center text-xs text-white/25 hover:text-white/50 mt-3 transition-colors">
                ← Cambia utente
              </button>
            )}
          </div>
        </div>

        {/* Messaggi di conferma */}
        <ConfirmMessages />

        {/* Come funziona */}
        <ComeFunziona />

        {/* FAQ */}
        <FaqSection />

        <p className="text-center text-xs text-white/15">Hermes Marketing S.r.l.s</p>
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
        <div key={label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xl mb-1">{icon}</p>
          <p className="text-xs text-white/35 leading-snug">{label}</p>
        </div>
      ))}
    </div>
  )
}

function ComeFunziona() {
  const [aperta, setAperta] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
      <button onClick={() => setAperta(a => !a)}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-white/60 hover:text-white/80 transition-colors">
        <span className="flex items-center gap-2"><span>💡</span> Come funziona VoiceLeads?</span>
        <span className="text-white/30 text-lg transition-transform duration-200" style={{ transform: aperta ? 'rotate(45deg)' : 'rotate(0deg)' }}>+</span>
      </button>
      {aperta && (
        <div className="px-5 pb-5 space-y-3 border-t border-white/5 pt-4">
          {[
            { icon: '🎙️', titolo: 'Ditta il lead', testo: 'Premi il microfono e parla liberamente dopo un appuntamento. Puoi anche scattare la foto di un biglietto da visita.' },
            { icon: '🤖', titolo: "L'AI estrae i dati", testo: 'Nome, cognome, azienda, email e telefono vengono rilevati automaticamente dal testo dettato o dall\'immagine.' },
            { icon: '✏️', titolo: 'Correggi e salva', testo: 'Verifica i campi estratti — puoi correggerli prima di salvare definitivamente il lead.' },
            { icon: '📥', titolo: 'Esporta in CSV', testo: 'Un click → file CSV pronto. Importabile su Excel, Google Sheets, o qualsiasi CRM.' },
          ].map(({ icon, titolo, testo }) => (
            <div key={titolo} className="flex gap-3">
              <span className="text-xl shrink-0">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-white/80">{titolo}</p>
                <p className="text-xs text-white/35 mt-0.5 leading-relaxed">{testo}</p>
              </div>
            </div>
          ))}
          <div className="rounded-xl px-3 py-2 text-xs mt-2" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <span className="text-amber-400">⚠️ La dettatura funziona su </span>
            <strong className="text-amber-300">Chrome</strong><span className="text-amber-400">, </span>
            <strong className="text-amber-300">Edge</strong><span className="text-amber-400"> e </span>
            <strong className="text-amber-300">Safari iOS</strong><span className="text-amber-400">.</span>
          </div>
        </div>
      )}
    </div>
  )
}

const FAQ_ITEMS = [
  {
    q: 'Non ricordo il PIN. Come faccio?',
    a: 'Il PIN è stato impostato dal tuo responsabile. Contattalo direttamente — non è recuperabile dall\'app per motivi di sicurezza.',
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
    a: 'I dati vengono conservati per 30 giorni dopo la scadenza. Puoi esportarli in CSV in qualsiasi momento durante questo periodo.',
  },
]

function FaqSection() {
  const [aperta, setAperta] = useState<number | null>(null)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="px-5 py-4 border-b border-white/5">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Domande frequenti</p>
      </div>
      <div className="divide-y divide-white/5">
        {FAQ_ITEMS.map(({ q, a }, i) => (
          <div key={i}>
            <button
              onClick={() => setAperta(aperta === i ? null : i)}
              className="w-full flex items-start justify-between px-5 py-3.5 text-left gap-3 hover:bg-white/3 transition-colors"
            >
              <p className="text-sm text-white/60 font-medium leading-snug">{q}</p>
              <span className="text-white/20 text-base shrink-0 mt-0.5 transition-transform duration-150" style={{ transform: aperta === i ? 'rotate(45deg)' : 'none' }}>+</span>
            </button>
            {aperta === i && (
              <div className="px-5 pb-4">
                <p className="text-xs text-white/35 leading-relaxed">{a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
