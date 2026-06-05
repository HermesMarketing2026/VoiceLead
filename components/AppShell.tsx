export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex flex-col items-center sticky top-0 z-10 shadow-sm">
        <img src="/favicon.png" alt="VoiceLeads" className="h-10 w-auto mb-1" />
        <div className="flex flex-col items-center leading-tight">
          <span className="font-bold text-base tracking-tight text-gray-900">VoiceLeads</span>
          <span className="text-xs text-gray-400 tracking-wide">by Hermes Marketing</span>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6">{children}</div>
    </div>
  )
}
