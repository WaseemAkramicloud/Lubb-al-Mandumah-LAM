import Link from 'next/link'

export default function ControlPanelNotFound() {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '4rem auto',
      textAlign: 'center',
      padding: '3rem 2rem',
      background: 'var(--lam-surface-elevated)',
      border: '1px solid var(--lam-border)',
      borderRadius: '8px'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
      <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-gold)', marginBottom: '0.75rem' }}>
        Record or Control Panel Page Not Found
      </h2>
      <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '2rem', lineHeight: 1.6 }}>
        The administrative record, client company, or control panel route you requested does not exist or has been relocated.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link
          href="/control-panel/clients"
          className="btn btn-primary"
          style={{ padding: '0.65rem 1.25rem' }}
        >
          ← Back to Clients
        </Link>
        <Link
          href="/control-panel/dashboard"
          className="btn"
          style={{ background: 'var(--lam-surface)', color: 'var(--lam-white)', border: '1px solid var(--lam-border)', padding: '0.65rem 1.25rem' }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
