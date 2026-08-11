import { requirePermission } from '@/lib/auth/permissions'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'

export const metadata = {
  title: "Ecosystem Admin | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function EcosystemAdminPage() {
  await requirePermission('leads_clients', 'view')

  const adminClient = getSupabaseAdmin()

  // Fetch metric counts
  const { count: totalCompanies } = await adminClient.from('crm_companies').select('*', { count: 'exact', head: true })
  const { count: activeEntitlements } = await adminClient.from('customer_product_entitlements').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { count: totalInstances } = await adminClient.from('customer_product_instances').select('*', { count: 'exact', head: true })
  const { count: totalIdentities } = await adminClient.from('customer_identities').select('*', { count: 'exact', head: true })
  const { count: suspendedIdentities } = await adminClient.from('customer_identities').select('*', { count: 'exact', head: true }).eq('status', 'suspended')

  const cardStyle = {
    padding: '1.5rem',
    background: 'var(--lam-surface)',
    borderRadius: '6px',
    border: '1px solid var(--lam-border)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.25rem' }}>
            LAM Ecosystem Administration
          </h1>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
            Central administration plane for customer identity, product entitlements, tenant instances, and SSO apps.
          </p>
        </div>
      </div>

      {/* Metric Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Customer Accounts</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--lam-gold)' }}>{totalCompanies || 0}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Entitlements</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2ecc71' }}>{activeEntitlements || 0}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Tenant Instances</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--lam-white)' }}>{totalInstances || 0}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Customer Identities</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--lam-white)' }}>{totalIdentities || 0}</span>
            {suspendedIdentities ? (
              <span style={{ fontSize: 'var(--text-xs)', color: '#e74c3c' }}>({suspendedIdentities} suspended)</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="lam-card">
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '0.5rem' }}>Product Entitlements</h2>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            Grant, upgrade, or suspend company SaaS subscriptions, plan tiers, and seat limits.
          </p>
          <Link href="/control-panel/modules/ecosystem/entitlements" className="btn btn-primary">
            Manage Entitlements →
          </Link>
        </div>

        <div className="lam-card">
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '0.5rem' }}>Tenant Instances Registry</h2>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            Register tenant keys, application environment URLs, and integration health statuses.
          </p>
          <Link href="/control-panel/modules/ecosystem/instances" className="btn btn-primary">
            Manage Product Instances →
          </Link>
        </div>

        <div className="lam-card">
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>Customer Identities</h2>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            View customer identity records, company memberships, and suspend/reactivate customer access.
          </p>
          <Link href="/control-panel/modules/ecosystem/identities" className="btn" style={{ background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid var(--lam-border)' }}>
            Customer Identities →
          </Link>
        </div>

        <div className="lam-card">
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>Customer Accounts Registry</h2>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            Manage client organization records (`LAM-C-XXXXXX`) and relationship owners.
          </p>
          <Link href="/control-panel/modules/leads-clients/companies" className="btn" style={{ background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid var(--lam-border)' }}>
            View Companies Registry →
          </Link>
        </div>
      </div>
    </div>
  )
}
