'use client'
import { useState, useRef, useEffect } from 'react'
import BrevoForm from './BrevoForm'

export default function LandingPage() {
  const [annuale, setAnnuale] = useState(false)
  const [mostraAccedi, setMostraAccedi] = useState(false)
  const [nomeAzienda, setNomeAzienda] = useState('')
  const [cercando, setCercando] = useState(false)
  const [erroreAccesso, setErroreAccesso] = useState<string | null>(null)
  const [menuAperto, setMenuAperto] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mostraAccedi) setTimeout(() => inputRef.current?.focus(), 50)
  }, [mostraAccedi])

  const accedi = async () => {
    if (!nomeAzienda.trim()) return
    setCercando(true)
    setErroreAccesso(null)
    try {
      const res = await fetch(`/api/workspaces?cerca=${encodeURIComponent(nomeAzienda.trim())}`)
      const data = await res.json()
      if (!res.ok || !data.slug) throw new Error('Azienda non trovata')
      window.location.href = `https://${data.slug}.voiceleads.it`
    } catch {
      setErroreAccesso('Azienda non trovata. Controlla il nome o contattaci.')
    } finally {
      setCercando(false)
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-x-clip">

      {/* NAV */}
      <div className="fixed top-0 left-0 right-0 z-20 flex justify-center px-4 py-3 pointer-events-none">
        <nav className="pointer-events-auto w-full max-w-3xl bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-2xl px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.png" alt="VoiceLeads" className="h-7 w-7" />
            <span className="font-bold text-white text-base tracking-tight">VoiceLeads</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
            <a href="#come-funziona" className="hover:text-white transition-colors">Come funziona</a>
            <a href="#prezzi" className="hover:text-white transition-colors">Prezzi</a>
            <button
              onClick={() => { setMostraAccedi(a => !a); setErroreAccesso(null); setNomeAzienda('') }}
              className="hover:text-white transition-colors"
            >
              Accedi
            </button>
          </div>

          <a
            href="/checkout?piano=pro"
            className="hidden md:block text-sm font-bold px-5 py-2 rounded-full text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}
          >
            Prova gratis →
          </a>

          <button
            onClick={() => setMenuAperto(m => !m)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors gap-1.5"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuAperto ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuAperto ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuAperto ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </nav>

        {menuAperto && (
          <div className="pointer-events-auto absolute top-16 left-4 right-4 bg-gray-950 border border-white/10 rounded-2xl shadow-2xl p-4 z-30 md:hidden">
            <div className="flex flex-col gap-1">
              {[
                { href: '#come-funziona', label: 'Come funziona' },
                { href: '#prezzi', label: 'Prezzi' },
              ].map(({ href, label }) => (
                <a key={href} href={href} onClick={() => setMenuAperto(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors">
                  {label}
                </a>
              ))}
              <button
                onClick={() => { setMenuAperto(false); setMostraAccedi(true) }}
                className="px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-colors text-left"
              >
                Accedi al workspace
              </button>
              <a href="/checkout?piano=pro" onClick={() => setMenuAperto(false)}
                className="mt-2 px-4 py-3 rounded-xl text-sm font-bold text-white text-center"
                style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>
                Prova gratis 14 giorni →
              </a>
            </div>
          </div>
        )}

        {mostraAccedi && (
          <div className="pointer-events-auto absolute top-16 left-1/2 -translate-x-1/2 w-80 bg-gray-950 border border-white/10 rounded-2xl shadow-2xl p-5 z-30">
            <p className="text-sm font-bold text-white mb-1">Accedi al tuo workspace</p>
            <p className="text-xs text-white/40 mb-3">Inserisci il nome della tua azienda</p>
            <input
              ref={inputRef}
              type="text"
              value={nomeAzienda}
              onChange={e => { setNomeAzienda(e.target.value); setErroreAccesso(null) }}
              onKeyDown={e => e.key === 'Enter' && accedi()}
              placeholder="Es. Hermes Marketing"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-hermes-400 mb-3"
            />
            {erroreAccesso && <p className="text-xs text-red-400 mb-2">{erroreAccesso}</p>}
            <button onClick={accedi} disabled={cercando || !nomeAzienda.trim()}
              className="w-full rounded-xl bg-hermes-500 py-2.5 text-sm font-semibold text-white hover:bg-hermes-600 disabled:opacity-40 transition-colors">
              {cercando ? 'Ricerca…' : 'Vai al workspace →'}
            </button>
          </div>
        )}
      </div>

      {/* HERO — dark futuristico */}
      <section className="relative bg-gray-950 text-white pt-16 overflow-hidden">
        {/* Sfondo decorativo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #ff7930, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #ff4500, transparent)' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-xs font-semibold px-4 py-2 rounded-full mb-8 text-hermes-300 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-hermes-400 animate-pulse" />
              AI per team commerciali · Prova gratuita 14 giorni
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
              Detti.{' '}
              <span style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                L'AI chiude.
              </span>
            </h1>

            <p className="text-white/60 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              VoiceLeads cattura ogni contatto con la voce o la foto del biglietto da visita, poi segue ogni trattativa con un assistente AI che non dimentica mai una scadenza.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <a href="/checkout?piano=pro"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-extrabold text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)', boxShadow: '0 0 40px rgba(255,121,48,0.4)' }}>
                Inizia gratis — 14 giorni
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a href="#prezzi"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white/70 border border-white/10 hover:bg-white/5 hover:text-white transition-all">
                Vedi i piani
              </a>
            </div>
            <p className="text-white/30 text-xs">✓ Nessuna carta di credito &nbsp;·&nbsp; ✓ Piano Pro completo &nbsp;·&nbsp; ✓ Workspace pronto in 2 minuti</p>
          </div>

          {/* Demo card */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-1 shadow-2xl backdrop-blur-sm">
              <div className="bg-gray-900 rounded-[22px] p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="text-white/20 text-xs font-mono ml-2">voiceleads · registrazione live</span>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-hermes-500/20 border border-hermes-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs">🎙️</span>
                    </div>
                    <div>
                      <p className="text-xs text-white/30 font-mono mb-1">INPUT VOCALE</p>
                      <p className="text-sm text-white/80 italic">"Ho incontrato Marco Bianchi, direttore commerciale di TechNord, email mbianchi@technord.it, numero 348 1234567, interessato al preventivo entro giovedì"</p>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs">🤖</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-white/30 font-mono mb-2">ESTRATTO DALL'AI</p>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        {[
                          ['Nome', 'Marco Bianchi'],
                          ['Azienda', 'TechNord'],
                          ['Ruolo', 'Dir. Commerciale'],
                          ['Email', 'mbianchi@technord.it'],
                          ['Tel.', '348 1234567'],
                          ['Scadenza', 'giovedì'],
                        ].map(([k, v]) => (
                          <div key={k} className="bg-white/5 rounded-lg px-2 py-1.5 min-w-0">
                            <span className="text-white/30">{k}: </span>
                            <span className="text-green-400 break-all">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-green-400 font-semibold">Lead salvato · Reminder impostato per giovedì</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NUMERI */}
      <section className="bg-gray-950 border-t border-white/5 py-14 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: '30"', label: 'per registrare un lead completo' },
            { val: '0', label: 'campi da compilare a mano' },
            { val: '14gg', label: 'di prova gratuita, nessuna carta' },
            { val: '2 min', label: 'per attivare il workspace' },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="text-4xl md:text-5xl font-extrabold mb-2 text-white"
                style={{ background: 'linear-gradient(135deg, #ff7930, #ffb347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {val}
              </p>
              <p className="text-white/40 text-sm leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="bg-white py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-hermes-500 text-xs font-bold uppercase tracking-widest mb-4">Il problema</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 text-center mb-4 leading-tight">
            Registrare non basta.<br />
            <span className="text-gray-400">Bisogna chiudere.</span>
          </h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-14 text-lg">
            I lead non si perdono solo perché non vengono registrati. Si perdono perché nessuno li segue davvero.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: '📝',
                titolo: 'Lead senza follow-up',
                testo: 'Metti il contatto nel CRM. Ma chi si ricorda di richiamare? La trattativa muore in silenzio, mentre tu pensi di averla gestita.',
                colore: 'border-red-100',
                badge: 'bg-red-50 text-red-500',
              },
              {
                icon: '🧠',
                titolo: 'Scadenze dimenticate',
                testo: '"Ti richiamo la settimana prossima" rimane un\'intenzione. Senza un sistema intelligente che te lo ricorda, non succede mai.',
                colore: 'border-amber-100',
                badge: 'bg-amber-50 text-amber-500',
              },
              {
                icon: '📉',
                titolo: 'Pipeline senza visibilità',
                testo: 'Quante trattative sono aperte oggi? Chi deve richiamare chi? Il responsabile non lo sa finché non fa il giro uno per uno.',
                colore: 'border-blue-100',
                badge: 'bg-blue-50 text-blue-500',
              },
            ].map(({ icon, titolo, testo, colore, badge }) => (
              <div key={titolo} className={`bg-white rounded-3xl border-2 ${colore} p-7 shadow-sm`}>
                <div className={`inline-block text-2xl rounded-2xl p-3 mb-4 ${badge}`}>{icon}</div>
                <p className="font-bold text-gray-900 text-lg mb-2">{titolo}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section id="come-funziona" className="bg-gray-950 py-20 md:py-28 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #ff7930, transparent)' }} />
        <div className="relative max-w-5xl mx-auto">
          <p className="text-center text-hermes-400 text-xs font-bold uppercase tracking-widest mb-4">Come funziona</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white text-center mb-4 leading-tight">
            Dal contatto alla firma,{' '}
            <span style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              in automatico.
            </span>
          </h2>
          <p className="text-center text-white/40 max-w-xl mx-auto mb-16 text-lg">
            Due moduli. Un solo strumento. Zero digitazione.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Piano Base */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-7 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl">🎙️</div>
                <div>
                  <p className="text-xs font-bold text-white/30 uppercase tracking-wide">Piano Base</p>
                  <p className="font-bold text-white">Registra</p>
                </div>
              </div>
              {[
                { n: '1', titolo: 'Apri l\'app subito dopo l\'appuntamento', testo: 'Finché i dettagli sono freschi. Anche in macchina, in metro, tra una call e l\'altra.' },
                { n: '2', titolo: 'Voce o foto del biglietto', testo: 'Detti liberamente o scatta il biglietto da visita. L\'AI capisce tutto.' },
                { n: '3', titolo: 'Lead completo in 30 secondi', testo: 'Nome, cognome, azienda, email, telefono. Estratto automaticamente, senza toccare una tastiera.' },
                { n: '4', titolo: 'Esporta quando vuoi', testo: 'Un click → CSV con tutti i lead pronti. Importi su Excel, Sheets, CRM. Senza configurazioni.' },
              ].map(({ n, titolo, testo }) => (
                <div key={n} className="flex gap-3 bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-hermes-500/20 text-hermes-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-hermes-500/20">{n}</div>
                  <div>
                    <p className="font-semibold text-white text-sm">{titolo}</p>
                    <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{testo}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Piano Pro */}
            <div className="rounded-3xl p-7 space-y-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,121,48,0.08), rgba(255,69,0,0.04))', border: '1px solid rgba(255,121,48,0.2)' }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 blur-2xl pointer-events-none" style={{ background: 'radial-gradient(circle, #ff7930, transparent)' }} />
              <div className="flex items-center gap-3 mb-2 relative">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: 'rgba(255,121,48,0.2)', border: '1px solid rgba(255,121,48,0.3)' }}>📋</div>
                <div>
                  <p className="text-xs font-bold text-hermes-400/60 uppercase tracking-wide">Piano Pro — in più</p>
                  <p className="font-bold text-white">Registra + Gestisci</p>
                </div>
              </div>
              {[
                { n: '5', titolo: 'Il lead entra in trattativa', testo: 'Appena completato, compare automaticamente nella pipeline. Niente da fare manualmente.' },
                { n: '6', titolo: 'Detti un aggiornamento', testo: '"Ho chiamato Mario, rivuole un preventivo entro venerdì." L\'AI fissa il reminder da sola.' },
                { n: '7', titolo: 'Dashboard intelligente', testo: 'Chi richiamare oggi? Chi aspetta ancora? La risposta è sempre lì, senza dover chiedere a nessuno.' },
                { n: '8', titolo: 'Chiudi con un dettato', testo: '"Mario ha firmato" → Vinto. "Non è interessato" → Perso. Storico trattative automatico.' },
              ].map(({ n, titolo, testo }) => (
                <div key={n} className="flex gap-3 rounded-2xl p-4 relative" style={{ background: 'rgba(255,121,48,0.06)', border: '1px solid rgba(255,121,48,0.1)' }}>
                  <div className="w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(255,121,48,0.2)', color: '#ff7930', border: '1px solid rgba(255,121,48,0.3)' }}>{n}</div>
                  <div>
                    <p className="font-semibold text-white text-sm">{titolo}</p>
                    <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{testo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flow login */}
          <div className="mt-10 bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
            <p className="text-xs font-bold text-white/30 uppercase tracking-wider mb-8 text-center">Accesso multi-commerciale</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-3">
              {[
                { icon: '🌐', titolo: 'URL unico per il team', sub: 'tuaazienda.voiceleads.it' },
                { icon: '👤', titolo: 'Scegli il tuo nome', sub: 'Card con i commerciali' },
                { icon: '🔢', titolo: 'PIN personale', sub: '6 cifre — solo tue' },
                { icon: '🎙️', titolo: 'I tuoi lead', sub: 'Solo il tuo portfolio', highlight: true },
              ].map(({ icon, titolo, sub, highlight }, i) => (
                <div key={titolo} className="flex items-center gap-3 md:gap-3 w-full md:w-auto">
                  <div className={`flex-1 md:w-40 rounded-2xl p-4 text-center ${highlight ? '' : 'bg-white/5 border border-white/10'}`}
                    style={highlight ? { background: 'linear-gradient(135deg, #ff7930, #ff4500)', boxShadow: '0 0 30px rgba(255,121,48,0.3)' } : {}}>
                    <p className="text-2xl mb-1">{icon}</p>
                    <p className={`text-xs font-bold ${highlight ? 'text-white' : 'text-white/80'}`}>{titolo}</p>
                    <p className={`text-xs mt-0.5 ${highlight ? 'text-white/70' : 'text-white/30'}`}>{sub}</p>
                  </div>
                  {i < 3 && <span className="text-white/20 text-xl hidden md:block shrink-0">→</span>}
                  {i < 3 && <span className="text-white/20 text-xl md:hidden">↓</span>}
                </div>
              ))}
            </div>
            <p className="text-center text-white/30 text-xs mt-6">Il responsabile entra con il PIN aziendale e può monitorare ogni commerciale in un tap — senza PIN aggiuntivo.</p>
          </div>
        </div>
      </section>

      {/* VANTAGGI */}
      <section className="bg-white py-20 md:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-hermes-500 text-xs font-bold uppercase tracking-widest mb-4">Perché VoiceLeads</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 text-center mb-14 leading-tight">
            Costruito per chi lavora<br />
            <span className="text-gray-400">sul campo, non in ufficio.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: '🎙️', titolo: 'Voce in italiano', testo: 'Parla come parli normalmente. L\'AI riconosce nomi, aziende, email e numeri anche nel parlato veloce e informale.' },
              { icon: '📷', titolo: 'Biglietti da visita in un click', testo: 'Scatta e vai. L\'AI legge e compila tutti i campi automaticamente. Funziona anche con biglietti stranieri.' },
              { icon: '🤖', titolo: 'Reminder AI intelligenti', testo: 'Detti "richiamare entro giovedì" — l\'AI fissa la scadenza. Il giorno prima ti ricorda chi devi sentire.' },
              { icon: '👥', titolo: 'Multi-commerciale nativo', testo: 'Ogni persona ha il suo PIN, vede solo i propri lead. Il responsabile sorveglia tutto senza PIN aggiuntivi.' },
              { icon: '📥', titolo: 'Export CSV sempre disponibile', testo: 'Un click: CSV completo con nome, azienda, contatti, commerciale. Compatibile con Excel, Sheets e qualsiasi CRM.' },
              { icon: '🔒', titolo: 'Privacy by design', testo: 'Ogni workspace è protetto da PIN. I dati vengono eliminati automaticamente dopo 30 giorni, conforme GDPR.' },
            ].map(({ icon, titolo, testo }) => (
              <div key={titolo} className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-hermes-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-hermes-50 flex items-center justify-center text-2xl mb-4 group-hover:bg-hermes-100 transition-colors">{icon}</div>
                <p className="font-bold text-gray-900 mb-2">{titolo}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRIAL CTA mid-page */}
      <section className="bg-gray-950 py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(ellipse, #ff7930, transparent)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Inizia oggi</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            14 giorni per cambiare<br />il modo di lavorare.
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Piano Pro completo. Workspace attivo in 2 minuti. Nessuna carta di credito richiesta.
          </p>
          <a href="/checkout?piano=pro"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl text-lg font-extrabold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)', boxShadow: '0 0 60px rgba(255,121,48,0.35)' }}>
            Inizia la prova gratuita →
          </a>
          <p className="text-white/25 text-xs mt-5">Poi scegli un piano a partire da €34/utente/mese. Pagamento tramite bonifico bancario.</p>
        </div>
      </section>

      {/* PREZZI */}
      <section id="prezzi" className="py-20 md:py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-hermes-500 text-xs font-bold uppercase tracking-widest mb-4">Prezzi</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 text-center mb-3 leading-tight">Semplice e trasparente.</h2>
          <p className="text-center text-gray-500 max-w-lg mx-auto mb-10 text-lg">
            Paghi per i commerciali attivi. Il responsabile non conta. Fatturazione tramite bonifico bancario.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-semibold ${!annuale ? 'text-gray-900' : 'text-gray-400'}`}>Mensile</span>
            <button
              onClick={() => setAnnuale(a => !a)}
              className={`relative w-14 h-7 rounded-full transition-colors ${annuale ? 'bg-hermes-500' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${annuale ? 'left-8' : 'left-1'}`} />
            </button>
            <span className={`text-sm font-semibold ${annuale ? 'text-gray-900' : 'text-gray-400'}`}>
              Annuale
              <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Risparmia fino al 32%</span>
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Base */}
            <div className="rounded-3xl border-2 border-gray-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">🎙️</div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Base</p>
                  <p className="text-xl font-extrabold text-gray-900">Registra</p>
                </div>
              </div>
              <div className="my-5">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-gray-900">{annuale ? '€299' : '€34'}</span>
                  <span className="text-gray-400 text-sm mb-1.5">/ utente / {annuale ? 'anno' : 'mese'}</span>
                </div>
                {annuale
                  ? <p className="text-sm text-green-600 font-semibold mt-1">✓ €24,90/mese — risparmi €109</p>
                  : <p className="text-sm text-gray-400 mt-1">Fatturato mensilmente via bonifico</p>}
              </div>
              <ul className="space-y-2.5 mb-8 text-sm text-gray-600">
                {['Dettatura vocale in italiano', 'Scansione biglietto da visita', 'Estrazione dati AI automatica', 'Export CSV on demand', 'Accessi multi-commerciale', 'Pannello responsabile incluso', 'Cancellazione auto 30gg (GDPR)'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-green-500 text-base">✓</span>{f}</li>
                ))}
              </ul>
              <a href="/checkout?piano=pro"
                className="block w-full text-center rounded-2xl font-extrabold py-4 text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>
                Prova gratis 14 giorni →
              </a>
            </div>

            {/* Pro */}
            <div className="rounded-3xl p-8 shadow-xl relative" style={{ background: 'linear-gradient(135deg, #1a0a00, #2d1200)', border: '2px solid rgba(255,121,48,0.3)' }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="text-xs font-bold px-4 py-1.5 rounded-full text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>🔥 Più scelto</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'rgba(255,121,48,0.15)', border: '1px solid rgba(255,121,48,0.2)' }}>📋</div>
                <div>
                  <p className="text-xs font-bold text-hermes-400 uppercase tracking-wide">Pro</p>
                  <p className="text-xl font-extrabold text-white">Registra + Gestisci</p>
                </div>
              </div>
              <div className="my-5">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold text-white">{annuale ? '€399' : '€49'}</span>
                  <span className="text-white/40 text-sm mb-1.5">/ utente / {annuale ? 'anno' : 'mese'}</span>
                </div>
                {annuale
                  ? <p className="text-sm text-green-400 font-semibold mt-1">✓ €33,25/mese — risparmi €189</p>
                  : <p className="text-sm text-white/30 mt-1">Fatturato mensilmente via bonifico</p>}
              </div>
              <ul className="space-y-2.5 mb-8 text-sm text-white/80">
                {['Tutto il Piano Base incluso', 'Dashboard trattative con stati', 'Aggiornamenti vocali sulla trattativa', 'Reminder intelligenti con scadenza AI', 'Chiusura vinto/perso con un dettato', 'Storico trattative per commerciale'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-hermes-400 text-base">✓</span>{f}</li>
                ))}
              </ul>
              <a href="/checkout?piano=pro"
                className="block w-full text-center rounded-2xl font-extrabold py-4 text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)', boxShadow: '0 0 30px rgba(255,121,48,0.3)' }}>
                Prova gratis 14 giorni →
              </a>
            </div>

            {/* Enterprise */}
            <div className="rounded-3xl border-2 border-gray-100 bg-gray-950 p-8 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">🏢</div>
                <div>
                  <p className="text-xs font-bold text-white/30 uppercase tracking-wide">Enterprise</p>
                  <p className="text-xl font-extrabold text-white">Su misura</p>
                </div>
              </div>
              <div className="my-5">
                <p className="text-3xl font-extrabold text-white">Offerta<br />personalizzata</p>
                <p className="text-sm text-white/30 mt-2">Prezzo su volume e requisiti</p>
              </div>
              <ul className="space-y-2.5 mb-8 text-sm text-white/60 flex-1">
                {['Tutto il Piano Pro incluso', 'White label — brand aziendale', 'Integrazioni custom (CRM, ERP…)', 'Dominio personalizzato', 'Account manager dedicato', 'Onboarding e formazione team', 'SLA e contratto dedicato'].map(f => (
                  <li key={f} className="flex items-center gap-2"><span className="text-white/30 text-base">✓</span>{f}</li>
                ))}
              </ul>
              <a href="#contatti"
                className="block w-full text-center rounded-2xl bg-white text-gray-900 font-bold py-3.5 hover:bg-gray-100 transition-colors">
                Richiedi un'offerta →
              </a>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Prezzi per utente commerciale. Il responsabile accede gratuitamente. IVA esclusa.{' '}
            <span className="text-gray-300">Pagamento tramite bonifico bancario.</span>
          </p>

          {/* Tabella comparativa */}
          <div className="mt-16">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-8">Confronta i piani</h3>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-4 text-gray-500 font-medium w-1/2">Funzionalità</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-700">Base</th>
                    <th className="px-6 py-4 text-center font-bold text-hermes-600 bg-hermes-50/50">Pro</th>
                    <th className="px-6 py-4 text-center font-bold text-white bg-gray-950 rounded-tr-2xl">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Dettatura vocale in italiano', base: true, pro: true, ent: true },
                    { label: 'Scansione biglietto da visita', base: true, pro: true, ent: true },
                    { label: 'Estrazione dati AI automatica', base: true, pro: true, ent: true },
                    { label: 'Export CSV on demand', base: true, pro: true, ent: true },
                    { label: 'Accessi multi-commerciale', base: true, pro: true, ent: true },
                    { label: 'Pannello responsabile', base: true, pro: true, ent: true },
                    { label: 'Cancellazione automatica 30gg (GDPR)', base: true, pro: true, ent: true },
                    { label: 'Dashboard trattative con stati', base: false, pro: true, ent: true },
                    { label: 'Aggiornamenti vocali sulla trattativa', base: false, pro: true, ent: true },
                    { label: 'Reminder intelligenti con scadenza AI', base: false, pro: true, ent: true },
                    { label: 'Chiusura vinto/perso con un dettato', base: false, pro: true, ent: true },
                    { label: 'Storico trattative per commerciale', base: false, pro: true, ent: true },
                    { label: 'White label e brand aziendale', base: false, pro: false, ent: true },
                    { label: 'Integrazioni custom (CRM, ERP…)', base: false, pro: false, ent: true },
                    { label: 'Account manager dedicato', base: false, pro: false, ent: true },
                    { label: 'SLA e contratto dedicato', base: false, pro: false, ent: true },
                  ].map(({ label, base, pro, ent }, i) => (
                    <tr key={label} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <td className="px-6 py-3.5 text-gray-700">{label}</td>
                      <td className="px-6 py-3.5 text-center">{base ? <span className="text-green-500">✓</span> : <span className="text-gray-200">—</span>}</td>
                      <td className="px-6 py-3.5 text-center bg-hermes-50/30">{pro ? <span className="text-green-500 font-bold">✓</span> : <span className="text-gray-200">—</span>}</td>
                      <td className="px-6 py-3.5 text-center bg-gray-950">{ent ? <span className="text-green-400">✓</span> : <span className="text-gray-700">—</span>}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-6 py-5" />
                    <td className="px-6 py-5 text-center">
                      <a href="/checkout?piano=pro"
                        className="inline-block rounded-xl text-white font-bold px-5 py-2.5 text-sm transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)' }}>
                        Prova gratis 14 giorni →
                      </a>
                    </td>
                    <td className="px-6 py-5 text-center bg-hermes-50/30">
                      <a href="/checkout?piano=pro"
                        className="inline-block rounded-xl text-white font-extrabold px-5 py-2.5 transition-colors text-sm"
                        style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)', boxShadow: '0 0 20px rgba(255,121,48,0.3)' }}>
                        Prova gratis 14 giorni →
                      </a>
                    </td>
                    <td className="px-6 py-5 text-center bg-gray-950 rounded-br-2xl">
                      <a href="#contatti"
                        className="inline-block rounded-xl bg-white text-gray-900 font-bold px-5 py-2.5 hover:bg-gray-100 transition-colors text-sm">
                        Contattaci
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CONTATTI ENTERPRISE */}
      <section id="contatti" className="py-20 md:py-28 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-hermes-500 text-xs font-bold uppercase tracking-widest mb-4">Enterprise & domande</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Hai un team grande o esigenze specifiche?</h2>
          <p className="text-gray-500 text-lg">Parlaci del tuo caso. Costruiamo insieme la soluzione giusta.</p>
        </div>
        <div className="max-w-lg mx-auto">
          <BrevoForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 border-t border-white/5 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <img src="/favicon.png" alt="VoiceLeads" className="h-7 w-7 opacity-60" />
              <span className="text-sm text-white/70">© {new Date().getFullYear()} Hermes Marketing S.r.l.s — VoiceLeads</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/60">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/termini" className="hover:text-white transition-colors">Termini di Servizio</a>
              <a href="/cookie" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="/dpa" className="hover:text-white transition-colors">DPA (Art. 28 GDPR)</a>
              <a href="/checkout?piano=pro" className="text-hermes-400 hover:text-hermes-300 transition-colors font-semibold">Prova gratis →</a>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/50">VoiceLeads è un prodotto di Hermes Marketing S.r.l.s · Pagamenti tramite bonifico bancario · IVA italiana applicabile</p>
            <p className="text-xs text-white/40">Made with AI · Hermes Marketing</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
