import { getCurrentCustomer, getOwnerConsoleData, getEmployeeWorkspaceData } from '@/lib/actions/customer-auth'
import { OwnerConsoleClient } from './OwnerConsoleClient'

export default async function CustomerDashboardPage() {
  const customer = await getCurrentCustomer()
  if (!customer) return null

  // 1. Fetch Owner Console Data (Returns isOwner = true if caller has Owner/Admin authority)
  const ownerData = await getOwnerConsoleData()

  if (ownerData.isOwner) {
    return <OwnerConsoleClient ownerData={ownerData} />
  }

  // 2. Fetch Employee Workspace Data (STRICT EMPLOYEE ISOLATION VIEW)
  const employeeWorkspaces = await getEmployeeWorkspaceData()

  return (
    <div>
      {/* Hero Welcome Banner */}
      <div className="lam-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.08) 0%, rgba(20, 20, 20, 0.9) 100%)', border: '1px solid rgba(201, 168, 76, 0.2)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>
          Welcome, {customer.first_name}!
        </h1>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
          Assigned Workspace Launchpad • Access strictly isolated to your assigned product workspace.
        </p>
      </div>

      {/* Product Applications Launchpad for Employee */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-white)' }}>
            Your Assigned Workspace
          </h2>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase' }}>
            Single Sign-On Active
          </span>
        </div>

        {!employeeWorkspaces || employeeWorkspaces.length === 0 ? (
          <div className="lam-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--lam-silver-dim)' }}>
            No active workspace assignment found for your user identity. Please contact your workspace administrator.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {employeeWorkspaces.map((ws: any) => (
              <div key={ws.workspaceCode} className="lam-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '0.25rem' }}>{ws.productName}</h3>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>Role: <strong style={{ color: 'var(--lam-silver-light)', textTransform: 'capitalize' }}>{ws.role}</strong></span>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      background: 'rgba(201, 168, 76, 0.15)',
                      color: 'var(--lam-gold)',
                      border: '1px solid rgba(201, 168, 76, 0.3)'
                    }}>
                      {ws.workspaceCode}
                    </span>
                  </div>

                  <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid var(--lam-border)', marginBottom: '1.5rem', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
                    Workspace User ID: <strong style={{ color: 'var(--lam-gold)', fontFamily: 'monospace' }}>{ws.userId}</strong>
                  </div>
                </div>

                <a
                  href={ws.ssoLaunchUrl}
                  className="btn btn-primary"
                  style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.85rem' }}
                >
                  Launch {ws.productName} Application →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
