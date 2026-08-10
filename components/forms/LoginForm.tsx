"use client"

import { useActionState } from 'react'
import { login } from '@/lib/actions/auth'

const initialState = {
  error: ''
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {state?.error && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(180, 80, 60, 0.1)',
          border: '1px solid rgba(180, 80, 60, 0.3)',
          borderRadius: 'var(--radius-sm)',
          color: '#e0896a',
          fontSize: 'var(--text-sm)',
          marginBottom: '0.5rem'
        }}>
          {state.error}
        </div>
      )}

      <div className="lam-form-group">
        <label htmlFor="email" className="lam-label">Work Email</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          required 
          className="lam-input" 
          placeholder="admin@lamweb.com" 
          autoComplete="email"
        />
      </div>

      <div className="lam-form-group">
        <label htmlFor="password" className="lam-label">Password</label>
        <input 
          id="password" 
          name="password" 
          type="password" 
          required 
          className="lam-input" 
          placeholder="••••••••" 
          autoComplete="current-password"
        />
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={isPending}
        style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
      >
        {isPending ? 'Authenticating...' : 'Sign In'}
      </button>
    </form>
  )
}
