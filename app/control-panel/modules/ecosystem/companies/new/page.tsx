import { requirePermission } from '@/lib/auth/permissions'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import OnboardingForm from './OnboardingForm'

export const metadata = {
  title: 'Onboard New Client | LΛM Control Panel',
  robots: { index: false, follow: false },
}

export default async function OnboardCustomerPage() {
  await requirePermission('leads_clients', 'edit')

  const adminClient = getSupabaseAdmin()
  const { data: products } = await adminClient
    .from('cms_products')
    .select('slug, name, product_id, lifecycle_status, restricted')
    .eq('lifecycle_status', 'Active')
    .order('name')

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/clients" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Clients
        </Link>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
          Onboard New Client
        </h1>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
          Controlled staff onboarding workflow to provision client organizations, evaluation accounts, SaaS product entitlements, and owner identity.
        </p>
      </div>

      <div style={{ maxWidth: '850px' }}>
        <OnboardingForm products={products || []} />
      </div>
    </div>
  )
}
