import Link from 'next/link'

export function LeadsWidget({ data }: { data: Record<string, number> }) {
  const newRequestsCount = data.newRequestsCount || 0
  
  return (
    <div className="lam-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ fontSize: 'var(--text-md)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>New Leads</h3>
      <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', flex: 1 }}>
        Overview of incoming unassigned prospect inquiries.
      </p>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--lam-gold)' }}>{newRequestsCount}</span>
          <span style={{ color: 'var(--lam-silver)', fontSize: 'var(--text-sm)' }}>New</span>
        </div>
        <Link href="/control-panel/modules/leads-clients" className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--lam-surface)', color: 'var(--lam-silver)', border: '1px solid var(--lam-border)' }}>
          View All
        </Link>
      </div>
    </div>
  )
}

export function MyLeadsWidget({ data }: { data: Record<string, number> }) {
  const myAssignedCount = data.myAssignedCount || 0
  
  return (
    <div className="lam-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ fontSize: 'var(--text-md)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>My Assigned Leads</h3>
      <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', flex: 1 }}>
        Active leads and prospects assigned to you.
      </p>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--lam-white)' }}>{myAssignedCount}</span>
          <span style={{ color: 'var(--lam-silver)', fontSize: 'var(--text-sm)' }}>Active</span>
        </div>
        <Link href="/control-panel/modules/leads-clients" className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--lam-surface)', color: 'var(--lam-silver)', border: '1px solid var(--lam-border)' }}>
          Manage
        </Link>
      </div>
    </div>
  )
}

export function FollowUpsWidget({ data }: { data: Record<string, number> }) {
  const recentUpdatesCount = data.recentUpdatesCount || 0
  
  return (
    <div className="lam-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ fontSize: 'var(--text-md)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>Follow-ups</h3>
      <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', flex: 1 }}>
        Leads recently updated or converted in the past week.
      </p>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--lam-gold)' }}>{recentUpdatesCount}</span>
          <span style={{ color: 'var(--lam-silver)', fontSize: 'var(--text-sm)' }}>Updated</span>
        </div>
        <Link href="/control-panel/modules/leads-clients" className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--lam-surface)', color: 'var(--lam-silver)', border: '1px solid var(--lam-border)' }}>
          Review
        </Link>
      </div>
    </div>
  )
}

export function UsersWidget({ data }: { data: Record<string, number> }) {
  const activeStaffCount = data.activeStaffCount || 0
  
  return (
    <div className="lam-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ fontSize: 'var(--text-md)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>Team Directory</h3>
      <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', flex: 1 }}>
        Active control panel staff members and system administrators.
      </p>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--lam-white)' }}>{activeStaffCount}</span>
          <span style={{ color: 'var(--lam-silver)', fontSize: 'var(--text-sm)' }}>Active</span>
        </div>
        <Link href="/control-panel/users" className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--lam-surface)', color: 'var(--lam-silver)', border: '1px solid var(--lam-border)' }}>
          Manage Users
        </Link>
      </div>
    </div>
  )
}

export function AuditWidget({ data }: { data: Record<string, number> }) {
  const recentLogsCount = data.recentLogsCount || 0
  
  return (
    <div className="lam-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderColor: 'rgba(231, 76, 60, 0.2)' }}>
      <h3 style={{ fontSize: 'var(--text-md)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>System Activity</h3>
      <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', flex: 1 }}>
        Security and permission modifications in the last 24 hours.
      </p>
      
      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--lam-white)' }}>{recentLogsCount}</span>
          <span style={{ color: 'var(--lam-silver)', fontSize: 'var(--text-sm)' }}>Events</span>
        </div>
        <Link href="/control-panel/audit" className="btn" style={{ padding: '0.5rem 1rem', background: 'var(--lam-surface)', color: 'var(--lam-silver)', border: '1px solid var(--lam-border)' }}>
          Audit Log
        </Link>
      </div>
    </div>
  )
}

export function ContentWidget() {
  return (
    <div className="lam-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ fontSize: 'var(--text-md)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>Content & Site</h3>
      <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', flex: 1 }}>
        Pending edits or draft articles requiring publishing.
      </p>
      
      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--lam-surface)', borderRadius: '4px', textAlign: 'center' }}>
        <span style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>No Pending Drafts</span>
      </div>
    </div>
  )
}
