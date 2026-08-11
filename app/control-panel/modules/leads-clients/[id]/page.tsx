import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LeadDetailClient } from '../LeadDetailClient'

export const metadata = {
  title: "Lead Details | LΛM Control Panel",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: Props) {
  await requirePermission('leads_clients', 'view')
  
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: lead, error: leadError } = await supabase
    .from('crm_leads')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (leadError || !lead) {
    notFound()
  }

  const { data: staffList } = await supabase
    .from('staff_profiles')
    .select('id, first_name, last_name')
    .eq('status', 'active')
    .order('first_name')

  const { data: auditLogs } = await supabase
    .from('crm_audit_logs')
    .select('*, staff_profiles(first_name, last_name)')
    .eq('lead_id', lead.id)
    .order('created_at', { ascending: false })

  // Resolve product name from product_slug if set
  let productName: string | null = null
  if (lead.product_slug) {
    const { data: product } = await supabase
      .from('cms_products')
      .select('name')
      .eq('slug', lead.product_slug)
      .single()
    productName = product?.name || null
  }

  // Fetch companies for the "Link to Existing Company" dropdown
  const { data: companies } = await supabase
    .from('crm_companies')
    .select('id, name')
    .order('name')

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/leads-clients" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Leads
        </Link>
      </div>
      
      <LeadDetailClient 
        lead={lead} 
        staffList={staffList || []} 
        auditLogs={auditLogs || []}
        productName={productName}
        companies={companies || []}
      />
    </div>
  )
}
