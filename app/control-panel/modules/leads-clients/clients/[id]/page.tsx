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

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/leads-clients/clients" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Clients
        </Link>
      </div>
      
      <ClientDetailClient client={client} />
    </div>
  )
}
