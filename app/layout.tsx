import type { Metadata, Viewport } from 'next'
import './globals.css'
import InstallBanner from '@/components/InstallBanner'
import CookieBanner from '@/components/CookieBanner'

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
        <link rel="stylesheet" href="https://sibforms.com/forms/end-form/build/sib-styles.css" />
        <style>{`
          #sib-container input::placeholder { font-family: Helvetica, sans-serif; text-align: left; color: #c0ccda; }
          #sib-container textarea::placeholder { font-family: Helvetica, sans-serif; text-align: left; color: #c0ccda; }
          #sib-container a { text-decoration: underline; color: #2BB2FC; }
          :where(.sib-form-message-panel) { display: none; }
        `}</style>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VoiceLeads" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-gray-50 min-h-screen text-gray-900 antialiased">
        <main>{children}</main>
        <InstallBanner />
        <CookieBanner />
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
