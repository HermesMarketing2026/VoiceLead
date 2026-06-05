import Link from 'next/link'

export const metadata = { title: 'Data Processing Agreement — VoiceLeads' }

export default function DPA() {
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
        <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Documento legale — Art. 28 GDPR
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Accordo sul Trattamento dei Dati<br />
          <span className="text-gray-400 font-normal text-xl">(Data Processing Agreement)</span>
        </h1>
        <p className="text-sm text-gray-400 mb-2">Versione: 1.0 — {aggiornata}</p>
        <p className="text-sm text-gray-500 mb-10">
          Il presente accordo viene stipulato automaticamente all'attivazione di un workspace VoiceLeads
          tra Hermes Marketing (Responsabile del Trattamento) e il Cliente (Titolare del Trattamento).
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Parti</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Responsabile del Trattamento</p>
                <p className="font-semibold">Hermes Marketing</p>
                <p className="text-xs text-gray-500 mt-1">Via [indirizzo] — P.IVA [numero]</p>
                <p className="text-xs text-gray-500">privacy@hermesmarketing.it</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Titolare del Trattamento</p>
                <p className="font-semibold">Il Cliente</p>
                <p className="text-xs text-gray-500 mt-1">L'azienda che attiva il workspace VoiceLeads</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Oggetto e durata</h2>
            <p>
              Il presente accordo disciplina il trattamento dei dati personali effettuato da Hermes Marketing
              per conto del Cliente nell'ambito dell'erogazione del servizio VoiceLeads.
              La durata coincide con quella del contratto di servizio e cessa automaticamente alla
              disattivazione del workspace.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Natura e finalità del trattamento</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Elemento</th>
                    <th className="text-left p-3 font-semibold">Dettaglio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Finalità', 'Registrazione, archiviazione ed esportazione di dati di contatti commerciali (lead)'],
                    ['Natura', 'Raccolta, strutturazione, conservazione, trasmissione, cancellazione'],
                    ['Tipologia di dati', 'Dati comuni: nome, cognome, azienda, email, telefono, note'],
                    ['Categorie di interessati', 'Contatti commerciali (lead) acquisiti dai commerciali del Cliente'],
                    ['Durata', 'Per tutta la durata del contratto + 30 giorni per la cancellazione'],
                  ].map(([e, d]) => (
                    <tr key={e}>
                      <td className="p-3 font-medium text-gray-700">{e}</td>
                      <td className="p-3 text-gray-600">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Obblighi del Responsabile (Hermes Marketing)</h2>
            <p className="mb-3">Hermes Marketing si impegna a:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Trattare i dati personali esclusivamente su istruzione documentata del Cliente.</li>
              <li>Garantire che le persone autorizzate al trattamento abbiano assunto impegni di riservatezza.</li>
              <li>Adottare tutte le misure di sicurezza richieste dall'Art. 32 GDPR.</li>
              <li>Non ricorrere a sub-responsabili senza previa autorizzazione scritta del Cliente (vedi Art. 5).</li>
              <li>Assistere il Cliente nell'adempimento degli obblighi relativi ai diritti degli interessati.</li>
              <li>Cancellare o restituire tutti i dati personali al termine della prestazione dei servizi.</li>
              <li>Mettere a disposizione del Cliente tutte le informazioni necessarie per dimostrare il rispetto degli obblighi.</li>
              <li>Notificare eventuali violazioni dei dati (data breach) al Cliente entro 24 ore dalla scoperta.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Sub-responsabili autorizzati</h2>
            <p className="mb-3">
              Il Cliente autorizza l'utilizzo dei seguenti sub-responsabili, con i quali Hermes Marketing
              ha stipulato accordi conformi all'Art. 28 GDPR:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold">Sub-responsabile</th>
                    <th className="text-left p-3 font-semibold">Attività</th>
                    <th className="text-left p-3 font-semibold">Sede</th>
                    <th className="text-left p-3 font-semibold">Garanzia trasferimento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ['Supabase Inc.', 'Database e archiviazione', 'USA', 'SCCs UE 2021/914'],
                    ['Anthropic PBC', 'Elaborazione AI', 'USA', 'SCCs UE 2021/914'],
                    ['Vercel Inc.', 'Hosting applicazione', 'USA/EU', 'SCCs UE 2021/914'],
                  ].map(([s, a, sede, g]) => (
                    <tr key={s}>
                      <td className="p-3 font-medium text-gray-700">{s}</td>
                      <td className="p-3 text-gray-600">{a}</td>
                      <td className="p-3 text-gray-600">{sede}</td>
                      <td className="p-3 text-gray-500">{g}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Hermes Marketing si impegna a informare il Cliente di eventuali modifiche ai sub-responsabili
              con almeno 30 giorni di preavviso, consentendo al Cliente di opporsi.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Misure di sicurezza</h2>
            <p className="mb-3">Hermes Marketing adotta le seguenti misure tecniche e organizzative:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Crittografia dei dati in transito (TLS 1.3) e a riposo (AES-256)</li>
              <li>Accesso ai workspace protetto da PIN individuale</li>
              <li>Isolamento dei dati per workspace (ogni cliente accede solo ai propri dati)</li>
              <li>Registrazioni vocali e immagini non conservate — elaborate in real-time e scartate</li>
              <li>Aggiornamenti di sicurezza regolari dell'infrastruttura</li>
              <li>Accesso amministrativo limitato al personale autorizzato</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Obblighi del Cliente (Titolare)</h2>
            <p className="mb-3">Il Cliente si impegna a:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Fornire istruzioni lecite e documentate per il trattamento dei dati.</li>
              <li>Assicurarsi di avere una base giuridica valida per raccogliere i dati dei propri contatti commerciali.</li>
              <li>Informare adeguatamente i propri contatti commerciali del trattamento dei loro dati.</li>
              <li>Non inserire nella piattaforma categorie particolari di dati (salute, origine etnica, ecc.).</li>
              <li>Gestire tempestivamente le richieste di esercizio dei diritti degli interessati.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Cancellazione dei dati e trasferimento di responsabilità</h2>
            <p className="mb-3">
              VoiceLeads è progettato come <strong>sistema di raccolta temporanea</strong>: i lead
              vengono acquisiti tramite l'app e trasferiti sul Google Sheets del Cliente, che
              rappresenta il sistema di archiviazione definitivo del Cliente stesso.
            </p>
            <ul className="list-disc pl-5 space-y-2 mb-3">
              <li>
                <strong>Lead esportati:</strong> rimossi automaticamente da VoiceLeads entro
                30 giorni dall'esportazione. Il Cliente può richiedere la rimozione immediata
                tramite la funzione "Svuota archivio" nel proprio dashboard.
              </li>
              <li>
                <strong>Dopo l'esportazione su Google Sheets:</strong> il Cliente diventa unico
                Titolare del Trattamento per quei dati. Hermes Marketing non ha accesso al
                Google Sheets del Cliente e non è responsabile del trattamento successivo.
              </li>
              <li>
                <strong>Alla cessazione del contratto:</strong> cancellazione di tutti i dati
                residui entro 30 giorni. Su richiesta, export completo in CSV prima della cancellazione.
              </li>
            </ul>
            <p className="text-xs text-gray-500">
              Per richiedere export o cancellazione anticipata: <strong>privacy@hermesmarketing.it</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Legge applicabile e foro competente</h2>
            <p>
              Il presente accordo è regolato dal diritto italiano e dal Regolamento UE 2016/679 (GDPR).
              Per qualsiasi controversia è competente il Tribunale di [inserire città sede Hermes Marketing].
            </p>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mt-8">
            <p className="text-xs text-blue-700 font-semibold mb-2">📋 Come formalizzare questo accordo</p>
            <p className="text-xs text-blue-600 leading-relaxed">
              Per i clienti che necessitano di un DPA firmato in formato cartaceo o PDF (es. grandi aziende,
              enti pubblici), scrivere a <strong>privacy@hermesmarketing.it</strong>.
              Provvederemo a inviare il documento completo con firma digitale entro 5 giorni lavorativi.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 px-6 py-8 mt-12">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>© {new Date().getFullYear()} Hermes Marketing</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
            <Link href="/cookie" className="hover:text-gray-600">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
