import { requirePermission } from '@/lib/auth/permissions'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { InstancesClient } from './InstancesClient'

export const metadata = {
  title: "Product Instances | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function ProductInstancesPage() {
  await requirePermission('products', 'view')

  const adminClient = getSupabaseAdmin()

  // Fetch instances
  const { data: instances, error } = await adminClient
    .from('customer_product_instances')
    .select('*, company:crm_companies(id, name, company_id), product:cms_products(name, slug)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching instances:", error)
  }

  // Fetch companies for dropdown
  const { data: companies } = await adminClient
    .from('crm_companies')
    .select('id, name, company_id')
    .order('name')

  // Fetch products for dropdown
  const { data: products } = await adminClient
    .from('cms_products')
    .select('slug, name')
    .order('name')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.25rem' }}>
            Product Instances Registry
          </h1>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
            Register tenant keys, application environment URLs, and integration health statuses.
          </p>
        </div>
        <Link href="/control-panel/modules/ecosystem" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Ecosystem Admin
        </Link>
      </div>

      <InstancesClient
        instances={instances || []}
        companies={companies || []}
        products={products || []}
      />
    </div>
  )
}
