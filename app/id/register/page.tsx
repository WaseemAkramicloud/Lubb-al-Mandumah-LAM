'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { customerRegister } from '@/lib/actions/customer-auth'
import Link from 'next/link'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const initialEmail = searchParams.get('email') || ''

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 🔒 INVITE-ONLY GUARD: If no invitation token is present, block self-registration
  if (!token) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '460px',
        padding: '2.5rem',
        background: 'rgba(20, 20, 20, 0.85)',
        border: '1px solid var(--lam-border)',
        borderRadius: '8px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: 'var(--lam-white)',
          marginBottom: '0.5rem'
        }}>
          L<span style={{ color: 'var(--lam-gold)' }}>Λ</span>M ID
        </div>
        <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2rem' }}>
          Identity & Access Management
        </div>

        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(201, 168, 76, 0.1)',
          border: '1px solid rgba(201, 168, 76, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          color: 'var(--lam-gold)',
          fontSize: '1.5rem'
        }}>
          ✉️
        </div>

        <h1 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '0.75rem', fontWeight: 600 }}>
          Account Creation by Invitation Only
        </h1>
        <p style={{ color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)', marginBottom: '2rem', lineHeight: 1.6 }}>
          New LAM accounts are created by invitation. Please contact LAM or use the invitation sent to your email.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <Link href="/id/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
            Sign In with LAM ID
          </Link>
          <Link href="/" className="btn" style={{ width: '100%', justifyContent: 'center', background: 'var(--lam-surface)', color: 'var(--lam-silver)', border: '1px solid var(--lam-border)', padding: '0.85rem' }}>
            Return to Website
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      formData.append('token', token)
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
      width: '100%',
      maxWidth: '480px',
      padding: '2.5rem',
      background: 'rgba(20, 20, 20, 0.85)',
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
          Complete Account Setup
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
              First Name
            </label>
            <input type="text" name="first_name" required placeholder="Jane" className="form-input" />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
              Last Name
            </label>
            <input type="text" name="last_name" required placeholder="Doe" className="form-input" />
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
            Work Email Address
          </label>
          <input type="email" name="email" required defaultValue={initialEmail} placeholder="jane@company.com" className="form-input" />
        </div>

        <div className="form-group">
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
            Password
          </label>
          <input type="password" name="password" required placeholder="••••••••••••" className="form-input" minLength={8} />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}>
          {loading ? 'Activating Account...' : 'Complete Setup & Accept Invitation'}
        </button>
      </form>

      <div className="lam-divider" style={{ margin: '2rem 0' }} />

      <div style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
        Already set up?{' '}
        <Link href="/id/login" style={{ color: 'var(--lam-gold)', textDecoration: 'none', fontWeight: 500 }}>
          Sign In with LAM ID
        </Link>
      </div>
    </div>
  )
}

export default function CustomerRegisterPage() {
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
      <Suspense fallback={<div style={{ color: 'var(--lam-gold)' }}>Loading portal...</div>}>
        <RegisterContent />
      </Suspense>
    </div>
  )
}
