import { createClient } from '@/lib/supabase/server'
import { requirePermission, fetchUserPermissions } from '@/lib/auth/permissions'
import Link from 'next/link'
import { PricingListClient } from './PricingListClient'

export const metadata = {
  title: "Pricing & Plans | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function PricingListPage() {
  await requirePermission('pricing_plans', 'view')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isSuperadmin = user?.user_metadata?.role === 'super_admin'
  const permissions = user ? await fetchUserPermissions(user.id) : {}

  const canEdit = isSuperadmin || !!permissions.pricing_plans?.includes('edit')
  const canPublish = isSuperadmin || !!permissions.pricing_plans?.includes('publish')
  const canManage = isSuperadmin || !!permissions.pricing_plans?.includes('manage_pricing')

  const { data: plans, error } = await supabase
    .from('cms_pricing_plans')
    .select('*')
    .neq('status', 'archived')
    .order('product_slug', { ascending: true })
    .order('order_index', { ascending: true })

  if (error) {
    console.error("Error fetching pricing plans:", error)
  }

  // Group plans by product
  const groupedPlans = (plans || []).reduce((acc: any, plan: any) => {
    if (!acc[plan.product_slug]) acc[plan.product_slug] = []
    acc[plan.product_slug].push(plan)
    return acc
  }, {})

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)' }}>
            Pricing & Plans
          </h1>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginTop: '0.5rem' }}>
            Manage commercial pricing tiers, contact-sales gateways, and plan features.
          </p>
        </div>
        
        {canManage && (
          <Link href="/control-panel/modules/pricing/create" className="btn btn-primary">
            + New Plan
          </Link>
        )}
      </div>

      {Object.keys(groupedPlans).length === 0 ? (
        <div className="lam-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: 'var(--lam-silver-dim)', marginBottom: '1rem' }}>No active pricing plans found.</p>
          {canManage && (
            <Link href="/control-panel/modules/pricing/create" className="btn btn-primary">
              Create First Plan
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {Object.entries(groupedPlans).map(([productSlug, productPlans]: [string, any]) => (
            <div key={productSlug}>
              <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Product: {productSlug}
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {productPlans.map((plan: any) => (
                  <div key={plan.id} className="lam-card" style={{ display: 'flex', flexDirection: 'column', borderTop: plan.status === 'published' ? '3px solid #2ecc71' : '3px solid #f1c40f' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-white)' }}>{plan.plan_name}</h3>
                      <span style={{ 
                        fontSize: 'var(--text-xs)', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        background: plan.status === 'published' ? 'rgba(46,204,113,0.1)' : 'rgba(241,196,15,0.1)',
                        color: plan.status === 'published' ? '#2ecc71' : '#f1c40f',
                        textTransform: 'uppercase',
                        fontWeight: 600
                      }}>
                        {plan.status}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--lam-white)' }}>
                        {plan.currency}{plan.display_price}
                      </span>
                      <span style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginLeft: '0.25rem' }}>
                        {plan.billing_period_label}
                      </span>
                    </div>
                    
                    <div style={{ flex: 1, marginBottom: '2rem' }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {plan.features.slice(0, 4).map((f: string, i: number) => (
                          <li key={i} style={{ color: 'var(--lam-silver)', fontSize: 'var(--text-sm)', display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--lam-gold)' }}>✓</span> {f}
                          </li>
                        ))}
                        {plan.features.length > 4 && (
                          <li style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
                            + {plan.features.length - 4} more features
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <PricingListClient 
                      plan={plan} 
                      canEdit={canEdit} 
                      canPublish={canPublish} 
                      canManage={canManage} 
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
