'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
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
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
            L<span style={{ color: 'var(--lam-gold)' }}>Λ</span>M ID
          </div>
          <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
            Account Password Recovery
          </div>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ color: '#2ecc71', fontSize: 'var(--text-base)', marginBottom: '1rem', fontWeight: 500 }}>
              Password Reset Instructions Sent
            </div>
            <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '2rem', lineHeight: 1.6 }}>
              If an active account exists for <strong style={{ color: 'var(--lam-white)' }}>{email}</strong>, password reset instructions have been dispatched.
            </p>
            <Link href="/id/login" className="btn btn-primary" style={{ display: 'inline-block', width: '100%' }}>
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
              Enter your work email address to receive password reset instructions.
            </p>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
                Work Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="form-input"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              Send Reset Request
            </button>
          </form>
        )}

        <div className="lam-divider" style={{ margin: '2rem 0' }} />

        <div style={{ textAlign: 'center', fontSize: 'var(--text-xs)' }}>
          <Link href="/id/login" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none' }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
