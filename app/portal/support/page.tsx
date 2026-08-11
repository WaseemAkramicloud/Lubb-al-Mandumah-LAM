import { getCurrentCustomer } from '@/lib/actions/customer-auth'
import { SupportFormClient } from './SupportFormClient'

export const metadata = {
  title: "Support Entry Point | Customer Portal",
}

export default async function CustomerSupportPage() {
  const customer = await getCurrentCustomer()
  if (!customer) return null

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>
          Customer Support & Dedicated Executive
        </h1>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
          Submit a support ticket or contact your assigned account representative for priority assistance.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Support Ticket Submission Form */}
        <SupportFormClient />

        {/* Dedicated Account Executive Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="lam-card">
            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1rem' }}>
              Dedicated Account Executive
            </h3>
            
            <div style={{ padding: '1rem', background: 'var(--lam-surface)', borderRadius: '4px', marginBottom: '1rem' }}>
              <div style={{ color: 'var(--lam-white)', fontWeight: 600, fontSize: 'var(--text-base)' }}>LAM Enterprise Desk</div>
              <div style={{ color: 'var(--lam-gold)', fontSize: 'var(--text-xs)', marginBottom: '0.5rem' }}>Senior Support Representative</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
                Email: <a href="mailto:support@lamweb.com" style={{ color: 'var(--lam-silver-light)', textDecoration: 'none' }}>support@lamweb.com</a>
              </div>
            </div>

            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', lineHeight: 1.5 }}>
              Standard Response Time: <strong>&lt; 2 Hours</strong> for priority issues.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
