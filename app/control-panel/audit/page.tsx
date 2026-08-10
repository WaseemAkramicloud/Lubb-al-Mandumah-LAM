import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'

export const metadata = {
  title: "Audit Log | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function AuditLogPage() {
  await requirePermission('audit_log', 'view')
  
  const supabase = await createClient()

  // For a real production app, pagination should be implemented.
  const { data: logs, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      actor:staff_profiles(first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching audit logs:", error)
  }

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>
        System Audit Log
      </h1>
      <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '2rem' }}>
        Append-only ledger of critical system actions, permission changes, and content mutations. Displaying last 100 events.
      </p>

      <div className="lam-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--lam-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Timestamp</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>User</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Module</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Action</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Entity ID / Details</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => {
              const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(log.created_at))
              
              return (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    {date}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-white)', fontSize: 'var(--text-sm)' }}>
                    {log.actor ? `${(log.actor as any).first_name} ${(log.actor as any).last_name}` : <span style={{ color: 'var(--lam-silver-dim)' }}>System</span>}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-gold)', fontSize: 'var(--text-sm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {log.entity_type}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-white)', fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '1rem', maxWidth: '300px' }}>
                    <div style={{ color: 'var(--lam-silver)', fontSize: 'var(--text-xs)', fontFamily: 'monospace', marginBottom: '0.25rem' }}>{log.entity_id}</div>
                    <div style={{ 
                      color: 'var(--lam-silver-dim)', 
                      fontSize: 'var(--text-xs)', 
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      background: 'rgba(0,0,0,0.2)',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      overflowX: 'auto'
                    }}>
                      {JSON.stringify(log.changes, null, 2)}
                    </div>
                  </td>
                </tr>
              )
            })}
            
            {!logs || logs.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
