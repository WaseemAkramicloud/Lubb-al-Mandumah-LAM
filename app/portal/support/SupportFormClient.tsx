'use client'

import { useState } from 'react'
import { submitCustomerSupportTicket } from '@/lib/actions/customer-auth'

export function SupportFormClient() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', type: '' })

    try {
      const formData = new FormData(e.currentTarget)
      const res = await submitCustomerSupportTicket(formData)
      if (res.success) {
        setMsg({ text: 'Support request dispatched successfully. Our team will contact you shortly.', type: 'success' })
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
        Submit Priority Support Request
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
            <label className="form-label">Category</label>
            <select name="category" className="form-input">
              <option value="General">General Inquiry</option>
              <option value="Product Access">Product Access & SSO</option>
              <option value="Billing">Subscription & Billing</option>
              <option value="Technical">Technical Bug / Issue</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input type="text" name="subject" required placeholder="Brief issue summary" className="form-input" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Detailed Description</label>
          <textarea name="message" required rows={6} className="form-input" placeholder="Provide details about your request or issue..." />
        </div>

        <div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Submitting...' : 'Submit Priority Request'}
          </button>
        </div>
      </form>
    </div>
  )
}
