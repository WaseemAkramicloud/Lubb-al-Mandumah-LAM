import { getCurrentCustomer } from '@/lib/actions/customer-auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { CompanyFormClient } from './CompanyFormClient'

export const metadata = {
  title: "My Company | Customer Portal",
}

export default async function CustomerCompanyPage() {
  const customer = await getCurrentCustomer()
  if (!customer) return null

  const supabase = getSupabaseAdmin()

  const { data: membership } = await supabase
    .from('customer_company_memberships')
    .select('company_role, company_id, company:crm_companies(*)')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .single()

  const company = (membership as any)?.company
  const userRole = membership?.company_role || 'member'

  const isOwnerOrAdmin = ['owner', 'admin'].includes(userRole)

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>
          Organization Profile & Subscriptions
        </h1>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
          Manage company metadata, legal details, and view subscription billing status.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Company Details Form */}
        <CompanyFormClient company={company} isOwnerOrAdmin={isOwnerOrAdmin} />

        {/* Account & Billing Status Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="lam-card">
            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1rem' }}>
              Subscription Billing Status
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--text-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--lam-border)' }}>
                <span style={{ color: 'var(--lam-silver-dim)' }}>Billing Status:</span>
                <span style={{ color: '#2ecc71', fontWeight: 600 }}>Active / Good Standing</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--lam-border)' }}>
                <span style={{ color: 'var(--lam-silver-dim)' }}>Payment Method:</span>
                <span style={{ color: 'var(--lam-white)' }}>Corporate Invoice / Wire</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--lam-border)' }}>
                <span style={{ color: 'var(--lam-silver-dim)' }}>Account ID:</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--lam-gold)' }}>{company?.company_id || '—'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--lam-silver-dim)' }}>Customer Role:</span>
                <span style={{ textTransform: 'capitalize', color: 'var(--lam-white)' }}>{userRole}</span>
              </div>
            </div>
          </div>

          <div className="lam-card">
            <h3 style={{ fontSize: 'var(--text-md)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>Billing Inquiries</h3>
            <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', lineHeight: 1.5, marginBottom: '1rem' }}>
              To update payment methods, request custom invoicing, or add enterprise seats, contact your dedicated account executive.
            </p>
            <a href="/portal/support" className="btn" style={{ display: 'inline-block', width: '100%', textAlign: 'center', background: 'var(--lam-surface)', color: 'var(--lam-silver)', border: '1px solid var(--lam-border)', textDecoration: 'none', fontSize: 'var(--text-xs)' }}>
              Contact Billing Support →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
