import { requirePermission } from '@/lib/auth/permissions'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { IdentitiesClient } from './IdentitiesClient'

export const metadata = {
  title: "Customer Identities | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function CustomerIdentitiesPage() {
  await requirePermission('user_management', 'view')

  const adminClient = getSupabaseAdmin()

  // Fetch customer identities with company memberships
  const { data: identities, error } = await adminClient
    .from('customer_identities')
    .select(`
      *,
      memberships:customer_company_memberships(
        company_role, status,
        company:crm_companies(name, company_id)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching customer identities:", error)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.25rem' }}>
            Client Users Directory
          </h1>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
            Central directory of client account users, company memberships, and access controls.
          </p>
        </div>
        <Link href="/control-panel/clients" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Clients
        </Link>
      </div>

      <IdentitiesClient identities={identities || []} />
    </div>
  )
}
