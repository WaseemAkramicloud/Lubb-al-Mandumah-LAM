import { getCurrentCustomer } from '@/lib/actions/customer-auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const metadata = {
  title: "My Products & Entitlements | Customer Portal",
}

export default async function CustomerProductsPage() {
  const customer = await getCurrentCustomer()
  if (!customer) return null

  const supabase = getSupabaseAdmin()

  const { data: membership } = await supabase
    .from('customer_company_memberships')
    .select('company_id, company:crm_companies(*)')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .single()

  const company = (membership as any)?.company

  let entitlements: any[] = []
  let userGrantsMap: Record<string, boolean> = {}
  let seatUsageMap: Record<string, number> = {}
  let instancesMap: Record<string, any> = {}

  if (company) {
    // 1. Fetch Entitlements
    const { data: entData } = await supabase
      .from('customer_product_entitlements')
      .select('*, product:cms_products(*)')
      .eq('company_id', company.id)
    entitlements = entData || []

    // 2. Fetch User Grants
    const { data: grants } = await supabase
      .from('customer_product_access')
      .select('product_slug, customer_id')
      .eq('company_id', company.id)
      .eq('status', 'active')

    if (grants) {
      grants.forEach(g => {
        if (g.customer_id === customer.id) {
          userGrantsMap[g.product_slug] = true
        }
        seatUsageMap[g.product_slug] = (seatUsageMap[g.product_slug] || 0) + 1
      })
    }

    // 3. Fetch Product Instance references
    const { data: instances } = await supabase
      .from('customer_product_instances')
      .select('*')
      .eq('company_id', company.id)

    if (instances) {
      instances.forEach(inst => {
        instancesMap[inst.product_slug] = inst
      })
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>
          My Products & Subscriptions
        </h1>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
          Entitled SaaS applications, seat allocations, instance statuses, and direct Single Sign-On launcher.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {entitlements.map(ent => {
          const prod = ent.product || { name: ent.product_slug.toUpperCase(), slug: ent.product_slug, tagline: 'Enterprise SaaS Application' }
          const hasAccess = !!userGrantsMap[ent.product_slug]
          const usedSeats = seatUsageMap[ent.product_slug] || 0
          const maxSeats = ent.max_seats || 10
          const instance = instancesMap[ent.product_slug]

          const ssoLaunchUrl = `/api/sso/authorize?client_id=lam_app_${ent.product_slug}&product=${ent.product_slug}&redirect_uri=https://${ent.product_slug}.lam.com/auth/callback`

          return (
            <div key={ent.id} className="lam-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-white)', marginBottom: '0.25rem' }}>{prod.name}</h3>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--lam-gold)', textTransform: 'uppercase' }}>{ent.product_slug}</span>
                  </div>

                  <span style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background: ent.status === 'active' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                    color: ent.status === 'active' ? '#2ecc71' : '#e74c3c'
                  }}>
                    {ent.status}
                  </span>
                </div>

                <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  {prod.tagline || 'High-performance SaaS application.'}
                </p>

                {/* Seat Usage Bar */}
                <div style={{ marginBottom: '1.5rem', background: 'var(--lam-surface)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--lam-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--lam-silver-dim)' }}>Seat Usage:</span>
                    <span style={{ color: 'var(--lam-white)', fontWeight: 600 }}>{usedSeats} of {maxSeats} Seats Used</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, (usedSeats / maxSeats) * 100)}%`,
                      height: '100%',
                      background: usedSeats >= maxSeats ? '#e74c3c' : 'var(--lam-gold)',
                      borderRadius: '3px',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>

                {/* Instance Reference Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Plan Tier:</span>
                    <span style={{ color: 'var(--lam-white)', textTransform: 'capitalize' }}>{ent.plan_tier}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Instance Ref:</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--lam-silver-light)' }}>
                      {instance ? instance.instance_key : `${ent.product_slug}-${company?.company_id?.toLowerCase() || 'prod'}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Instance Status:</span>
                    <span style={{ color: '#2ecc71', fontWeight: 500 }}>
                      {instance ? instance.status : 'Operational'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Open Product Button */}
              <div>
                {hasAccess ? (
                  <a
                    href={ssoLaunchUrl}
                    className="btn btn-primary"
                    style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.85rem' }}
                  >
                    Open {prod.name} (Direct SSO) →
                  </a>
                ) : (
                  <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(231, 76, 60, 0.08)', border: '1px solid rgba(231, 76, 60, 0.2)', color: '#e74c3c', borderRadius: '4px', fontSize: 'var(--text-xs)' }}>
                    Access Revoked or Not Granted by Admin
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {entitlements.length === 0 && (
          <div className="lam-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--lam-silver-dim)' }}>
            No active product subscriptions found for your organization.
          </div>
        )}
      </div>
    </div>
  )
}
