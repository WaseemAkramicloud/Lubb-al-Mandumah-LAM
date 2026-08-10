import Link from 'next/link'

export const metadata = {
  title: "Access Denied | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default function UnauthorizedPage() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      textAlign: "center"
    }}>
      <div style={{
        background: 'rgba(231, 76, 60, 0.1)',
        color: '#e74c3c',
        padding: '1.5rem',
        borderRadius: '50%',
        marginBottom: '1.5rem',
        display: 'inline-flex'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      
      <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '1rem' }}>
        Access Denied
      </h1>
      
      <p style={{ color: 'var(--lam-silver)', maxWidth: '400px', marginBottom: '2rem' }}>
        You do not have the required permissions to view this module or perform this action. If you believe this is an error, please contact your System Administrator.
      </p>
      
      <Link href="/control-panel/dashboard" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  )
}
