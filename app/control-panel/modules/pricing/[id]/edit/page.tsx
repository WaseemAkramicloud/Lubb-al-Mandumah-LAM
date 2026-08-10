import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PricingForm from '../../PricingForm'

export const metadata = {
  title: "Edit Pricing Plan | LΛM Control Panel",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditPricingPage({ params }: Props) {
  await requirePermission('pricing_plans', 'edit')
  
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: plan, error } = await supabase
    .from('cms_pricing_plans')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !plan) {
    notFound()
  }

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
        Edit Plan: {plan.plan_name}
      </h1>
      
      <PricingForm initialData={plan} products={products || []} />
    </div>
  )
}
