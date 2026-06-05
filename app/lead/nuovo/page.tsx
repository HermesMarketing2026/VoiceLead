'use client'
import { useSearchParams } from 'next/navigation'
import LeadForm from '@/components/LeadForm'
import AppShell from '@/components/AppShell'
import { Suspense } from 'react'

function NuovoLeadInner() {
  const params = useSearchParams()
  const workspaceId = params.get('workspace_id') ?? ''

  return (
    <AppShell>
      <h1 className="text-xl font-bold mb-5">Nuovo lead</h1>
      <LeadForm workspaceId={workspaceId} />
    </AppShell>
  )
}

export default function NuovoLead() {
  return (
    <Suspense>
      <NuovoLeadInner />
    </Suspense>
  )
}
