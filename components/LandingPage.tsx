'use client'
import { useState } from 'react'
import BrevoForm from './BrevoForm'

export default function LandingPage() {
  const [annuale, setAnnuale] = useState(false)

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* NAV */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-hermes.png" alt="Hermes Marketing" className="h-8 w-auto" />
            <span className="font-bold text-gray-900 text-lg tracking-tight">VoiceLeads</span>
          </div>
          <a href="#prezzi" className="bg-hermes-500 text-white font-semibold px-5 py-2 rounded-xl text-sm hover:bg-hermes-600 transition-colors shadow-sm">
            Vedi i prezzi
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-br from-hermes-600 via-hermes-500 to-orange-400 text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-5 tracking-wide uppercase">
              Per i team commerciali
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
              Ogni lead catturato.<br />
              <span className="text-orange-200">Ogni trattativa seguita.</span>
            </h1>
            <p className="text-hermes-50 text-lg leading-relaxed mb-6">
              Dal primo contatto alla firma. VoiceLeads registra i lead con la voce o la foto del biglietto da visita, poi <strong className="text-white">segue ogni trattativa con un assistente AI</strong> che ricorda le scadenze al posto tuo.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { icon: '🎙️', label: 'Dettatura vocale' },
                { icon: '📷', label: 'Foto biglietto da visita' },
                { icon: '📋', label: 'Gestione trattative AI' },
                { icon: '👥', label: 'Multi-commerciale' },
                { icon: '📤', label: 'Sync Google Sheets' },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                  {icon} {label}
                </span>
              ))}
            </div>
            <a href="#prezzi" className="inline-block bg-white text-hermes-600 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 text-center">
              Scopri i piani →
            </a>
            <p className="text-hermes-200 text-xs mt-4">Nessun abbonamento richiesto ora. Ti contatteremo entro 24h.</p>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 w-80 shadow-2xl space-y-4">
              <div className="bg-white/20 rounded-2xl p-4">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wide mb-2">🎙️ Registra</p>
                <p className="text-sm italic font-semibold">"Ho incontrato Mario Rossi di Acme, email mario@acme.it…"</p>
                <div className="mt-3 bg-green-400 text-green-900 text-xs font-bold rounded-lg px-3 py-1.5 text-center">
                  ✓ Lead pronto per Sheets
                </div>
              </div>
              <div className="bg-white/20 rounded-2xl p-4">
                <p className="text-xs font-bold text-white/60 uppercase tracking-wide mb-2">📋 Gestisci</p>
                <p className="text-sm italic font-semibold">"Ho chiamato Mario, rivuole un preventivo entro venerdì"</p>
                <div className="mt-3 bg-amber-400 text-amber-900 text-xs font-bold rounded-lg px-3 py-1.5 text-center">
                  ⏰ Scadenza: venerdì 13 giu
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="bg-gray-50 py-16 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-400 text-sm font-semibold uppercase tracking-widest mb-3">Il problema</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">Registrare non basta. Bisogna chiudere.</h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-12">
            Ogni commerciale lo sa: i lead si perdono non solo perché non vengono registrati, ma perché nessuno li segue davvero.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: '📝', titolo: 'Lead senza follow-up', testo: 'Registri il contatto, lo metti nel CRM. Ma chi si ricorda di richiamare? La trattativa muore in silenzio.' },
              { emoji: '🧠', titolo: 'Scadenze dimenticate', testo: '"Ti richiamo la settimana prossima" rimane un\'intenzione. Senza un sistema che te lo ricorda, non succede.' },
              { emoji: '📉', titolo: 'Pipeline senza visibilità', testo: 'Quante trattative sono aperte? Qual è la prossima azione? Il responsabile non lo sa fino al meeting del lunedì.' },
            ].map(({ emoji, titolo, testo }) => (
              <div key={titolo} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <p className="text-3xl mb-4">{emoji}</p>
                <p className="font-bold text-gray-900 mb-2">{titolo}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MULTI-UTENTE */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-hermes-500 text-sm font-semibold uppercase tracking-widest mb-3">Per i team</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">Ogni commerciale ha il suo spazio</h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-14">
            Stesso sottodominio aziendale, accessi separati. Ogni commerciale vede solo i propri lead. Il responsabile può entrare nell'area di chiunque, senza PIN aggiuntivo.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                emoji: '👤',
                titolo: 'Commerciale 1',
                badge: 'PIN personale',
                badgeColor: 'bg-blue-100 text-blue-700',
                testo: 'Entra con il suo PIN, registra i suoi lead, gestisce le sue trattative. Vede solo il suo portfolio.',
                border: 'border-blue-200',
              },
              {
                emoji: '👤',
                titolo: 'Commerciale 2',
                badge: 'PIN personale',
                badgeColor: 'bg-purple-100 text-purple-700',
                testo: 'Stessa app, stessa URL. Ma dashboard separata, lead separati, trattative separate.',
                border: 'border-purple-200',
              },
              {
                emoji: '🔑',
                titolo: 'Responsabile',
                badge: 'Accesso supervisore',
                badgeColor: 'bg-hermes-100 text-hermes-700',
                testo: 'Entra con il PIN aziendale, sceglie quale commerciale monitorare e accede alla sua area in un tap — senza PIN aggiuntivo.',
                border: 'border-hermes-300',
              },
            ].map(({ emoji, titolo, badge, badgeColor, testo, border }) => (
              <div key={titolo} className={`bg-white rounded-2xl border-2 ${border} p-6 shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">{emoji}</div>
                  <div>
                    <p className="font-bold text-gray-900">{titolo}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{testo}</p>
              </div>
            ))}
          </div>

          {/* Flow visivo */}
          <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6 md:p-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 text-center">Come funziona il login</p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 text-center shadow-sm w-full md:w-48">
                <p className="text-2xl mb-2">🌐</p>
                <p className="text-sm font-bold text-gray-900">hermesmarketing<br />.voiceleads.it</p>
                <p className="text-xs text-gray-400 mt-1">URL unico per il team</p>
              </div>
              <div className="text-gray-300 text-2xl hidden md:block">→</div>
              <div className="text-gray-300 text-2xl md:hidden">↓</div>
              <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 text-center shadow-sm w-full md:w-48">
                <p className="text-2xl mb-2">👤</p>
                <p className="text-sm font-bold text-gray-900">Seleziona<br />il tuo nome</p>
                <p className="text-xs text-gray-400 mt-1">Card con i commerciali</p>
              </div>
              <div className="text-gray-300 text-2xl hidden md:block">→</div>
              <div className="text-gray-300 text-2xl md:hidden">↓</div>
              <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 text-center shadow-sm w-full md:w-48">
                <p className="text-2xl mb-2">🔢</p>
                <p className="text-sm font-bold text-gray-900">Inserisci<br />il tuo PIN</p>
                <p className="text-xs text-gray-400 mt-1">6 cifre personali</p>
              </div>
              <div className="text-gray-300 text-2xl hidden md:block">→</div>
              <div className="text-gray-300 text-2xl md:hidden">↓</div>
              <div className="bg-hermes-500 rounded-2xl px-5 py-4 text-center shadow-sm w-full md:w-48">
                <p className="text-2xl mb-2">🎙️</p>
                <p className="text-sm font-bold text-white">Dentro!<br />I tuoi lead</p>
                <p className="text-xs text-hermes-200 mt-1">Solo il tuo portfolio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COME FUNZIONA */}
      <section className="bg-gray-50 py-16 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-hermes-500 text-sm font-semibold uppercase tracking-widest mb-3">Come funziona</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-14">Dal contatto alla firma, in automatico</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-sm font-bold text-hermes-500 uppercase tracking-wide">📥 Piano Base — Registra</p>
              {[
                { n: '1', titolo: 'Apri l\'app dopo l\'appuntamento', testo: 'Appena esci. Mentre i dettagli sono freschi.' },
                { n: '2', titolo: 'Voce o foto', testo: 'Detta il contatto oppure fotografa il biglietto da visita.' },
                { n: '3', titolo: 'L\'AI estrae tutto', testo: 'Nome, cognome, azienda, email, telefono. Automatico.' },
                { n: '4', titolo: 'Esporta su Sheets', testo: 'Un click e il lead finisce nel tuo Google Sheets condiviso con la colonna Commerciale.' },
              ].map(({ n, titolo, testo }) => (
                <div key={n} className="flex gap-4 bg-white rounded-2xl border border-gray-200 p-4">
                  <div className="w-8 h-8 rounded-full bg-hermes-500 text-white font-bold text-sm flex items-center justify-center shrink-0">{n}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{titolo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{testo}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <p className="text-sm font-bold text-hermes-500 uppercase tracking-wide">📋 Piano Pro — Gestisci (in più)</p>
              {[
                { n: '5', titolo: 'Il lead entra in trattativa', testo: 'Appena completato, entra automaticamente in Gestisci.' },
                { n: '6', titolo: 'Detti un aggiornamento', testo: '"Ho chiamato Mario, vuole un preventivo entro venerdì." L\'AI fissa il reminder.' },
                { n: '7', titolo: 'Reminder intelligenti', testo: 'La dashboard ti mostra chi richiamare oggi. Nessuna scadenza dimenticata.' },
                { n: '8', titolo: 'Chiudi con un dettato', testo: '"Mario ha firmato" → Vinto. "Non è interessato" → Perso. Tutto su Sheets in automatico.' },
              ].map(({ n, titolo, testo }) => (
                <div key={n} className="flex gap-4 bg-white rounded-2xl border border-hermes-200 p-4">
                  <div className="w-8 h-8 rounded-full bg-hermes-100 text-hermes-700 font-bold text-sm flex items-center justify-center shrink-0">{n}</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{titolo}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{testo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NUMERI */}
      <section className="bg-hermes-500 text-white py-14 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: '30"', label: 'per registrare un lead completo' },
            { val: '0', label: 'campi da compilare manualmente' },
            { val: '100%', label: 'dei lead con una scadenza di follow-up' },
            { val: '24h', label: 'per ricevere accesso dopo la richiesta' },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="text-4xl md:text-5xl font-extrabold mb-2">{val}</p>
              <p className="text-hermes-100 text-sm leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PREZZI */}
      <section id="prezzi" className="py-16 md:py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-hermes-500 text-sm font-semibold uppercase tracking-widest mb-3">Prezzi</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">Semplice, per utente</h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-8">
            Paghi per i commerciali attivi. Il responsabile non conta.
          </p>

          {/* Toggle fatturazione */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-semibold ${!annuale ? 'text-gray-900' : 'text-gray-400'}`}>Mensile</span>
            <button
              onClick={() => setAnnuale(a => !a)}
              className={`relative w-14 h-7 rounded-full transition-colors ${annuale ? 'bg-hermes-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${annuale ? 'left-8' : 'left-1'}`} />
            </button>
            <span className={`text-sm font-semibold ${annuale ? 'text-gray-900' : 'text-gray-400'}`}>
              Annuale
              <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Risparmia fino al 32%</span>
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">

            {/* Piano Base */}
            <div className="rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-hermes-100 flex items-center justify-center text-2xl">🎙️</div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Piano Base</p>
                  <p className="text-xl font-extrabold text-gray-900">Registra</p>
                </div>
              </div>

              <div className="my-6">
                {annuale ? (
                  <>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-extrabold text-gray-900">€299</span>
                      <span className="text-gray-400 text-sm mb-1.5">/ utente / anno</span>
                    </div>
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      ✓ Equivale a €24,90/mese — risparmi €109 vs mensile
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-extrabold text-gray-900">€34</span>
                      <span className="text-gray-400 text-sm mb-1.5">/ utente / mese</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Fatturato mensilmente</p>
                  </>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  '🎙️ Dettatura vocale in italiano',
                  '📷 Scansione biglietto da visita',
                  '🤖 Estrazione dati AI automatica',
                  '📤 Export su Google Sheets',
                  '👥 Accessi multi-commerciale',
                  '🔑 Pannello responsabile incluso',
                  '🔒 Cancellazione automatica 30gg',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#richiesta" className="block w-full text-center rounded-xl border-2 border-hermes-400 text-hermes-600 font-bold py-3.5 hover:bg-hermes-50 transition-colors">
                Inizia con Base →
              </a>
            </div>

            {/* Piano Pro */}
            <div className="rounded-3xl border-2 border-hermes-400 bg-gradient-to-br from-hermes-50 to-orange-50 p-8 shadow-lg relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-hermes-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">🔥 Best value</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-hermes-500 flex items-center justify-center text-2xl">📋</div>
                <div>
                  <p className="text-xs font-bold text-hermes-500 uppercase tracking-wide">Piano Pro</p>
                  <p className="text-xl font-extrabold text-gray-900">Registra + Gestisci</p>
                </div>
              </div>

              <div className="my-6">
                {annuale ? (
                  <>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-extrabold text-gray-900">€399</span>
                      <span className="text-gray-500 text-sm mb-1.5">/ utente / anno</span>
                    </div>
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      ✓ Equivale a €33,25/mese — risparmi €189 vs mensile
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-extrabold text-gray-900">€49</span>
                      <span className="text-gray-500 text-sm mb-1.5">/ utente / mese</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Fatturato mensilmente</p>
                  </>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  '✅ Tutto il Piano Base incluso',
                  '📋 Dashboard trattative con stati',
                  '🎙️ Aggiornamenti vocali sulla trattativa',
                  '⏰ Reminder automatici con scadenza AI',
                  '🏆 Chiusura vinto/perso con un dettato',
                  '📊 Sync automatico fase trattativa su Sheets',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#richiesta" className="block w-full text-center rounded-xl bg-hermes-500 text-white font-bold py-3.5 hover:bg-hermes-600 transition-colors shadow-md">
                Inizia con Pro →
              </a>
            </div>

            {/* Piano Enterprise */}
            <div className="rounded-3xl border-2 border-gray-800 bg-gray-900 p-8 shadow-lg relative flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gray-700 flex items-center justify-center text-2xl">🏢</div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Enterprise</p>
                  <p className="text-xl font-extrabold text-white">Su misura</p>
                </div>
              </div>

              <div className="my-6">
                <p className="text-3xl font-extrabold text-white">Offerta<br />personalizzata</p>
                <p className="text-sm text-gray-400 mt-2">Prezzo su volume e requisiti</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '✅ Tutto il Piano Pro incluso',
                  '🎨 White label — brand aziendale',
                  '🔗 Integrazioni custom (CRM, ERP…)',
                  '📐 Workflow su misura',
                  '🏷️ Dominio personalizzato',
                  '🤝 Account manager dedicato',
                  '⚡ Onboarding e formazione team',
                  '🔒 SLA e contratto dedicato',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#richiesta" className="block w-full text-center rounded-xl bg-white text-gray-900 font-bold py-3.5 hover:bg-gray-100 transition-colors shadow-md">
                Richiedi un'offerta →
              </a>
            </div>

          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Prezzi per utente commerciale. Il responsabile accede gratuitamente. IVA esclusa.
          </p>
        </div>
      </section>

      {/* VANTAGGI */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Perché i commerciali scelgono VoiceLeads</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🎙️', titolo: 'Dettatura vocale in italiano', testo: 'Parla liberamente dopo ogni appuntamento. L\'AI riconosce nomi, aziende, email e telefoni anche nel parlato naturale.' },
              { icon: '📷', titolo: 'Foto biglietto da visita', testo: 'Scatta e via. L\'AI legge il biglietto e compila tutti i campi in automatico. Funziona con biglietti in più lingue.' },
              { icon: '👥', titolo: 'Multi-commerciale nativo', testo: 'Ogni commerciale ha il suo PIN e vede solo i propri lead. Il responsabile monitora tutti con un tap, senza PIN aggiuntivo.' },
              { icon: '⚡', titolo: 'Velocità reale sul campo', testo: 'Non aspetti di tornare in ufficio. Registri e aggiorni subito, tra un appuntamento e l\'altro.' },
              { icon: '📊', titolo: 'Google Sheets integrato', testo: 'Lead, fase trattativa, esito finale e commerciale di riferimento: tutto si sincronizza automaticamente sul tuo foglio condiviso.' },
              { icon: '🔒', titolo: 'Dati protetti e cancellazione automatica', testo: 'Ogni workspace è protetto da PIN. I dati vengono eliminati automaticamente dopo 30 giorni, in linea con il GDPR.' },
            ].map(({ icon, titolo, testo }) => (
              <div key={titolo} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex gap-4">
                <span className="text-3xl shrink-0">{icon}</span>
                <div>
                  <p className="font-bold text-gray-900 mb-1">{titolo}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{testo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="richiesta" className="py-16 md:py-24 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-hermes-500 text-sm font-semibold uppercase tracking-widest mb-3">Inizia ora</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Vuoi VoiceLeads per il tuo team?</h2>
          <p className="text-gray-500 text-base">
            Lascia i tuoi dati e indica quanti commerciali hai e quale piano ti interessa. Ti contattiamo entro 24 ore per attivare il tuo accesso.
          </p>
        </div>
        <div className="max-w-lg mx-auto">
          <BrevoForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-hermes.png" alt="Hermes Marketing" className="h-7 w-auto opacity-50" />
            <span className="text-sm text-gray-400">© {new Date().getFullYear()} Hermes Marketing</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <a href="/privacy" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a href="/cookie" className="hover:text-gray-600 transition-colors">Cookie Policy</a>
            <a href="/dpa" className="hover:text-gray-600 transition-colors">DPA</a>
            <span className="text-gray-200">|</span>
            <span>hermesmarketing.it</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
