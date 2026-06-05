'use client'
import BrevoForm from './BrevoForm'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* NAV */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-hermes.png" alt="Hermes Marketing" className="h-8 w-auto" />
            <span className="font-bold text-gray-900 text-lg tracking-tight">VoiceLeads</span>
          </div>
          <a
            href="#richiesta"
            className="bg-hermes-500 text-white font-semibold px-5 py-2 rounded-xl text-sm hover:bg-hermes-600 transition-colors shadow-sm"
          >
            Richiedi accesso
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
              <span className="text-orange-200">Zero contatti persi.</span>
            </h1>
            <p className="text-hermes-50 text-lg leading-relaxed mb-6">
              Finito l'appuntamento, apri l'app e scegli: <strong className="text-white">parla per 30 secondi</strong> oppure <strong className="text-white">fotografa il biglietto da visita</strong>. L'AI estrae i dati e li prepara per il tuo CRM.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { icon: '🎙️', label: 'Dettatura vocale' },
                { icon: '📷', label: 'Foto biglietto da visita' },
                { icon: '🤖', label: 'Estrazione AI automatica' },
              ].map(({ icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                  {icon} {label}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#richiesta"
                className="inline-block bg-white text-hermes-600 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 text-center"
              >
                Richiedi accesso gratuito →
              </a>
            </div>
            <p className="text-hermes-200 text-xs mt-4">Nessun abbonamento richiesto ora. Ti contatteremo entro 24h.</p>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 w-80 shadow-2xl">
              {/* Tab voce / foto */}
              <div className="flex rounded-xl bg-white/10 p-1 mb-6 gap-1">
                <div className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white/20 py-1.5 text-xs font-bold">
                  🎙️ Voce
                </div>
                <div className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-white/60">
                  📷 Foto
                </div>
              </div>
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0">🎙️</div>
                <p className="font-semibold text-sm italic leading-snug">"Ho incontrato Mario Rossi di Acme, mi ha dato il 333-1234567..."</p>
              </div>
              <div className="h-px bg-white/20 mb-5" />
              {[
                { label: 'Nome', val: 'Mario Rossi' },
                { label: 'Azienda', val: 'Acme S.r.l.' },
                { label: 'Telefono', val: '333 1234567' },
                { label: 'Email', val: 'mario@acme.it' },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between text-sm mb-3">
                  <span className="text-hermes-200">{label}</span>
                  <span className="font-semibold">{val}</span>
                </div>
              ))}
              <div className="mt-5 bg-green-400 text-green-900 text-xs font-bold rounded-lg px-3 py-2 text-center">
                ✓ Pronto per Google Sheets
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="bg-gray-50 py-16 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-400 text-sm font-semibold uppercase tracking-widest mb-3">Il problema</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Ti è mai successo?
          </h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-12">
            Ogni commerciale lo sa: i lead presi "a mente" o su carta finiscono dimenticati.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                emoji: '📝',
                titolo: 'Bigliettino smarrito',
                testo: 'Scrivi il numero su un foglietto, lo metti in tasca. Tre giorni dopo non lo trovi più.',
              },
              {
                emoji: '🧠',
                titolo: 'Memoria che sbiadisce',
                testo: 'Prendi 5 appuntamenti in un giorno. La sera ricordi solo 2. Gli altri? Vaghi.',
              },
              {
                emoji: '⏱️',
                titolo: 'CRM compilato "dopo"',
                testo: '"Lo inserisco stasera" diventa "lo inserisco domani" e poi non si inserisce più.',
              },
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

      {/* SOLUZIONE */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-hermes-500 text-sm font-semibold uppercase tracking-widest mb-3">La soluzione</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Registra il lead in 30 secondi,<br className="hidden md:block" /> mentre esci dall'appuntamento.
          </h2>
          <p className="text-center text-gray-500 max-w-xl mx-auto mb-10">
            Niente tastiera. Niente form da compilare. Scegli tu come farlo.
          </p>

          {/* Due modalità in evidenza */}
          <div className="grid md:grid-cols-2 gap-5 mb-14 max-w-2xl mx-auto">
            <div className="rounded-2xl border-2 border-hermes-200 bg-hermes-50 p-6">
              <p className="text-3xl mb-3">🎙️</p>
              <p className="font-bold text-gray-900 mb-1">Dettatura vocale</p>
              <p className="text-sm text-gray-500 leading-relaxed">Parla liberamente mentre esci dall'ufficio del cliente. "Ho incontrato Mario di Acme, email mario@acme.it…" — l'AI trascrive e compila tutto.</p>
            </div>
            <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-6">
              <p className="text-3xl mb-3">📷</p>
              <p className="font-bold text-gray-900 mb-1">Foto biglietto da visita</p>
              <p className="text-sm text-gray-500 leading-relaxed">Scatta una foto al biglietto da visita. L'AI legge i dati e li inserisce automaticamente nei campi giusti. Un secondo, fatto.</p>
              <span className="inline-block mt-3 text-xs font-bold bg-orange-400 text-white px-2.5 py-1 rounded-full">✨ Esclusiva VoiceLeads</span>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n: '1', icon: '📲', titolo: 'Apri l\'app', testo: 'Appena fuori dall\'appuntamento, apri VoiceLeads sul tuo smartphone.' },
              { n: '2', icon: '🎙️ · 📷', titolo: 'Voce o foto', testo: 'Detta il contatto oppure fotografa il biglietto da visita. Tu scegli.' },
              { n: '3', icon: '🤖', titolo: "L'AI estrae tutto", testo: 'Nome, cognome, azienda, email, telefono. Campi compilati in automatico.' },
              { n: '4', icon: '📤', titolo: 'Esporta su Sheets', testo: 'Un click e tutti i lead pronti atterrano sul tuo Google Sheets.' },
            ].map(({ n, icon, titolo, testo }) => (
              <div key={n} className="relative">
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="w-10 h-10 rounded-full bg-hermes-500 text-white font-bold text-sm flex items-center justify-center mb-4 shadow-md">
                    {n}
                  </div>
                  <p className="text-2xl mb-2">{icon}</p>
                  <p className="font-bold text-gray-900 mb-1">{titolo}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{testo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUMERI */}
      <section className="bg-hermes-500 text-white py-14 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: '30"', label: 'per registrare un lead completo' },
            { val: '0', label: 'campi da compilare manualmente' },
            { val: '100%', label: 'dei dati pronti per il CRM' },
            { val: '24h', label: 'per ricevere accesso dopo la richiesta' },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="text-4xl md:text-5xl font-extrabold mb-2">{val}</p>
              <p className="text-hermes-100 text-sm leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VANTAGGI */}
      <section className="py-16 md:py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Perché i commerciali scelgono VoiceLeads</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🎙️', titolo: 'Dettatura vocale in italiano', testo: 'Parla liberamente dopo ogni appuntamento. L\'AI riconosce nomi, aziende, email e telefoni anche nel parlato naturale, accenti inclusi.' },
              { icon: '📷', titolo: 'Foto biglietto da visita', testo: 'Scatta e via. L\'AI legge il biglietto e compila tutti i campi in automatico. Funziona con biglietti in italiano, inglese e altre lingue.' },
              { icon: '⚡', titolo: 'Velocità reale sul campo', testo: 'Non aspetti di tornare in ufficio. Registri subito, quando i dettagli sono ancora freschi. Tra un appuntamento e l\'altro.' },
              { icon: '📱', titolo: 'Funziona come una PWA', testo: 'Si installa sullo smartphone come un\'app, ma non richiede nessun App Store. Funziona offline e si aggiorna da solo.' },
              { icon: '📊', titolo: 'Google Sheets integrato', testo: 'Esporta tutti i lead con un click sul tuo foglio condiviso. Il responsabile vede tutto in tempo reale.' },
              { icon: '🔒', titolo: 'Dati isolati e cancellazione automatica', testo: 'Ogni workspace è protetto da PIN. I dati vengono eliminati automaticamente dopo 30 giorni dall\'esportazione.' },
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
      <section id="richiesta" className="py-16 md:py-24 px-6">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-hermes-500 text-sm font-semibold uppercase tracking-widest mb-3">Inizia ora</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Vuoi VoiceLeads per il tuo team?
          </h2>
          <p className="text-gray-500 text-base">
            Lascia i tuoi dati. Ti contattiamo entro 24 ore per attivare il tuo accesso personalizzato.
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
