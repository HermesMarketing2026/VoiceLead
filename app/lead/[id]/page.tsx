'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import LeadForm from '@/components/LeadForm'
import AppShell from '@/components/AppShell'
import type { Lead } from '@/lib/types'

function SchedaLeadInner({ id }: { id: string }) {
  const params = useSearchParams()
  const workspaceId = params.get('workspace_id') ?? ''
  const [lead, setLead] = useState<Lead | null>(null)

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then(r => r.json())
      .then(setLead)
  }, [id])

  if (!lead) return <AppShell><p className="text-center text-gray-400 py-12">Caricamento…</p></AppShell>

  return (
    <AppShell>
      <h1 className="text-xl font-bold mb-1">{lead.nome} {lead.cognome}</h1>
      <p className="text-sm text-gray-500 mb-5">{lead.azienda}</p>
      <LeadForm lead={lead} workspaceId={workspaceId} />
    </AppShell>
  )
}

export default function SchedaLead({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <SchedaLeadInner id={params.id} />
    </Suspense>
  )
}
