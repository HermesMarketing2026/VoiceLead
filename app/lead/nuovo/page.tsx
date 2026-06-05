'use client'
import { useSearchParams } from 'next/navigation'
import LeadForm from '@/components/LeadForm'
import { Suspense } from 'react'

function NuovoLeadInner() {
  const params = useSearchParams()
  const workspaceId = params.get('workspace_id') ?? ''

  return (
    <div>
      <h1 className="text-xl font-bold mb-5">Nuovo lead</h1>
      <LeadForm workspaceId={workspaceId} />
    </div>
  )
}

export default function NuovoLead() {
  return (
    <Suspense>
      <NuovoLeadInner />
    </Suspense>
  )
}
