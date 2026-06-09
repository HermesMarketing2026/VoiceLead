'use client'

export default function ManageCookiesButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event('openCookieBanner'))}
      className={className}
    >
      Modifica preferenze cookie
    </button>
  )
}
