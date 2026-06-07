import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — VoiceLeads' }

export default function PrivacyPolicy() {
  const aggiornata = '07 giugno 2026'

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="VoiceLeads" className="h-7 w-7" />
            <span className="font-bold text-gray-900">VoiceLeads</span>
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Torna al sito</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Ultimo aggiornamento: {aggiornata}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Titolare del Trattamento</h2>
            <p>
              Il Titolare del Trattamento dei dati personali raccolti tramite il sito <strong>voiceleads.it</strong> e
              l'applicazione VoiceLeads è:
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mt-3 font-mono text-xs space-y-1">
              <p><strong>Hermes Marketing S.r.l.s</strong></p>
              <p>Piazza Gae Aulenti 1, Torre B — 20124 Milano (MI)</p>
              <p>P.IVA: 14088840963</p>
              <p>Email: info@hermesmarketing.it</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Tipologie di dati trattati</h2>
            <p>VoiceLeads tratta le seguenti categorie di dati personali:</p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong>Dati degli utenti del servizio</strong> (commerciali e responsabili aziendali):
                nome, cognome, indirizzo email, numero di telefono, dati aziendali.
              </li>
              <li>
                <strong>Dati dei lead registrati</strong> (contatti commerciali acquisiti dagli utenti):
                nome, cognome, azienda, email, numero di telefono, note libere.
              </li>
              <li>
                <strong>Registrazioni vocali</strong>: tracce audio dettate dall'utente contenenti
                informazioni sui contatti commerciali. Le registrazioni vengono elaborate dall'AI per
                l'estrazione dei dati e <strong>non vengono conservate</strong> nei nostri sistemi.
              </li>
              <li>
                <strong>Immagini di biglietti da visita</strong>: fotografie scattate dall'utente
                elaborate dall'AI per l'estrazione dei dati. Le immagini <strong>non vengono conservate</strong>
                nei nostri sistemi.
              </li>
              <li>
                <strong>Dati di fatturazione</strong> (raccolti al momento dell'abbonamento):
                ragione sociale, Partita IVA, codice SDI, PEC, indirizzo di fatturazione.
                Trattati ai fini dell'emissione della fattura elettronica.
              </li>
              <li>
                <strong>Dati tecnici</strong>: indirizzo IP, tipo di browser, sistema operativo,
                dati di navigazione raccolti automaticamente.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Finalità e basi giuridiche del trattamento</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-gray-700">Finalità</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Base giuridica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Erogazione del servizio VoiceLeads', 'Esecuzione del contratto (Art. 6(1)(b) GDPR)'],
                    ['Attivazione e gestione prova gratuita 14 giorni', 'Esecuzione del contratto (Art. 6(1)(b) GDPR)'],
                    ['Registrazione e gestione lead commerciali', 'Legittimo interesse del titolare del trattamento cliente (Art. 6(1)(f) GDPR)'],
                    ['Elaborazione AI di testo, audio e immagini', 'Esecuzione del contratto (Art. 6(1)(b) GDPR)'],
                    ['Gestione abbonamento e fatturazione (P.IVA, SDI, PEC)', 'Obbligo legale e esecuzione del contratto (Art. 6(1)(b)(c) GDPR)'],
                    ['Verifica contabile bonifico tramite AI', 'Esecuzione del contratto (Art. 6(1)(b) GDPR)'],
                    ['Invio comunicazioni commerciali (form landing)', 'Consenso dell\'interessato (Art. 6(1)(a) GDPR)'],
                    ['Analisi statistica del sito (Google Tag Manager / Analytics)', 'Consenso dell\'interessato (Art. 6(1)(a) GDPR)'],
                    ['Sicurezza del sistema e prevenzione abusi', 'Legittimo interesse (Art. 6(1)(f) GDPR)'],
                    ['Adempimento obblighi legali', 'Obbligo legale (Art. 6(1)(c) GDPR)'],
                  ].map(([f, b]) => (
                    <tr key={f}>
                      <td className="p-3 text-gray-700">{f}</td>
                      <td className="p-3 text-gray-500">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Periodo di conservazione</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Dati dei lead:</strong> conservati nell'applicazione per tutta la durata
                del workspace attivo. Il Cliente può esportarli in qualsiasi momento tramite
                la funzione <strong>Export CSV</strong> disponibile nel proprio dashboard.
                Dopo l'export, i dati presenti nel file CSV sono sotto il controllo esclusivo
                del Cliente, che ne diventa <strong>unico Titolare del Trattamento</strong>.
              </li>
              <li>
                <strong>Cancellazione automatica lead:</strong> i dati dei lead vengono rimossi
                automaticamente dall'applicazione entro <strong>30 giorni dalla scadenza
                o dalla disattivazione del workspace</strong>. Il Cliente può richiedere
                la rimozione immediata scrivendo a info@hermesmarketing.it.
              </li>
              <li><strong>Registrazioni vocali e immagini:</strong> non conservate — elaborate in tempo reale dall'AI e immediatamente scartate.</li>
              <li><strong>Dati di fatturazione (P.IVA, SDI, PEC, ecc.):</strong> conservati per 10 anni ai fini degli obblighi fiscali e contabili (Art. 2220 c.c.).</li>
              <li><strong>Dati di contatto (form landing):</strong> conservati fino a revoca del consenso o per un massimo di 3 anni.</li>
              <li><strong>Log tecnici:</strong> conservati per 12 mesi.</li>
              <li><strong>Alla cessazione definitiva del servizio:</strong> tutti i dati residui cancellati entro 30 giorni, salvo obblighi di conservazione legale.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Destinatari e trasferimenti internazionali</h2>
            <p className="mb-3">I dati personali sono trattati da fornitori terzi selezionati (sub-responsabili) con i quali sono stati stipulati appositi accordi ai sensi dell'Art. 28 GDPR:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Fornitore</th>
                    <th className="text-left p-3 font-semibold">Ruolo</th>
                    <th className="text-left p-3 font-semibold">Server</th>
                    <th className="text-left p-3 font-semibold">Garanzia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Supabase Inc.', 'Database / archiviazione dati', 'USA', 'Standard Contractual Clauses (SCCs)'],
                    ['Anthropic PBC', 'Elaborazione AI (testo, audio, immagini)', 'USA', 'Standard Contractual Clauses (SCCs)'],
                    ['Vercel Inc.', 'Hosting applicazione', 'USA/EU', 'Standard Contractual Clauses (SCCs)'],
                    ['Brevo (Sendinblue)', 'Email marketing / form contatto', 'EU (Francia)', 'GDPR compliant'],
                    ['Google LLC (Tag Manager / Analytics)', 'Analisi statistica del sito (solo con consenso)', 'USA/EU', 'Standard Contractual Clauses (SCCs)'],
                  ].map(([f, r, s, g]) => (
                    <tr key={f}>
                      <td className="p-3 font-medium text-gray-700">{f}</td>
                      <td className="p-3 text-gray-600">{r}</td>
                      <td className="p-3 text-gray-600">{s}</td>
                      <td className="p-3 text-gray-500">{g}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              I trasferimenti verso USA avvengono sulla base delle Clausole Contrattuali Standard adottate dalla Commissione Europea (Decisione 2021/914/UE), che garantiscono un livello di protezione adeguato.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Diritti degli interessati</h2>
            <p className="mb-3">Gli interessati hanno diritto di:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Accesso</strong> (Art. 15): ottenere conferma del trattamento e copia dei dati.</li>
              <li><strong>Rettifica</strong> (Art. 16): correggere dati inesatti o incompleti.</li>
              <li><strong>Cancellazione</strong> (Art. 17): ottenere la cancellazione dei dati ("diritto all'oblio").</li>
              <li><strong>Limitazione</strong> (Art. 18): limitare il trattamento in determinati casi.</li>
              <li><strong>Portabilità</strong> (Art. 20): ricevere i propri dati in formato strutturato e leggibile.</li>
              <li><strong>Opposizione</strong> (Art. 21): opporsi al trattamento basato su legittimo interesse.</li>
              <li><strong>Revoca del consenso</strong>: revocare in qualsiasi momento il consenso prestato, senza pregiudizio per la liceità del trattamento anteriore.</li>
            </ul>
            <p className="mt-3">
              Per esercitare i propri diritti, scrivere a: <strong>info@hermesmarketing.it</strong>.
              Risponderemo entro 30 giorni. È inoltre possibile presentare reclamo al <strong>Garante per la Protezione dei Dati Personali</strong> (www.garanteprivacy.it).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Note sul trattamento dei dati dei lead</h2>
            <p>
              VoiceLeads è uno strumento B2B destinato a professionisti commerciali. I dati dei lead
              (contatti commerciali acquisiti dagli utenti) sono trattati su istruzione del cliente
              (azienda titolare del workspace), che agisce come <strong>Titolare autonomo</strong> del
              trattamento nei confronti dei propri contatti. Hermes Marketing agisce come
              <strong> Responsabile del Trattamento</strong> ai sensi dell'Art. 28 GDPR.
            </p>
            <p className="mt-2">
              È responsabilità del cliente assicurarsi di avere una base giuridica valida per
              registrare e trattare i dati dei propri contatti commerciali (es. legittimo interesse
              nell'ambito di relazioni B2B preesistenti o potenziali).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Cookie</h2>
            <p>
              Per informazioni dettagliate sull'uso dei cookie, consulta la nostra{' '}
              <Link href="/cookie" className="text-hermes-500 underline hover:text-hermes-600">
                Cookie Policy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Modifiche alla presente informativa</h2>
            <p>
              Hermes Marketing si riserva il diritto di modificare la presente Privacy Policy in qualsiasi momento.
              Le modifiche saranno pubblicate su questa pagina con aggiornamento della data in alto.
              Per trattamenti significativamente diversi, verrà fornita comunicazione preventiva agli utenti registrati.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-100 px-6 py-8 mt-12">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Hermes Marketing S.r.l.s</span>
          <div className="flex gap-4">
            <Link href="/cookie" className="hover:text-gray-600">Cookie Policy</Link>
            <Link href="/dpa" className="hover:text-gray-600">DPA</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
