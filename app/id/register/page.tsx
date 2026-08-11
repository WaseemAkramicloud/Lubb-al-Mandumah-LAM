'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { customerRegister } from '@/lib/actions/customer-auth'
import Link from 'next/link'

export default function CustomerRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const res = await customerRegister(formData)

      if (res.success) {
        router.push('/portal')
      } else {
        setError(res.error || 'Registration failed.')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--lam-black)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: 'var(--lam-white)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        padding: '2.5rem',
        background: 'rgba(20, 20, 20, 0.8)',
        border: '1px solid var(--lam-border)',
        borderRadius: '8px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: 'var(--lam-white)',
            marginBottom: '0.5rem'
          }}>
            L<span style={{ color: 'var(--lam-gold)' }}>Λ</span>M ID
          </div>
          <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Register Organization & Account
          </div>
        </div>

        {error && (
          <div style={{
            padding: '0.85rem',
            background: 'rgba(231, 76, 60, 0.1)',
            border: '1px solid rgba(231, 76, 60, 0.3)',
            color: '#e74c3c',
            borderRadius: '4px',
            fontSize: 'var(--text-sm)',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
              Company / Organization Name
            </label>
            <input type="text" name="company_name" required placeholder="Acme Global Inc." className="form-input" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
                First Name
              </label>
              <input type="text" name="first_name" required placeholder="John" className="form-input" />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
                Last Name
              </label>
              <input type="text" name="last_name" placeholder="Doe" className="form-input" />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
              Work Email Address
            </label>
            <input type="email" name="email" required placeholder="john@acme.com" className="form-input" />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input type="password" name="password" required placeholder="••••••••••••" className="form-input" minLength={8} />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}>
            {loading ? 'Creating Account...' : 'Create Account & Continue'}
          </button>
        </form>

        <div className="lam-divider" style={{ margin: '2rem 0' }} />

        <div style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
          Already have an account?{' '}
          <Link href="/id/login" style={{ color: 'var(--lam-gold)', textDecoration: 'none', fontWeight: 500 }}>
            Sign In with LAM ID
          </Link>
        </div>
      </div>
    </div>
  )
}
