import Link from 'next/link'

export const metadata = { title: 'Cookie Policy — VoiceLeads' }

export default function CookiePolicy() {
  const aggiornata = '05 giugno 2026'

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-hermes.png" alt="Hermes Marketing" className="h-7 w-auto" />
            <span className="font-bold text-gray-900">VoiceLeads</span>
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Torna al sito</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Ultimo aggiornamento: {aggiornata}</p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Cosa sono i cookie</h2>
            <p>
              I cookie sono piccoli file di testo che i siti web salvano sul dispositivo dell'utente durante la navigazione.
              Vengono utilizzati per far funzionare il sito, ricordare le preferenze dell'utente e raccogliere informazioni
              statistiche sulla navigazione.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Cookie utilizzati da VoiceLeads</h2>

            <h3 className="font-semibold text-gray-800 mb-2 mt-4">🔧 Cookie tecnici — sempre attivi</h3>
            <p className="mb-3 text-gray-500 text-xs">Necessari per il funzionamento del sito. Non richiedono consenso.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Nome</th>
                    <th className="text-left p-3 font-semibold">Tipo</th>
                    <th className="text-left p-3 font-semibold">Scopo</th>
                    <th className="text-left p-3 font-semibold">Durata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['vl_session', 'localStorage', 'Mantiene la sessione di accesso dell\'utente (PIN workspace)', 'Sessione'],
                    ['vl_cookie_consent', 'localStorage', 'Salva la preferenza cookie dell\'utente', '12 mesi'],
                  ].map(([n, t, s, d]) => (
                    <tr key={n}>
                      <td className="p-3 font-mono text-gray-700">{n}</td>
                      <td className="p-3 text-gray-600">{t}</td>
                      <td className="p-3 text-gray-600">{s}</td>
                      <td className="p-3 text-gray-500">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-gray-800 mb-2 mt-6">📩 Cookie di terze parti — richiedono consenso</h3>
            <p className="mb-3 text-gray-500 text-xs">Impostati da fornitori esterni. Attivi solo se l'utente accetta.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Fornitore</th>
                    <th className="text-left p-3 font-semibold">Scopo</th>
                    <th className="text-left p-3 font-semibold">Categoria</th>
                    <th className="text-left p-3 font-semibold">Privacy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Brevo (Sendinblue)', 'Gestione form di contatto e invio email', 'Funzionale / Marketing', 'brevo.com/legal/privacypolicy'],
                  ].map(([f, s, c, p]) => (
                    <tr key={f}>
                      <td className="p-3 font-medium text-gray-700">{f}</td>
                      <td className="p-3 text-gray-600">{s}</td>
                      <td className="p-3 text-gray-600">{c}</td>
                      <td className="p-3 text-blue-500 break-all">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Come gestire i cookie</h2>
            <p className="mb-3">
              Puoi modificare le tue preferenze in qualsiasi momento tramite il banner che compare in fondo alla pagina.
              In alternativa, puoi gestire i cookie direttamente dal tuo browser:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              {[
                ['Chrome', 'Impostazioni → Privacy e sicurezza → Cookie'],
                ['Firefox', 'Impostazioni → Privacy e sicurezza → Cookie e dati del sito'],
                ['Safari', 'Preferenze → Privacy → Gestisci dati siti web'],
                ['Edge', 'Impostazioni → Cookie e autorizzazioni sito'],
              ].map(([b, p]) => (
                <li key={b}><strong>{b}:</strong> {p}</li>
              ))}
            </ul>
            <p className="mt-3 text-gray-500 text-xs">
              Nota: disabilitare i cookie tecnici potrebbe compromettere il funzionamento dell'applicazione.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Contatti</h2>
            <p>
              Per qualsiasi domanda relativa ai cookie o alla privacy, scrivi a:{' '}
              <strong>privacy@hermesmarketing.it</strong>
            </p>
            <p className="mt-2">
              Per il trattamento dei dati personali, consulta la nostra{' '}
              <Link href="/privacy" className="text-hermes-500 underline hover:text-hermes-600">
                Privacy Policy
              </Link>.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-100 px-6 py-8 mt-12">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Hermes Marketing</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
            <Link href="/dpa" className="hover:text-gray-600">DPA</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
