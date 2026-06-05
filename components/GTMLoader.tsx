'use client'
import { useEffect, useState } from 'react'
import Script from 'next/script'
import { getConsent } from './CookieBanner'

const GTM_ID = 'GTM-T37HB2TH'

export default function GTMLoader() {
  const [consenso, setConsenso] = useState<string | null>(null)

  useEffect(() => {
    // Leggi consenso iniziale
    setConsenso(getConsent())

    // Ascolta eventuali cambi di consenso (es. dopo che l'utente clicca nel banner)
    const handler = () => setConsenso(getConsent())
    window.addEventListener('cookieConsentChanged', handler)
    return () => window.removeEventListener('cookieConsentChanged', handler)
  }, [])

  if (consenso !== 'accepted') return null

  return (
    <>
      {/* GTM script — caricato solo dopo consenso */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
      {/* GTM noscript fallback */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}
