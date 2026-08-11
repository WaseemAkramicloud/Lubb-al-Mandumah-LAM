import { requirePermission } from '@/lib/auth/permissions'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'

export const metadata = {
  title: 'Customer Accounts | LΛM Ecosystem Admin',
  robots: { index: false, follow: false },
}

export default async function EcosystemCompaniesPage() {
  await requirePermission('leads_clients', 'view')

  const adminClient = getSupabaseAdmin()

  // Fetch companies with memberships and entitlements
  const { data: companies } = await adminClient
    .from('crm_companies')
    .select(`
      id, company_id, name, legal_name, country, status, created_at,
      memberships:customer_company_memberships(id),
      entitlements:customer_product_entitlements(id, product_slug, status)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
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
            Overview of central customer organizations registered in the LAM identity network.
          </p>
        </div>
      </div>

      <div className="lam-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--lam-surface-elevated)', borderBottom: '1px solid var(--lam-border)' }}>
              <th style={{ textAlign: 'left', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Company ID</th>
              <th style={{ textAlign: 'left', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Company Name</th>
              <th style={{ textAlign: 'left', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Country</th>
              <th style={{ textAlign: 'center', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Members</th>
              <th style={{ textAlign: 'center', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Entitlements</th>
              <th style={{ textAlign: 'center', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {companies && companies.length > 0 ? (
              companies.map((comp) => (
                <tr key={comp.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                  <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', color: 'var(--lam-gold)' }}>
                    {comp.company_id || comp.id.slice(0, 8)}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', color: 'var(--lam-white)', fontWeight: 600 }}>
                    {comp.name}
                    {comp.legal_name && comp.legal_name !== comp.name ? (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', fontWeight: 400 }}>{comp.legal_name}</div>
                    ) : null}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', color: 'var(--lam-silver)' }}>
                    {comp.country || 'N/A'}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center', color: 'var(--lam-white)' }}>
                    {comp.memberships ? comp.memberships.length : 0}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                    {comp.entitlements && comp.entitlements.length > 0 ? (
                      comp.entitlements.map((e: any) => (
                        <span key={e.id} className="badge badge-gold" style={{ fontSize: '10px', margin: '0 2px' }}>
                          {e.product_slug.toUpperCase()}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                    <span className={`badge ${comp.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                      {comp.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                    <Link href={`/control-panel/modules/leads-clients/companies/${comp.id}`} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
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
