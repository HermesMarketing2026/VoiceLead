'use client'
import BrevoForm from './BrevoForm'

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-hermes-500 to-hermes-700 text-white px-6 py-16 text-center">
        <img src="/logo-hermes.png" alt="Hermes Marketing" className="h-14 w-auto mx-auto mb-6 brightness-0 invert" />
        <h1 className="text-4xl font-bold leading-tight mb-3">
          VoiceLeads
        </h1>
        <p className="text-hermes-100 text-lg mb-2">by Hermes Marketing</p>
        <p className="text-hermes-50 text-base max-w-sm mx-auto leading-relaxed mt-4">
          Registra i tuoi contatti commerciali con la voce, direttamente dopo ogni appuntamento.
        </p>
        <a
          href="#richiesta"
          className="inline-block mt-8 bg-white text-hermes-600 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
        >
          Richiedi l'accesso
        </a>
      </section>

      {/* Come funziona */}
      <section className="px-6 py-14 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Come funziona</h2>
        <div className="space-y-6">
          {[
            {
              n: '01',
              icon: '🎙️',
              titolo: 'Ditta il lead con la voce',
              testo: 'Appena finito un appuntamento, premi il microfono e descrivi il contatto liberamente. "Ho incontrato Mario Rossi di Acme, email mario@acme.it, telefono 333…"',
            },
            {
              n: '02',
              icon: '🤖',
              titolo: "L'AI estrae i dati",
              testo: "L'intelligenza artificiale riconosce automaticamente nome, cognome, azienda, email e telefono dal tuo parlato e compila il form.",
            },
            {
              n: '03',
              icon: '✏️',
              titolo: 'Correggi e salva',
              testo: 'Verifica i campi in pochi secondi, aggiungi note sull\'incontro e salva il lead con un tap.',
            },
            {
              n: '04',
              icon: '📊',
              titolo: 'Esporta su Google Sheets',
              testo: 'Con un click esporti tutti i lead completi sul tuo foglio Google, pronti per il follow-up.',
            },
          ].map(({ n, icon, titolo, testo }) => (
            <div key={n} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-hermes-50 flex items-center justify-center text-hermes-500 font-bold text-sm shrink-0">
                {n}
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{icon} {titolo}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{testo}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vantaggi */}
      <section className="bg-gray-50 px-6 py-14">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Perché VoiceLeads?</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '⚡', titolo: 'Veloce', testo: '30 secondi per registrare un lead completo' },
              { icon: '🎯', titolo: 'Preciso', testo: "AI addestrata sull'italiano commerciale" },
              { icon: '📱', titolo: 'Mobile first', testo: 'Pensato per il commerciale in movimento' },
              { icon: '🔒', titolo: 'Sicuro', testo: 'Accesso con PIN, dati isolati per cliente' },
            ].map(({ icon, titolo, testo }) => (
              <div key={titolo} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <p className="text-2xl mb-2">{icon}</p>
                <p className="font-semibold text-gray-900 text-sm">{titolo}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form richiesta */}
      <section id="richiesta" className="px-6 py-14 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Vuoi VoiceLeads per la tua azienda?</h2>
        <p className="text-center text-gray-500 text-sm mb-8">Lascia i tuoi dati, ti contattiamo entro 24 ore.</p>
        <BrevoForm />
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8 text-center">
        <img src="/logo-hermes.png" alt="Hermes Marketing" className="h-8 w-auto mx-auto mb-3 opacity-40" />
        <p className="text-xs text-gray-400">© {new Date().getFullYear()} Hermes Marketing — Web &amp; Comunicazione</p>
        <p className="text-xs text-gray-300 mt-1">hermesmarketing.it</p>
      </footer>
    </div>
  )
}
