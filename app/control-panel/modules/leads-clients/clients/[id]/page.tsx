import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ClientDetailClient } from '../ClientDetailClient'

export const metadata = {
  title: "Client Details | LΛM Control Panel",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: Props) {
  await requirePermission('leads_clients', 'view')
  
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: client, error: clientError } = await supabase
    .from('crm_clients')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (clientError || !client) {
    notFound()
  }

  // Fetch linked company
  let company = null
  let contacts: any[] = []
  if (client.company_id) {
    const { data: companyData } = await supabase
      .from('crm_companies')
      .select('id, company_id, name, email, phone, country, city, website, status')
      .eq('id', client.company_id)
      .single()
    company = companyData

    // Fetch contacts for the company
    if (company) {
      const { data: contactsData } = await supabase
        .from('crm_contacts')
        .select('id, first_name, last_name, job_title, email, phone')
        .eq('company_id', company.id)
        .order('created_at')
      contacts = contactsData || []
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/leads-clients/clients" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Clients
        </Link>
      </div>
      
      <ClientDetailClient 
        client={client} 
        company={company}
        contacts={contacts}
      />
    </div>
  )
}
