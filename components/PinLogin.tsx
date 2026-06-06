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
  utenti: UtenteInfo[]
}

export default function PinLogin({ titolo, sottotitolo, slug, onSuccess }: Props) {
  const [pin, setPin] = useState('')
  const [errore, setErrore] = useState<string | null>(null)
  const [caricamento, setCaricamento] = useState(false)
  const [mostraGuida, setMostraGuida] = useState(false)
  const [info, setInfo] = useState<WorkspaceInfo | null>(null)
  const [utenteSelezionato, setUtenteSelezionato] = useState<UtenteInfo | null>(null)
  // 'selezione' = schermata scelta utente, 'pin' = inserimento PIN
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

  const tasti = ['1','2','3','4','5','6','7','8','9','','0','⌫']
  const logoUrl = info?.logo_url

  // ── Schermata selezione utente ─────────────────────────
  if (schermata === 'selezione' && info && info.utenti.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-hermes-500 to-hermes-700 px-6 pt-8 pb-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute w-48 h-48 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
              </div>
              {logoUrl && (
                <div className="mb-3 relative z-10">
                  <img src={logoUrl} alt={info.nome_azienda} className="h-10 w-auto mx-auto object-contain brightness-0 invert opacity-90" />
                </div>
              )}
              <div className="relative z-10">
                <h1 className="text-white text-xl font-bold">Chi sei?</h1>
                <p className="text-white/70 text-sm mt-1">{info.nome_azienda}</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-3">
              {info.utenti.map(u => (
                <button
                  key={u.id}
                  onClick={() => selezionaUtente(u)}
                  className="w-full flex items-center gap-4 rounded-2xl border-2 border-gray-200 px-4 py-3.5 hover:border-hermes-400 hover:bg-hermes-50 active:scale-95 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-hermes-100 flex items-center justify-center text-hermes-600 font-bold text-base shrink-0">
                    {u.nome[0]}{u.cognome[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{u.nome} {u.cognome}</p>
                    <p className="text-xs text-gray-400 capitalize">{u.ruolo}</p>
                  </div>
                  <span className="ml-auto text-gray-300 text-lg">›</span>
                </button>
              ))}

              {/* Accesso admin con PIN workspace */}
              <button
                onClick={() => { setUtenteSelezionato(null); setSchermata('pin') }}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-2 transition-colors"
              >
                Accedi come responsabile →
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-300">Hermes Marketing — Web &amp; Comunicazione</p>
        </div>
      </div>
    )
  }

  // ── Schermata PIN ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-hermes-500 to-hermes-700 px-6 pt-8 pb-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute w-48 h-48 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
              <div className="absolute w-64 h-64 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
            </div>

            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center animate-pulse">
                  {utenteSelezionato
                    ? <span className="text-2xl font-bold text-white">{utenteSelezionato.nome[0]}{utenteSelezionato.cognome[0]}</span>
                    : <span className="text-4xl">🎙️</span>
                  }
                </div>
              </div>
            </div>

            {logoUrl && !utenteSelezionato && (
              <div className="mb-3">
                <img src={logoUrl} alt={info?.nome_azienda} className="h-10 w-auto mx-auto object-contain brightness-0 invert opacity-90" />
              </div>
            )}

            <div className="relative z-10">
              {utenteSelezionato ? (
                <>
                  <p className="text-white/80 text-sm mb-1">Ciao {utenteSelezionato.nome}! 👋</p>
                  <h1 className="text-white text-xl font-bold leading-snug">
                    Inserisci il tuo PIN
                  </h1>
                  {info?.nome_azienda && (
                    <p className="text-white/60 text-xs mt-2">{info.nome_azienda}</p>
                  )}
                </>
              ) : info?.nome_referente ? (
                <>
                  <p className="text-white/80 text-sm mb-1">Ciao {info.nome_referente}! 👋</p>
                  <h1 className="text-white text-xl font-bold leading-snug">
                    Pronto a registrare<br />i tuoi nuovi contatti?
                  </h1>
                  {info?.nome_azienda && <p className="text-white/60 text-xs mt-2">{info.nome_azienda}</p>}
                </>
              ) : (
                <>
                  <h1 className="text-white text-2xl font-bold">VoiceLeads</h1>
                  <p className="text-white/70 text-sm mt-1">by Hermes Marketing</p>
                </>
              )}
            </div>
          </div>

          <div className="px-6 pt-5 pb-6">
            <p className="text-center text-sm text-gray-500 mb-4">Inserisci il tuo PIN a 6 cifre</p>

            <div className="flex justify-center gap-3 mb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                  i < pin.length ? 'bg-hermes-500 border-hermes-500 scale-110' : 'bg-white border-gray-300'
                }`} />
              ))}
            </div>

            {errore && (
              <p className="text-sm text-red-500 text-center mb-3 animate-pulse">{errore}</p>
            )}

            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {tasti.map((t, i) => (
                t === '' ? <div key={i} /> :
                t === '⌫' ? (
                  <button key={i} onClick={cancella}
                    className="h-14 rounded-xl bg-gray-100 text-gray-500 text-xl font-medium hover:bg-gray-200 active:scale-95 transition-all">
                    ⌫
                  </button>
                ) : (
                  <button key={i} onClick={() => digita(t)}
                    className="h-14 rounded-xl bg-gray-100 text-gray-900 text-xl font-semibold hover:bg-hermes-50 hover:text-hermes-600 active:scale-95 transition-all">
                    {t}
                  </button>
                )
              ))}
            </div>

            <button onClick={conferma} disabled={pin.length !== 6 || caricamento}
              className="w-full rounded-xl bg-hermes-500 py-3.5 text-sm font-semibold text-white hover:bg-hermes-600 disabled:opacity-40 transition-all shadow-sm">
              {caricamento ? 'Verifica in corso…' : 'Accedi'}
            </button>

            {/* Torna alla selezione se workspace ha utenti */}
            {info && info.utenti.length > 0 && (
              <button onClick={tornaASelezione}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors">
                ← Cambia utente
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <button onClick={() => setMostraGuida(g => !g)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <span className="flex items-center gap-2"><span>💡</span> Come funziona VoiceLeads?</span>
            <span className="text-gray-400 text-lg">{mostraGuida ? '−' : '+'}</span>
          </button>
          {mostraGuida && (
            <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
              {[
                { icon: '🎙️', titolo: 'Ditta il lead', testo: 'Premi il microfono e parla liberamente dopo un appuntamento.' },
                { icon: '🤖', titolo: "L'AI estrae i dati", testo: 'Nome, cognome, azienda, email e telefono vengono rilevati automaticamente.' },
                { icon: '✏️', titolo: 'Correggi e salva', testo: 'Verifica i campi e salva con un tap.' },
                { icon: '📤', titolo: 'Esporta su Sheets', testo: 'Tutti i lead pronti finiscono sul tuo Google Sheet.' },
              ].map(({ icon, titolo, testo }) => (
                <div key={titolo} className="flex gap-3">
                  <span className="text-xl shrink-0">{icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{titolo}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{testo}</p>
                  </div>
                </div>
              ))}
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 mt-2">
                ⚠️ La dettatura funziona su <strong>Chrome</strong>, <strong>Edge</strong> e <strong>Safari iOS</strong>.
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-300">Hermes Marketing — Web &amp; Comunicazione</p>
      </div>
    </div>
  )
}
