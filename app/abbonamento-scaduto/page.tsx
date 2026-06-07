import Link from 'next/link'

export default function AbbonamentoScaduto() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-4xl mx-auto">
          ⏰
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Abbonamento scaduto</h1>
          <p className="text-gray-500 text-sm mt-2">
            Il tuo abbonamento VoiceLead è scaduto.<br />
            Rinnova per continuare ad accedere al workspace.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
          <p className="text-sm text-gray-700">Per rinnovare o per qualsiasi domanda:</p>
          <a
            href="mailto:info@hermesai.it?subject=Rinnovo abbonamento VoiceLead"
            className="block w-full rounded-xl bg-hermes-500 text-white font-bold py-3.5 hover:bg-hermes-600 transition-colors shadow-sm"
          >
            Contatta Hermes →
          </a>
          <p className="text-xs text-gray-400">oppure scrivi a info@hermesai.it</p>
        </div>
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 underline">
          ← Torna alla home
        </Link>
      </div>
    </div>
  )
}
