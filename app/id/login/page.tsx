'use client'

import { useState, useActionState, use } from 'react'
import { customerLoginAction, CustomerLoginResult } from '@/lib/actions/customer-auth'
import Link from 'next/link'

export default function CustomerLoginPage(props: { searchParams: Promise<{ redirect_to?: string; product?: string; error?: string; error_description?: string }> }) {
  const searchParams = use(props.searchParams)
  const [loginMode, setLoginMode] = useState<'employee' | 'owner'>('employee')

  const redirectTo = searchParams.redirect_to || '/portal'
  const requestingProduct = searchParams.product || ''

  const initialState: CustomerLoginResult = {
    success: false,
    error: searchParams.error_description || (searchParams.error === 'access_denied' ? 'Access denied to this product workspace.' : '')
  }

  const [state, formAction, isPending] = useActionState(customerLoginAction, initialState)

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
        maxWidth: '460px',
        padding: '2.5rem',
        background: 'rgba(20, 20, 20, 0.85)',
        border: '1px solid var(--lam-border)',
        borderRadius: '8px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: 'var(--lam-white)',
            marginBottom: '0.35rem'
          }}>
            L<span style={{ color: 'var(--lam-gold)' }}>Λ</span>M ID
          </div>
          <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Central Identity & SSO Authority
          </div>
        </div>

        {/* Login Mode Toggle Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(10, 10, 10, 0.6)',
          padding: '4px',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          border: '1px solid var(--lam-border)'
        }}>
          <button
            type="button"
            onClick={() => setLoginMode('employee')}
            style={{
              padding: '0.65rem 0.5rem',
              borderRadius: '4px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: 'none',
              cursor: 'pointer',
              background: loginMode === 'employee' ? 'var(--lam-gold)' : 'transparent',
              color: loginMode === 'employee' ? '#000' : 'var(--lam-silver-dim)',
              transition: 'all 0.2s ease'
            }}
          >
            Workspace Login
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('owner')}
            style={{
              padding: '0.65rem 0.5rem',
              borderRadius: '4px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              border: 'none',
              cursor: 'pointer',
              background: loginMode === 'owner' ? 'var(--lam-gold)' : 'transparent',
              color: loginMode === 'owner' ? '#000' : 'var(--lam-silver-dim)',
              transition: 'all 0.2s ease'
            }}
          >
            Company Owner
          </button>
        </div>

        {state.error && (
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
            {state.error}
          </div>
        )}

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input type="hidden" name="return_to" value={redirectTo} />
          <input type="hidden" name="login_mode" value={loginMode} />
          {requestingProduct && <input type="hidden" name="requesting_product" value={requestingProduct} />}

          {loginMode === 'employee' ? (
            <>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
                  Workspace Code
                </label>
                <input
                  type="text"
                  name="workspace_code"
                  required
                  placeholder="e.g. NEX7K4Q, ATO3M8P, AHS9R2X"
                  className="form-input"
                  style={{ width: '100%', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
                  User ID
                </label>
                <input
                  type="text"
                  name="user_id"
                  required
                  placeholder="e.g. ali, finance1, teacher"
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
                Owner Work Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="owner@company.com"
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)' }}>
                Password
              </label>
              {loginMode === 'owner' && (
                <Link href="/id/forgot-password" style={{ color: 'var(--lam-gold)', fontSize: 'var(--text-xs)', textDecoration: 'none' }}>
                  Forgot?
                </Link>
              )}
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
            disabled={isPending}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {isPending ? 'Authenticating...' : loginMode === 'employee' ? 'Sign In to Workspace' : 'Sign In to Owner Console'}
          </button>
        </form>

        <div className="lam-divider" style={{ margin: '1.75rem 0' }} />

        <div style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', lineHeight: 1.5 }}>
          {loginMode === 'employee' ? (
            <>Ordinary workspace employees log in with Workspace Code + User ID + Password.</>
          ) : (
            <>Company Owners sign in with work email to access the Owner Console at <code>access.lubbalmandumah.com</code>.</>
          )}
        </div>
      </div>
    </div>
  )
}
