import { requirePermission } from '@/lib/auth/permissions'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { EntitlementsClient } from './EntitlementsClient'

export const metadata = {
  title: "Product Entitlements | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function EntitlementsPage() {
  await requirePermission('leads_clients', 'view')

  const adminClient = getSupabaseAdmin()

  // Fetch all entitlements
  const { data: entitlements, error } = await adminClient
    .from('customer_product_entitlements')
    .select('*, company:crm_companies(id, name, company_id), product:cms_products(name, slug)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching entitlements:", error)
  }

  // Fetch companies for grant dropdown
  const { data: companies } = await adminClient
    .from('crm_companies')
    .select('id, name, company_id')
    .order('name')

  // Fetch products for grant dropdown
  const { data: products } = await adminClient
    .from('cms_products')
    .select('slug, name')
    .order('name')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.25rem' }}>
            Products & Subscriptions Manager
          </h1>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
            Assign, upgrade, or suspend client product subscriptions and seat allowances across the ecosystem.
          </p>
        </div>
        <Link href="/control-panel/clients" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Clients
        </Link>
      </div>

      <EntitlementsClient
        entitlements={entitlements || []}
        companies={companies || []}
        products={products || []}
      />
    </div>
  )
}
