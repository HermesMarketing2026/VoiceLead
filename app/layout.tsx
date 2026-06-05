import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VoiceLeads by Hermes Marketing',
  description: 'Registra lead commerciali con la voce',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-gray-50 min-h-screen text-gray-900 antialiased">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
          <img src="/logo-hermes.png" alt="Hermes Marketing" className="h-8 w-auto" />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm tracking-tight text-gray-900">VoiceLeads</span>
            <span className="text-xs text-gray-400 tracking-wide">by Hermes Marketing</span>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
        <footer className="text-center py-6 text-xs text-gray-300">
          © {new Date().getFullYear()} Hermes Marketing — Web &amp; Comunicazione
        </footer>
      </body>
    </html>
  )
}
