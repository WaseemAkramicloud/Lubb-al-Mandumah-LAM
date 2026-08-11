'use client'

import { useState } from 'react'
import { updateCustomerPassword } from '@/lib/actions/customer-auth'

export function SecurityFormClient() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', type: '' })

    try {
      const formData = new FormData(e.currentTarget)
      const res = await updateCustomerPassword(formData)
      if (res.success) {
        setMsg({ text: 'Password updated successfully.', type: 'success' })
        e.currentTarget.reset()
      }
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lam-card">
      <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.5rem' }}>
        Change Account Password
      </h2>

      {msg.text && (
        <div style={{
          padding: '0.75rem',
          borderRadius: '4px',
          fontSize: 'var(--text-sm)',
          marginBottom: '1.5rem',
          background: msg.type === 'error' ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)',
          color: msg.type === 'error' ? '#e74c3c' : '#2ecc71'
        }}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input type="password" name="current_password" required className="form-input" placeholder="••••••••••••" />
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <input type="password" name="new_password" required minLength={8} className="form-input" placeholder="••••••••••••" />
        </div>

        <div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  )
}
