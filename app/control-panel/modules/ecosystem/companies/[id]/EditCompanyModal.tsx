'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCompanyDetailsAction } from '@/lib/actions/ecosystem-admin'

interface EditCompanyModalProps {
  company: any
  staffProfiles?: any[]
}

export function EditCompanyModal({ company, staffProfiles = [] }: EditCompanyModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isReviewStep, setIsReviewStep] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: company.name || '',
    legal_name: company.legal_name || '',
    company_type: company.company_type || 'standard',
    status: company.status || 'Active',
    email: company.email || '',
    phone: company.phone || '',
    country: company.country || '',
    city: company.city || '',
    website: company.website || '',
    assigned_staff: company.assigned_staff || '',
    notes: company.notes || ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Company Name is required')
      return
    }
    setError('')
    setIsReviewStep(true)
  }

  const handleConfirmSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('id', company.id)
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v))

      await updateCompanyDetailsAction(fd)
      setIsOpen(false)
      setIsReviewStep(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update company details')
    } finally {
      setLoading(false)
    }
  }

  // Calculate changes for review step
  const changes = [
    { label: 'Display Name', current: company.name || '-', next: formData.name },
    { label: 'Legal Name', current: company.legal_name || '-', next: formData.legal_name || '-' },
    { label: 'Customer Type', current: (company.company_type || 'standard').toUpperCase(), next: (formData.company_type || 'standard').toUpperCase() },
    { label: 'Account Status', current: company.status || 'Active', next: formData.status },
    { label: 'Primary Email', current: company.email || '-', next: formData.email || '-' },
    { label: 'Main Phone', current: company.phone || '-', next: formData.phone || '-' },
    { label: 'Country', current: company.country || '-', next: formData.country || '-' },
    { label: 'City', current: company.city || '-', next: formData.city || '-' },
    { label: 'Website', current: company.website || '-', next: formData.website || '-' },
    { label: 'Internal Notes', current: company.notes || '-', next: formData.notes || '-' }
  ].filter(c => c.current !== c.next)

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true)
          setIsReviewStep(false)
          setError('')
        }}
        className="btn btn-primary"
        style={{ padding: '0.5rem 1rem', fontSize: 'var(--text-xs)' }}
      >
        ✏️ Edit Company Details
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '640px',
              background: 'var(--lam-surface-elevated)',
              border: '1px solid var(--lam-border)',
              borderRadius: '8px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.75rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '0.25rem' }}>
                  {isReviewStep ? 'Review Company Changes' : 'Edit Company Details'}
                </h2>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-gold)', fontFamily: 'monospace' }}>
                  {company.company_id || company.id}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--lam-silver-dim)',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            {error && (
              <div style={{ padding: '0.85rem', background: 'rgba(231, 76, 60, 0.15)', border: '1px solid rgba(231, 76, 60, 0.3)', color: '#e74c3c', borderRadius: '4px', fontSize: 'var(--text-sm)', marginBottom: '1.25rem' }}>
                {error}
              </div>
            )}

            {!isReviewStep ? (
              <form onSubmit={handleInitialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                      Display Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                      Legal Name
                    </label>
                    <input
                      type="text"
                      name="legal_name"
                      value={formData.legal_name}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                      Customer Type *
                    </label>
                    <select
                      name="company_type"
                      value={formData.company_type}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="standard">Standard Customer</option>
                      <option value="demo">Demo / Trial Customer</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                      Account Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                      Primary Work Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                      Main Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://company.com"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                      Assigned LAM Staff
                    </label>
                    <select
                      name="assigned_staff"
                      value={formData.assigned_staff}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">-- Unassigned --</option>
                      {staffProfiles.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name || ''} ({s.email || s.staff_id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                    Internal Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Administrative notes, SLA terms, key account history..."
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn"
                    style={{ background: 'var(--lam-surface)', color: 'var(--lam-silver)', border: '1px solid var(--lam-border)', padding: '0.6rem 1.25rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1.5rem' }}
                  >
                    Review Changes →
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.25rem' }}>
                  Please review the proposed updates before confirming.
                </p>

                {changes.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {changes.map((c, i) => (
                      <div key={i} style={{ background: 'var(--lam-surface)', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid var(--lam-border)' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          {c.label}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'var(--text-sm)' }}>
                          <span style={{ color: '#e74c3c', textDecoration: 'line-through' }}>{c.current}</span>
                          <span style={{ color: 'var(--lam-gold)' }}>➔</span>
                          <span style={{ color: '#2ecc71', fontWeight: 600 }}>{c.next}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--lam-silver-dim)', background: 'var(--lam-surface)', borderRadius: '6px', marginBottom: '1.5rem' }}>
                    No field values were modified.
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsReviewStep(false)}
                    className="btn"
                    style={{ background: 'var(--lam-surface)', color: 'var(--lam-silver)', border: '1px solid var(--lam-border)', padding: '0.6rem 1.25rem' }}
                  >
                    ← Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSubmit}
                    disabled={loading || changes.length === 0}
                    className="btn btn-primary"
                    style={{ padding: '0.6rem 1.5rem' }}
                  >
                    {loading ? 'Updating Company...' : 'Confirm Update'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
