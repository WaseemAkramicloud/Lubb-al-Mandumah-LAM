import { getCurrentCustomer } from '@/lib/actions/customer-auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'

export default async function CustomerDashboardPage() {
  const customer = await getCurrentCustomer()
  if (!customer) return null

  const supabase = getSupabaseAdmin()

  // Fetch company membership
  const { data: membership } = await supabase
    .from('customer_company_memberships')
    .select('company_role, company_id, company:crm_companies(*)')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .single()

  const company = (membership as any)?.company
  const companyRole = membership?.company_role || 'member'

  // Fetch company entitlements
  let entitlements: any[] = []
  if (company) {
    const { data: entData } = await supabase
      .from('customer_product_entitlements')
      .select('*, product:cms_products(*)')
      .eq('company_id', company.id)
      .eq('status', 'active')
    entitlements = entData || []
  }

  // Fetch explicit user product access grants
  let userGrants: string[] = []
  if (company) {
    const { data: accessData } = await supabase
      .from('customer_product_access')
      .select('product_slug')
      .eq('customer_id', customer.id)
      .eq('company_id', company.id)
      .eq('status', 'active')
    userGrants = (accessData || []).map(a => a.product_slug)
  }

  // Map products with access status
  const productsWithAccess = entitlements.map(ent => {
    const prod = ent.product || { name: ent.product_slug.toUpperCase(), slug: ent.product_slug }
    const hasExplicitAccess = userGrants.includes(ent.product_slug)
    
    // Direct launch URL or SSO authorize URL
    const ssoLaunchUrl = `/api/sso/authorize?client_id=lam_app_${ent.product_slug}&product=${ent.product_slug}&redirect_uri=https://${ent.product_slug}.lam.com/auth/callback`

    return {
      slug: ent.product_slug,
      name: prod.name,
      tagline: prod.tagline || 'SaaS Application',
      category: prod.category || 'LAM Core SaaS',
      planTier: ent.plan_tier,
      maxSeats: ent.max_seats,
      hasExplicitAccess,
      ssoLaunchUrl
    }
  })

  return (
    <div>
      {/* Hero Welcome Banner */}
      <div className="lam-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.08) 0%, rgba(20, 20, 20, 0.9) 100%)', border: '1px solid rgba(201, 168, 76, 0.2)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>
          Welcome back, {customer.first_name}!
        </h1>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
          Organization Account: <strong style={{ color: 'var(--lam-gold)' }}>{company?.name || 'My Organization'}</strong> • Your Role: <span style={{ textTransform: 'capitalize', color: 'var(--lam-white)' }}>{companyRole}</span>
        </p>
      </div>

      {/* Product Applications Launchpad */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-white)' }}>
            Product Launchpad
          </h2>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase' }}>
            Single Sign-On Enabled
          </span>
        </div>

        {productsWithAccess.length === 0 ? (
          <div className="lam-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--lam-silver-dim)' }}>
            No active product subscriptions found for your organization.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {productsWithAccess.map(prod => (
              <div key={prod.slug} className="lam-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '0.25rem' }}>{prod.name}</h3>
                      <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--lam-gold)', textTransform: 'uppercase' }}>{prod.slug}</span>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '3px',
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: prod.hasExplicitAccess ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                      color: prod.hasExplicitAccess ? '#2ecc71' : '#e74c3c'
                    }}>
                      {prod.hasExplicitAccess ? 'Access Granted' : 'No User Grant'}
                    </span>
                  </div>

                  <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    {prod.tagline}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', marginBottom: '1rem', borderTop: '1px solid var(--lam-border)', paddingTop: '0.75rem' }}>
                    <span>Plan: <strong style={{ color: 'var(--lam-silver-light)', textTransform: 'capitalize' }}>{prod.planTier}</strong></span>
                    <span>Seats: <strong style={{ color: 'var(--lam-silver-light)' }}>{prod.maxSeats}</strong></span>
                  </div>

                  {prod.hasExplicitAccess ? (
                    <a
                      href={prod.ssoLaunchUrl}
                      className="btn btn-primary"
                      style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.75rem' }}
                    >
                      Launch {prod.name} via SSO →
                    </a>
                  ) : (
                    <button
                      disabled
                      className="btn"
                      style={{ width: '100%', padding: '0.75rem', background: 'var(--lam-surface)', color: 'var(--lam-silver-dim)', border: '1px solid var(--lam-border)', opacity: 0.6 }}
                    >
                      Access Not Granted by Admin
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="lam-card">
          <h3 style={{ fontSize: 'var(--text-md)', color: 'var(--lam-gold)', marginBottom: '0.5rem' }}>Team & Access Control</h3>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            Invite organization members and explicitly grant or revoke individual product access.
          </p>
          <Link href="/portal/team" className="btn" style={{ display: 'inline-block', background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid var(--lam-border)', textDecoration: 'none' }}>
            Manage Team Access →
          </Link>
        </div>

        <div className="lam-card">
          <h3 style={{ fontSize: 'var(--text-md)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>Organization Entitlements</h3>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            View subscriptions, seat allocations, and product environment URLs.
          </p>
          <Link href="/portal/products" className="btn" style={{ display: 'inline-block', background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid var(--lam-border)', textDecoration: 'none' }}>
            View Subscriptions →
          </Link>
        </div>
      </div>
    </div>
  )
}
