export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-950 min-h-screen">
      <header className="sticky top-0 z-10 px-4 py-3 flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #09090b 0%, rgba(9,9,11,0.95) 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2.5">
          <img src="/favicon.png" alt="VoiceLeads" className="h-7 w-7" />
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-sm tracking-tight text-white">VoiceLeads</span>
            <span className="text-[10px] font-medium tracking-wide" style={{ background: 'linear-gradient(135deg, #ff7930, #ffb347)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              by Hermes Marketing
            </span>
          </div>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
      <footer className="max-w-2xl mx-auto px-4 pb-8 pt-2 flex items-center justify-center gap-4 flex-wrap">
        <a href="/privacy" target="_blank" className="text-[10px] text-white/15 hover:text-white/35 transition-colors">Privacy Policy</a>
        <a href="/dpa" target="_blank" className="text-[10px] text-white/15 hover:text-white/35 transition-colors">DPA</a>
        <a href="mailto:info@hermesmarketing.it?subject=Richiesta cancellazione dati&body=Workspace: " className="text-[10px] text-white/15 hover:text-white/35 transition-colors">Cancellazione dati (Art. 17)</a>
        <a href="mailto:info@hermesmarketing.it?subject=Richiesta export dati&body=Workspace: " className="text-[10px] text-white/15 hover:text-white/35 transition-colors">Export dati (Art. 20)</a>
      </footer>
    </div>
  )
}
