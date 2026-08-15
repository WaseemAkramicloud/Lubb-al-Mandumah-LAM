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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      formData.append('id', company.id)
      await updateCompanyDetailsAction(formData)
      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update company details')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
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
                  Edit Company Details
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                    Display Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={company.name || ''}
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
                    defaultValue={company.legal_name || ''}
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
                    defaultValue={company.company_type || 'standard'}
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
                    defaultValue={company.status || 'Active'}
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
                    defaultValue={company.email || ''}
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
                    defaultValue={company.phone || ''}
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
                    defaultValue={company.country || ''}
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
                    defaultValue={company.city || ''}
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
                    defaultValue={company.website || ''}
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
                    defaultValue={company.assigned_staff || ''}
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
                  defaultValue={company.notes || ''}
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
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.5rem' }}
                >
                  {loading ? 'Saving Changes...' : 'Save Company Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
