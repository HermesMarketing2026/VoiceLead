import type { StatoLead } from '@/lib/types'

const CONFIG: Record<StatoLead, { emoji: string; label: string; className: string }> = {
  bozza:     { emoji: '🔴', label: 'Da completare', className: 'bg-red-50 text-red-700' },
  completo:  { emoji: '🟢', label: 'Pronto',        className: 'bg-green-50 text-green-700' },
  esportato: { emoji: '📤', label: 'Esportato',     className: 'bg-orange-50 text-hermes-600' },
}

export default function StatoBadge({ stato }: { stato: StatoLead }) {
  const c = CONFIG[stato]
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.className}`}>
      {c.emoji} {c.label}
    </span>
  )
}
