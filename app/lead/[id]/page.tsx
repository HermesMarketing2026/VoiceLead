import { supabase } from '@/lib/supabase'
import LeadForm from '@/components/LeadForm'
import type { Lead } from '@/lib/types'
import { notFound } from 'next/navigation'

export default async function SchedaLead({ params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) notFound()

  const lead = data as Lead

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">
        {lead.nome} {lead.cognome}
      </h1>
      <p className="text-sm text-gray-500 mb-5">{lead.azienda}</p>
      <LeadForm lead={lead} />
    </div>
  )
}
