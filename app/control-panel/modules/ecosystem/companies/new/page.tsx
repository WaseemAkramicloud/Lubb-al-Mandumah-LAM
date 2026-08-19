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
  const { data: lamProducts } = await adminClient
    .from('lam_products')
    .select('slug, name, identity_mode, status')
    .eq('identity_mode', 'lam_sso')
    .eq('status', 'active')
    .order('name')

  const { data: cmsProducts } = await adminClient
    .from('cms_products')
    .select('slug, name, product_id, lifecycle_status, restricted')

  const products = (lamProducts || []).map(lp => {
    const cmsP = cmsProducts?.find(cp => cp.slug === lp.slug)
    return {
      slug: lp.slug,
      name: lp.name || cmsP?.name || lp.slug.toUpperCase(),
      product_id: cmsP?.product_id,
      restricted: cmsP?.restricted,
      identity_mode: lp.identity_mode
    }
  })

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
