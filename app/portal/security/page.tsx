import { getCurrentCustomer } from '@/lib/actions/customer-auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { SecurityFormClient } from './SecurityFormClient'

export const metadata = {
  title: "Security & Sessions | Customer Portal",
}

export default async function CustomerSecurityPage() {
  const customer = await getCurrentCustomer()
  if (!customer) return null

  const supabase = getSupabaseAdmin()

  // Fetch active sessions
  const { data: sessions } = await supabase
    .from('customer_sessions')
    .select('*')
    .eq('customer_id', customer.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // Fetch customer security audit log
  const { data: auditLogs } = await supabase
    .from('customer_audit_logs')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>
          Security & Active Sessions
        </h1>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
          Manage your account password, view active SSO sessions, and review account security history.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Password Change Form */}
        <SecurityFormClient />

        {/* Active Sessions */}
        <div className="lam-card">
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1rem' }}>
            Active Sessions ({sessions?.length || 0})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sessions?.map(s => (
              <div key={s.id} style={{ padding: '0.75rem', background: 'var(--lam-surface)', borderRadius: '4px', border: '1px solid var(--lam-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--lam-white)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>Current Browser Session</span>
                  <span style={{ color: '#2ecc71', fontSize: '10px', fontWeight: 600 }}>ACTIVE</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--lam-silver-dim)' }}>
                  Expires: {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(s.expires_at))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Audit Log */}
      <div className="lam-card">
        <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.5rem' }}>
          Security Audit History
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--lam-border)' }}>
                <th style={{ padding: '0.75rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Timestamp</th>
                <th style={{ padding: '0.75rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Action</th>
                <th style={{ padding: '0.75rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs?.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-xs)' }}>
                    {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(log.created_at))}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--lam-gold)', fontSize: 'var(--text-xs)' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
                    {log.ip_address || '—'}
                  </td>
                </tr>
              ))}

              {(!auditLogs || auditLogs.length === 0) && (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
                    No security events logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
