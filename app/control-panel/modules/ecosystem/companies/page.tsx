import { requirePermission } from '@/lib/auth/permissions'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { toggleCompanyStatusAction } from '@/lib/actions/customer-onboarding'
import Link from 'next/link'

export const metadata = {
  title: 'Customer Accounts | LΛM Ecosystem Admin',
  robots: { index: false, follow: false },
}

export default async function EcosystemCompaniesPage() {
  await requirePermission('leads_clients', 'view')

  const adminClient = getSupabaseAdmin()

  // Fetch companies with memberships, identities, and entitlements
  const { data: companies } = await adminClient
    .from('crm_companies')
    .select(`
      id, company_id, name, legal_name, company_type, country, status, created_at,
      memberships:customer_company_memberships(
        company_role,
        identity:customer_identities(first_name, last_name, email)
      ),
      entitlements:customer_product_entitlements(id, product_slug, status, plan_tier, expires_at)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Link href="/control-panel/modules/ecosystem" style={{ color: 'var(--lam-gold)', textDecoration: 'none', fontSize: 'var(--text-xs)' }}>
              ← Ecosystem Admin
            </Link>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)' }}>
            Customer Accounts & Organizations
          </h1>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
            Central administration of standard and demo customer accounts, entitlements, and lifecycle status.
          </p>
        </div>

        <Link href="/control-panel/modules/ecosystem/companies/new" className="btn btn-primary" style={{ padding: '0.65rem 1.35rem', fontWeight: 600 }}>
          + Onboard New Customer
        </Link>
      </div>

      <div className="lam-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--lam-surface-elevated)', borderBottom: '1px solid var(--lam-border)' }}>
              <th style={{ textAlign: 'left', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Company ID</th>
              <th style={{ textAlign: 'left', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Company Name</th>
              <th style={{ textAlign: 'center', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Primary Owner</th>
              <th style={{ textAlign: 'center', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Entitlements</th>
              <th style={{ textAlign: 'center', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Account Status</th>
              <th style={{ textAlign: 'right', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies && companies.length > 0 ? (
              companies.map((comp) => {
                const isDemo = comp.company_type === 'demo'
                const isSuspended = comp.status === 'Suspended' || comp.status === 'Inactive'

                const ownerMem = comp.memberships?.find((m: any) => m.company_role === 'owner') || comp.memberships?.[0]
                const ownerUser = (ownerMem?.identity as any)

                return (
                  <tr key={comp.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', color: 'var(--lam-gold)' }}>
                      {comp.company_id || comp.id.slice(0, 8)}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', color: 'var(--lam-white)', fontWeight: 600 }}>
                      <Link href={`/control-panel/modules/ecosystem/companies/${comp.id}`} style={{ color: 'var(--lam-white)', textDecoration: 'none' }}>
                        {comp.name}
                      </Link>
                      {comp.legal_name && comp.legal_name !== comp.name ? (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', fontWeight: 400 }}>{comp.legal_name}</div>
                      ) : null}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                      <span className={`badge ${isDemo ? 'badge-warning' : 'badge-gold'}`} style={{ fontSize: '10px' }}>
                        {isDemo ? 'DEMO' : 'STANDARD'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      {ownerUser ? (
                        <div>
                          <div style={{ color: 'var(--lam-white)', fontWeight: 500, fontSize: 'var(--text-xs)' }}>
                            {ownerUser.first_name} {ownerUser.last_name || ''}
                          </div>
                          <div style={{ color: 'var(--lam-silver-dim)', fontSize: '9px' }}>{ownerUser.email}</div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                      {comp.entitlements && comp.entitlements.length > 0 ? (
                        comp.entitlements.map((e: any) => (
                          <div key={e.id} style={{ display: 'inline-block', margin: '2px' }}>
                            <span className="badge badge-gold" style={{ fontSize: '10px' }}>
                              {e.product_slug.toUpperCase()} ({e.plan_tier})
                            </span>
                            {e.expires_at ? (
                              <div style={{ fontSize: '9px', color: 'var(--lam-silver-dim)' }}>
                                Exp: {new Date(e.expires_at).toLocaleDateString()}
                              </div>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <span style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>None</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                      <span className={`badge ${isSuspended ? 'badge-warning' : 'badge-success'}`}>
                        {comp.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Link href={`/control-panel/modules/ecosystem/companies/${comp.id}`} className="btn btn-primary" style={{ padding: '0.25rem 0.6rem', fontSize: 'var(--text-xs)' }}>
                          Details
                        </Link>

                        <form action={async () => {
                          'use server'
                          await toggleCompanyStatusAction(comp.id, comp.status)
                        }}>
                          <button
                            type="submit"
                            className="btn"
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: 'var(--text-xs)',
                              background: isSuspended ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                              color: isSuspended ? '#2ecc71' : '#e74c3c',
                              border: `1px solid ${isSuspended ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'}`
                            }}
                          >
                            {isSuspended ? 'Reactivate' : 'Suspend'}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No customer company accounts registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
