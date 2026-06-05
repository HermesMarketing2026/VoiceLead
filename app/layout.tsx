import type { Metadata, Viewport } from 'next'
import './globals.css'
import InstallBanner from '@/components/InstallBanner'

export const viewport: Viewport = {
  themeColor: '#E05A1F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'VoiceLeads by Hermes Marketing',
  description: 'Registra lead commerciali con la voce',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VoiceLeads',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VoiceLeads" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-gray-50 min-h-screen text-gray-900 antialiased">
        <header className="bg-white border-b border-gray-200 px-4 py-4 flex flex-col items-center sticky top-0 z-10 shadow-sm">
          <img src="/favicon.png" alt="VoiceLeads" className="h-10 w-auto mb-1" />
          <div className="flex flex-col items-center leading-tight">
            <span className="font-bold text-base tracking-tight text-gray-900">VoiceLeads</span>
            <span className="text-xs text-gray-400 tracking-wide">by Hermes Marketing</span>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
        <footer className="text-center py-6 text-xs text-gray-300">
          © {new Date().getFullYear()} Hermes Marketing — Web &amp; Comunicazione
        </footer>
        <InstallBanner />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `
        }} />
      </body>
    </html>
  )
}
