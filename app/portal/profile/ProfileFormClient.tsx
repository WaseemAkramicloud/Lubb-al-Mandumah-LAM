'use client'

import { useState } from 'react'
import { updateCustomerProfile } from '@/lib/actions/customer-auth'

export function ProfileFormClient({ customer }: { customer: any }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', type: '' })

    try {
      const formData = new FormData(e.currentTarget)
      const res = await updateCustomerProfile(formData)
      if (res.success) {
        setMsg({ text: 'Profile updated successfully.', type: 'success' })
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
        Personal Details
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input type="text" name="first_name" required defaultValue={customer.first_name || ''} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input type="text" name="last_name" defaultValue={customer.last_name || ''} className="form-input" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Work Email Address (LAM ID)</label>
          <input type="email" defaultValue={customer.email || ''} disabled className="form-input" style={{ opacity: 0.7 }} />
          <small style={{ color: 'var(--lam-silver-dim)', marginTop: '0.25rem', display: 'block' }}>Email address is your permanent LAM ID identifier.</small>
        </div>

        <div className="form-group">
          <label className="form-label">Account Status</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '3px', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' }}>
              {customer.status}
            </span>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
