import Link from 'next/link'

export const metadata = {
  title: 'Reset Password | LΛM ID',
  robots: { index: false, follow: false },
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--lam-black)',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        background: 'var(--lam-surface)',
        borderRadius: '8px',
        border: '1px solid var(--lam-border)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--lam-gold)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.1em',
            marginBottom: '0.5rem'
          }}>
            LΛM ID
          </div>
          <h1 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>
            Set New Password
          </h1>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
            Enter your new secure password below to regain account access.
          </p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--lam-silver)', marginBottom: '0.5rem' }}>
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="••••••••••••"
              className="lam-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--lam-silver)', marginBottom: '0.5rem' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="••••••••••••"
              className="lam-input"
              style={{ width: '100%' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Update Password →
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--lam-border)' }}>
          <Link href="/id/login" style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textDecoration: 'none' }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
