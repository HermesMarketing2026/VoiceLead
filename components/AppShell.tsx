import HermesAI from './HermesAI'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-center">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.png" alt="VoiceLeads" className="h-7 w-7" />
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-sm tracking-tight text-gray-900">VoiceLeads</span>
            <span className="text-[10px] font-medium tracking-wide" style={{ background: 'linear-gradient(135deg, #ff7930, #ff4500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              by Hermes Marketing
            </span>
          </div>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
      <footer className="max-w-2xl mx-auto px-4 pb-8 pt-2 flex items-center justify-center gap-4 flex-wrap">
        <a href="/privacy" target="_blank" className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors">Privacy Policy</a>
        <a href="/termini" target="_blank" className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors">Termini di Servizio</a>
        <a href="/dpa" target="_blank" className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors">DPA</a>
        <a href="mailto:info@hermesmarketing.it?subject=Richiesta cancellazione dati&body=Workspace: " className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors">Cancellazione dati (Art. 17)</a>
        <a href="mailto:info@hermesmarketing.it?subject=Richiesta export dati&body=Workspace: " className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors">Export dati (Art. 20)</a>
      </footer>
      <HermesAI />
    </div>
  )
}
