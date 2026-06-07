import Link from 'next/link'

export const metadata = { title: 'Termini di Servizio — VoiceLeads' }

export default function TerminiServizio() {
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
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Termini di Servizio</h1>
        <p className="text-sm text-gray-400 mb-10">Ultimo aggiornamento: {aggiornata}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Definizioni e parti contraenti</h2>
            <p>
              I presenti Termini di Servizio regolano l'accesso e l'utilizzo del servizio <strong>VoiceLeads</strong>,
              piattaforma SaaS per la gestione dei lead commerciali tramite input vocale e AI, erogata da:
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mt-3 font-mono text-xs space-y-1">
              <p><strong>Hermes Marketing S.r.l.s</strong> ("Fornitore")</p>
              <p>Piazza Gae Aulenti 1, Torre B — 20124 Milano (MI)</p>
              <p>P.IVA: 14088840963</p>
              <p>Email: info@hermesmarketing.it</p>
            </div>
            <p className="mt-3">
              Il soggetto che sottoscrive un piano di abbonamento e accede al servizio è denominato <strong>"Cliente"</strong>.
              Gli utenti finali abilitati dal Cliente all'interno del proprio workspace (es. commerciali) sono denominati <strong>"Utenti"</strong>.
              L'accettazione dei presenti Termini avviene al momento del completamento dell'acquisto o dell'attivazione del workspace.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Descrizione del servizio</h2>
            <p>VoiceLeads è una piattaforma B2B che consente ai team commerciali di:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Registrare lead tramite input vocale con trascrizione e strutturazione automatica via AI</li>
              <li>Scansionare biglietti da visita con estrazione automatica dei dati di contatto</li>
              <li>Gestire il ciclo di vita delle trattative commerciali (modulo Gestisci)</li>
              <li>Esportare i dati in formato CSV</li>
              <li>Accedere al servizio tramite browser su dispositivi desktop e mobile (PWA)</li>
            </ul>
            <p className="mt-3">
              Il Fornitore si riserva di modificare, aggiornare o integrare le funzionalità del servizio nel tempo,
              comunicando eventuali variazioni significative via email con almeno 15 giorni di anticipo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Piani di abbonamento e pagamento</h2>
            <p>
              VoiceLeads è disponibile nei seguenti piani:
            </p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-gray-700">Piano</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Funzionalità incluse</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Fatturazione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-3 font-medium">Base — Registra</td>
                    <td className="p-3">Registrazione lead vocale, scan biglietti da visita, export CSV</td>
                    <td className="p-3">Mensile o annuale</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Pro — Registra + Gestisci</td>
                    <td className="p-3">Tutto il piano Base + gestione trattative, aggiornamenti vocali AI, diario attività</td>
                    <td className="p-3">Mensile o annuale</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Il pagamento avviene tramite <strong>bonifico bancario anticipato</strong> all'IBAN indicato in fase di checkout.
              L'attivazione del workspace è subordinata alla verifica del pagamento tramite caricamento della ricevuta.
              I prezzi sono espressi in euro e si intendono IVA esclusa (22%).
            </p>
            <p className="mt-3">
              In caso di abbonamento <strong>annuale</strong>, il rinnovo avviene automaticamente salvo disdetta inviata
              via email almeno 30 giorni prima della scadenza. In caso di abbonamento <strong>mensile</strong>, il rinnovo
              avviene mensilmente con le stesse modalità.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Prova gratuita</h2>
            <p>
              Il Fornitore può offrire un periodo di prova gratuita della durata di <strong>14 giorni</strong>.
              Al termine del periodo di prova, il workspace viene sospeso automaticamente e i dati vengono
              conservati per ulteriori 30 giorni prima della cancellazione definitiva, salvo attivazione di un piano a pagamento.
              Non è richiesta carta di credito per attivare la prova gratuita.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Obblighi del Cliente e degli Utenti</h2>
            <p>Il Cliente si impegna a:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Utilizzare il servizio esclusivamente per scopi leciti e conformi alla normativa vigente</li>
              <li>Custodire i PIN di accesso degli Utenti e non condividerli con soggetti non autorizzati</li>
              <li>Raccogliere i dati personali dei propri lead nel rispetto del GDPR, informando gli interessati del trattamento</li>
              <li>Non caricare sul servizio dati di categorie particolari (dati sanitari, giudiziari, biometrici)</li>
              <li>Non tentare di accedere ad aree del servizio non autorizzate o workspace di altri Clienti</li>
              <li>Non utilizzare il servizio per inviare comunicazioni non sollecitate (spam)</li>
              <li>Comunicare tempestivamente eventuali accessi non autorizzati al proprio workspace</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Proprietà intellettuale</h2>
            <p>
              Il Fornitore è titolare esclusivo di tutti i diritti di proprietà intellettuale relativi alla
              piattaforma VoiceLeads, inclusi marchi, loghi, interfacce, codice sorgente e documentazione.
            </p>
            <p className="mt-3">
              Il Cliente rimane l'unico proprietario dei dati inseriti nel servizio (lead, note, registrazioni vocali).
              Concede al Fornitore una licenza limitata, non esclusiva e revocabile per elaborare tali dati
              al solo fine di erogare il servizio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Disponibilità del servizio e SLA</h2>
            <p>
              Il Fornitore si impegna a garantire la disponibilità del servizio per almeno il <strong>99% del tempo</strong>
              su base mensile (escluse manutenzioni programmate). Le manutenzioni vengono comunicate con
              almeno 24 ore di anticipo via email, salvo interventi di emergenza.
            </p>
            <p className="mt-3">
              Il Fornitore non è responsabile di interruzioni causate da: eventi di forza maggiore, guasti
              di infrastrutture terze (Supabase, Vercel, Anthropic), attacchi informatici, o problemi di
              connettività del Cliente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Limitazione di responsabilità</h2>
            <p>
              Il servizio è fornito "così com'è". Il Fornitore non garantisce che l'AI estragga i dati
              in modo sempre accurato e completo — la responsabilità della verifica e della correttezza
              dei dati inseriti rimane in capo al Cliente e agli Utenti.
            </p>
            <p className="mt-3">
              In nessun caso il Fornitore sarà responsabile per danni indiretti, perdita di dati, perdita
              di ricavi o danni consequenziali derivanti dall'uso o dall'impossibilità di usare il servizio.
              La responsabilità massima del Fornitore nei confronti del Cliente è limitata all'importo
              pagato dal Cliente negli ultimi 3 mesi di abbonamento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Sospensione e risoluzione</h2>
            <p>Il Fornitore si riserva di sospendere o terminare l'accesso al servizio nei seguenti casi:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-3">
              <li>Mancato pagamento del canone entro 15 giorni dalla scadenza</li>
              <li>Violazione grave dei presenti Termini di Servizio</li>
              <li>Utilizzo del servizio in modo fraudolento o illecito</li>
              <li>Richiesta esplicita del Cliente</li>
            </ul>
            <p className="mt-3">
              In caso di disdetta da parte del Cliente, i dati rimangono accessibili fino alla naturale
              scadenza del periodo già pagato. Successivamente il workspace viene sospeso e i dati
              conservati per 30 giorni prima della cancellazione definitiva.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Modifiche ai Termini</h2>
            <p>
              Il Fornitore può aggiornare i presenti Termini di Servizio in qualsiasi momento.
              Le modifiche sostanziali saranno comunicate via email con almeno <strong>15 giorni</strong> di preavviso.
              L'utilizzo continuato del servizio dopo tale periodo costituisce accettazione dei nuovi Termini.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Legge applicabile e foro competente</h2>
            <p>
              I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia relativa
              all'interpretazione o all'esecuzione dei presenti Termini, le parti eleggono come foro
              esclusivamente competente il Tribunale di <strong>Milano</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">12. Contatti</h2>
            <p>Per qualsiasi domanda sui presenti Termini di Servizio:</p>
            <div className="bg-gray-50 rounded-xl p-4 mt-3 font-mono text-xs space-y-1">
              <p><strong>Hermes Marketing S.r.l.s</strong></p>
              <p>Email: <a href="mailto:info@hermesmarketing.it" className="text-hermes-500 underline">info@hermesmarketing.it</a></p>
              <p>Piazza Gae Aulenti 1, Torre B — 20124 Milano (MI)</p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-400">
          <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
          <Link href="/cookie" className="hover:text-gray-600">Cookie Policy</Link>
          <Link href="/dpa" className="hover:text-gray-600">DPA</Link>
        </div>
      </main>
    </div>
  )
}
