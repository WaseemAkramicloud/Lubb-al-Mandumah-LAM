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
      {/* Header + Prominent Onboard Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.25rem' }}>
            LAM Ecosystem Administration
          </h1>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
            Central administration for customer accounts, user identities, product subscriptions, and tenant instances.
          </p>
        </div>

        <Link
          href="/control-panel/modules/ecosystem/companies/new"
          className="btn btn-primary"
          style={{
            padding: '0.75rem 1.5rem',
            fontWeight: 600,
            fontSize: 'var(--text-sm)',
            boxShadow: '0 4px 14px rgba(201, 168, 76, 0.25)'
          }}
        >
          + Onboard New Customer
        </Link>
      </div>

      {/* Metric Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Customer Accounts</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--lam-gold)' }}>{totalCompanies || 0}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Subscriptions</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#2ecc71' }}>{activeEntitlements || 0}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Product Workspaces</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--lam-white)' }}>{totalInstances || 0}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Customer Users</div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', margin: 0 }}>Customer Accounts</h2>
            <Link href="/control-panel/modules/ecosystem/companies/new" style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-gold)', textDecoration: 'none', fontWeight: 600 }}>
              + Onboard New
            </Link>
          </div>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            Manage client organization records, primary account owners, standard vs. demo account types, and status.
          </p>
          <Link href="/control-panel/modules/ecosystem/companies" className="btn btn-primary">
            Customer Accounts Registry →
          </Link>
        </div>

        <div className="lam-card">
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '0.5rem' }}>Product Subscriptions & Access</h2>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            View and manage active company product subscriptions, plan tiers, seat allocations, and expiration dates.
          </p>
          <Link href="/control-panel/modules/ecosystem/entitlements" className="btn btn-primary">
            Manage Subscriptions →
          </Link>
        </div>

        <div className="lam-card">
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>Product Workspaces / Instances</h2>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            View provisioned product tenant instances, application environment URLs (e.g. NEXORA), and instance keys.
          </p>
          <Link href="/control-panel/modules/ecosystem/instances" className="btn" style={{ background: 'var(--lam-surface)', color: 'white', border: '1px solid var(--lam-border)' }}>
            Product Workspaces →
          </Link>
        </div>

        <div className="lam-card">
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>Customer Users</h2>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
            View central customer user identities, organization memberships, roles, and access status.
          </p>
          <Link href="/control-panel/modules/ecosystem/identities" className="btn" style={{ background: 'var(--lam-surface)', color: 'white', border: '1px solid var(--lam-border)' }}>
            Customer Users →
          </Link>
        </div>
      </div>
    </div>
  )
}
