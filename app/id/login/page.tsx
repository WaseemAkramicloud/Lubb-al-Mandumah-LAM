'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { customerLogin } from '@/lib/actions/customer-auth'
import Link from 'next/link'

export default function CustomerLoginPage(props: { searchParams: Promise<{ redirect_to?: string; error?: string; error_description?: string }> }) {
  const searchParams = use(props.searchParams)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(searchParams.error_description || '')

  const redirectTo = searchParams.redirect_to || '/portal'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      formData.append('return_to', redirectTo)
      const res = await customerLogin(formData)

      if (res.success) {
        if (res.redirectUrl) {
          window.location.href = res.redirectUrl
        } else {
          router.push('/portal')
        }
      } else {
        setError(res.error || 'Authentication failed.')
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
        maxWidth: '440px',
        padding: '2.5rem',
        background: 'rgba(20, 20, 20, 0.8)',
        border: '1px solid var(--lam-border)',
        borderRadius: '8px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
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
            Central Customer Single Sign-On
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
            marginBottom: '1.5rem',
            lineHeight: 1.4
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
              Work Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="name@company.com"
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)' }}>
                Password
              </label>
              <Link href="/id/forgot-password" style={{ color: 'var(--lam-gold)', fontSize: 'var(--text-xs)', textDecoration: 'none' }}>
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••••••"
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In with LAM ID'}
          </button>
        </form>

        <div className="lam-divider" style={{ margin: '2rem 0' }} />

        <div style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
          Don&apos;t have an organization account?{' '}
          <Link href="/id/register" style={{ color: 'var(--lam-gold)', textDecoration: 'none', fontWeight: 500 }}>
            Create Company Account
          </Link>
        </div>
      </div>
    </div>
  )
}
