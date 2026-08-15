'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeFirstPasswordChange } from '@/lib/actions/customer-auth'

export default function ForcePasswordChangePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const res = await completeFirstPasswordChange(formData)

      if (res.success) {
        if (res.redirectUrl) {
          window.location.href = res.redirectUrl
        } else {
          router.push('/portal')
        }
      } else {
        setError(res.error || 'Password update failed.')
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
          <div style={{ color: 'var(--lam-gold)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
            Mandatory First-Login Password Setup
          </div>
        </div>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-light)', marginBottom: '1.5rem', lineHeight: 1.5, textAlign: 'center' }}>
          You authenticated using temporary login credentials. Please set your secure permanent password to activate your account and continue.
        </p>

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
              New Permanent Password *
            </label>
            <input
              type="password"
              name="new_password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
              Confirm New Password *
            </label>
            <input
              type="password"
              name="confirm_password"
              required
              minLength={8}
              placeholder="Re-enter new password"
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
            {loading ? 'Updating Password...' : 'Save Password & Proceed →'}
          </button>
        </form>
      </div>
    </div>
  )
}
