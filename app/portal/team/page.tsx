import { getCurrentCustomer } from '@/lib/actions/customer-auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { TeamAccessClient } from './TeamAccessClient'

export const metadata = {
  title: "Team & Access Control | Customer Portal",
}

export default async function CustomerTeamPage() {
  const customer = await getCurrentCustomer()
  if (!customer) return null

  const supabase = getSupabaseAdmin()

  // Fetch company membership
  const { data: membership } = await supabase
    .from('customer_company_memberships')
    .select('company_role, company_id, company:crm_companies(*)')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .single()

  const company = (membership as any)?.company
  const userRole = membership?.company_role || 'member'

  // Fetch team members in this company
  let members: any[] = []
  if (company) {
    const { data: memData } = await supabase
      .from('customer_company_memberships')
      .select('*, customer:customer_identities(*)')
      .eq('company_id', company.id)
    members = memData || []
  }

  // Fetch company entitlements
  let entitlements: any[] = []
  if (company) {
    const { data: entData } = await supabase
      .from('customer_product_entitlements')
      .select('product_slug')
      .eq('company_id', company.id)
      .eq('status', 'active')
    entitlements = entData || []
  }

  // Fetch all explicit product grants in this company
  let grants: any[] = []
  if (company) {
    const { data: grantData } = await supabase
      .from('customer_product_access')
      .select('*')
      .eq('company_id', company.id)
      .eq('status', 'active')
    grants = grantData || []
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>
          Team Directory & Explicit Product Access
        </h1>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
          Manage team members for <strong style={{ color: 'var(--lam-gold)' }}>{company?.name}</strong> and explicitly control product access per user.
        </p>
      </div>

      <TeamAccessClient
        companyId={company?.id}
        currentCustomerId={customer.id}
        userRole={userRole}
        members={members}
        entitledProducts={entitlements.map(e => e.product_slug)}
        grants={grants}
      />
    </div>
  )
}
