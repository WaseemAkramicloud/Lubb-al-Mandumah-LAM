'use client'

import { useState } from 'react'
import { updateCompanyProfile } from '@/lib/actions/customer-auth'

export function CompanyFormClient({ company, isOwnerOrAdmin }: { company: any; isOwnerOrAdmin: boolean }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isOwnerOrAdmin) return
    setLoading(true)
    setMsg({ text: '', type: '' })

    try {
      const formData = new FormData(e.currentTarget)
      const res = await updateCompanyProfile(company.id, formData)
      if (res.success) {
        setMsg({ text: 'Company profile updated successfully.', type: 'success' })
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
        Organization Details
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
            <label className="form-label">Organization Name</label>
            <input type="text" name="name" required defaultValue={company?.name || ''} disabled={!isOwnerOrAdmin} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Legal Company Name</label>
            <input type="text" name="legal_name" defaultValue={company?.legal_name || ''} disabled={!isOwnerOrAdmin} className="form-input" placeholder="e.g. Acme Corporation LLC" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Website URL</label>
            <input type="url" name="website" defaultValue={company?.website || ''} disabled={!isOwnerOrAdmin} className="form-input" placeholder="https://acme.com" />
          </div>

          <div className="form-group">
            <label className="form-label">Main Phone</label>
            <input type="text" name="phone" defaultValue={company?.phone || ''} disabled={!isOwnerOrAdmin} className="form-input" placeholder="+1 (555) 000-0000" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Country</label>
            <input type="text" name="country" defaultValue={company?.country || ''} disabled={!isOwnerOrAdmin} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <input type="text" name="city" defaultValue={company?.city || ''} disabled={!isOwnerOrAdmin} className="form-input" />
          </div>
        </div>

        {isOwnerOrAdmin && (
          <div style={{ marginTop: '1rem' }}>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : 'Save Organization Details'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
