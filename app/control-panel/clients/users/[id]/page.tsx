import { requirePermission } from '@/lib/auth/permissions'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { UserDetailClient } from './UserDetailClient'

export const metadata = {
  title: 'Client User Detail | LΛM Control Panel',
  robots: { index: false, follow: false },
}

export default async function ClientUserDetailPage(props: { params: Promise<{ id: string }> }) {
  await requirePermission('user_management', 'view')
  const { id } = await props.params

  const adminClient = getSupabaseAdmin()

  // Fetch target customer identity profile
  const { data: identity, error } = await adminClient
    .from('customer_identities')
    .select(`
      *,
      memberships:customer_company_memberships(
        id, company_role, status,
        company:crm_companies(id, name, company_id, status)
      ),
      product_access:customer_product_access(
        id, product_slug, status,
        company:crm_companies(id, name)
      )
    `)
    .eq('id', id)
    .maybeSingle()

  if (error || !identity) {
    notFound()
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/control-panel/clients/users" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Client Users Directory
        </Link>
      </div>

      <UserDetailClient identity={identity} />
    </div>
  )
}
