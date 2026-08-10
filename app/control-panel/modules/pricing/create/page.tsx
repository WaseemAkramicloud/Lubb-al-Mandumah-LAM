import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'
import PricingForm from '../PricingForm'

export const metadata = {
  title: "Create Pricing Plan | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function CreatePricingPage() {
  await requirePermission('pricing_plans', 'manage_pricing')
  
  const supabase = await createClient()

  // Fetch products to populate the related product dropdown
  const { data: products } = await supabase
    .from('cms_products')
    .select('slug, title')
    .eq('status', 'published')
    .order('title', { ascending: true })

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/pricing" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Pricing
        </Link>
      </div>

      <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '2rem' }}>
        Create Pricing Plan
      </h1>
      
      <PricingForm products={products || []} />
    </div>
  )
}
