'use client'
import { useState } from 'react'

interface FaqItem {
  q: string
  a: string
}

const FAQ_REGISTRA: FaqItem[] = [
  {
    q: 'Come registro un lead con la voce?',
    a: 'Premi il pulsante del microfono e parla liberamente — racconta nome, cognome, azienda, telefono, email e qualsiasi nota utile. L\'AI estrae tutto automaticamente.',
  },
  {
    q: 'Posso caricare la foto di un biglietto da visita?',
    a: 'Sì. Usa il pulsante fotocamera per scattare o caricare un\'immagine. L\'AI legge i dati dal biglietto e li compila nel form.',
  },
  {
    q: 'Cosa sono i lead "da completare"?',
    a: 'Sono lead salvati con campi mancanti (es. niente email o telefono). Aprili e completali prima che scadano.',
  },
  {
    q: 'Dopo quanti giorni sparisce un lead?',
    a: 'I lead restano visibili per 30 giorni dalla registrazione. Passato questo tempo vengono eliminati automaticamente per la privacy. Esporta in CSV per conservarli.',
  },
  {
    q: 'Come esporto i lead in CSV?',
    a: 'Usa il pulsante "Esporta CSV" in alto. Scarica tutti i lead visibili in un file pronto per Excel, Google Sheets o qualsiasi CRM.',
  },
  {
    q: 'Il microfono non parte. Cosa devo fare?',
    a: 'Assicurati di usare Chrome, Edge o Safari su iOS. Vai nelle impostazioni del browser e verifica che il permesso al microfono sia attivo per questo sito.',
  },
]

const FAQ_GESTISCI: FaqItem[] = [
  {
    q: 'Qual è la differenza tra "In trattativa" e "Da richiamare"?',
    a: '"In trattativa" significa che c\'è un\'offerta aperta o una negoziazione in corso. "Da richiamare" indica un contatto che ha bisogno di un follow-up prima di avanzare.',
  },
  {
    q: 'Come segno una trattativa come vinta o persa?',
    a: 'Apri il dettaglio del lead, scorri fino alla sezione esito e seleziona "Vinto" o "Perso". Il sistema registra la data e la durata della trattativa.',
  },
  {
    q: 'Posso riaprire una trattativa chiusa?',
    a: 'Sì. Nella sezione "Chiuse" trovi il pulsante "Riapri" che rimette il lead in lavorazione. Disponibile entro 30 giorni dalla chiusura.',
  },
  {
    q: 'Per quanto restano visibili le trattative chiuse?',
    a: 'Le trattative chiuse (vinte o perse) restano visibili per 30 giorni dalla data di chiusura, poi vengono eliminate per la privacy.',
  },
  {
    q: 'Chi vede i lead nella sezione Gestisci?',
    a: 'Il responsabile può scegliere di vedere i lead di un singolo commerciale. Ogni commerciale vede solo i propri. Il filtro si seleziona al login.',
  },
]

const FAQ_GENERALI: FaqItem[] = [
  {
    q: 'Non ricordo il mio PIN. Come faccio?',
    a: 'Il PIN è stato impostato dal responsabile durante la configurazione. Contattalo direttamente — non è recuperabile dall\'app per motivi di sicurezza.',
  },
  {
    q: 'Posso usare VoiceLeads da più dispositivi?',
    a: 'Sì, da qualsiasi dispositivo con lo stesso PIN. Ogni sessione è indipendente e le registrazioni sono sincronizzate in tempo reale.',
  },
  {
    q: 'Cosa succede ai miei dati se l\'abbonamento scade?',
    a: 'I dati vengono conservati per 30 giorni dopo la scadenza. Puoi esportarli in CSV in qualsiasi momento durante questo periodo.',
  },
  {
    q: 'Come posso richiedere la cancellazione dei miei dati?',
    a: 'Scrivi a info@hermesmarketing.it con oggetto "Richiesta cancellazione dati" indicando il workspace. Provvediamo entro 30 giorni (Art. 17 GDPR).',
  },
]

function FaqGroup({ titolo, items }: { titolo: string; items: FaqItem[] }) {
  const [aperta, setAperta] = useState<number | null>(null)
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{titolo}</p>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map(({ q, a }, i) => (
          <div key={i}>
            <button
              onClick={() => setAperta(aperta === i ? null : i)}
              className="w-full flex items-start justify-between px-5 py-3.5 text-left gap-3 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm text-gray-700 font-medium leading-snug">{q}</p>
              <span className="text-gray-300 text-base shrink-0 mt-0.5 transition-transform duration-150"
                style={{ display: 'inline-block', transform: aperta === i ? 'rotate(45deg)' : 'none' }}>+</span>
            </button>
            {aperta === i && (
              <div className="px-5 pb-4">
                <p className="text-xs text-gray-500 leading-relaxed">{a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function FaqRegistra() {
  return (
    <div className="space-y-3 pt-2">
      <FaqGroup titolo="Come usare Registra" items={FAQ_REGISTRA} />
      <FaqGroup titolo="Domande generali" items={FAQ_GENERALI} />
    </div>
  )
}

export function FaqGestisci() {
  return (
    <div className="space-y-3 pt-2">
      <FaqGroup titolo="Come usare Gestisci" items={FAQ_GESTISCI} />
      <FaqGroup titolo="Domande generali" items={FAQ_GENERALI} />
    </div>
  )
}
