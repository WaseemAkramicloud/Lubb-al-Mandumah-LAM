'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { grantCompanyEntitlement, revokeCompanyEntitlement } from '@/lib/actions/ecosystem-admin'

interface Props {
  entitlements: any[]
  companies: any[]
  products: any[]
}

export function EntitlementsClient({ entitlements, companies, products }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showGrantForm, setShowGrantForm] = useState(false)

  const handleGrant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const res = await grantCompanyEntitlement(formData)
      if (res.success) {
        setShowGrantForm(false)
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (companyId: string, productSlug: string) => {
    if (!window.confirm(`Are you sure you want to suspend subscription for ${productSlug.toUpperCase()}?`)) return
    setLoading(true)
    setError('')
    try {
      await revokeCompanyEntitlement(companyId, productSlug)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '4px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowGrantForm(prev => !prev)}
          className="btn btn-primary"
        >
          {showGrantForm ? 'Close Form' : '+ Assign Product Subscription'}
        </button>
      </div>

      {/* Grant Form */}
      {showGrantForm && (
        <div className="lam-card" style={{ marginBottom: '2rem', border: '1px solid var(--lam-gold)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1.5rem' }}>
            Assign / Update Product Subscription
          </h2>

          <form onSubmit={handleGrant} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Select Client</label>
              <select name="company_id" required className="form-input">
                <option value="">— Select Client —</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.company_id || 'ID'})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Product</label>
              <select name="product_slug" required className="form-input">
                <option value="">— Select Product —</option>
                {products.map(p => (
                  <option key={p.slug} value={p.slug}>{p.name} ({p.slug})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Plan Tier</label>
              <select name="plan_tier" defaultValue="standard" className="form-input">
                <option value="demo">Demo / Trial</option>
                <option value="starter">Starter</option>
                <option value="standard">Standard</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div className="form-group">
              <label>Max Seat Limit</label>
              <input type="number" name="max_seats" defaultValue="10" min="1" required className="form-input" />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" defaultValue="active" className="form-input">
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="form-group">
              <label>Expiration Date (Optional)</label>
              <input type="date" name="expires_at" className="form-input" />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving Subscription...' : 'Confirm Subscription Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entitlements Table */}
      <div className="lam-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--lam-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Client</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Product</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Subscription Plan</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Seat Limit</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entitlements.map(ent => {
              const comp = ent.company || { name: 'Unknown', company_id: '' }
              const prod = ent.product || { name: ent.product_slug }

              return (
                <tr key={ent.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                  <td style={{ padding: '1rem' }}>
                    {comp.id ? (
                      <Link href={`/control-panel/modules/ecosystem/companies/${comp.id}`} style={{ color: 'var(--lam-gold)', textDecoration: 'none', fontWeight: 600 }}>
                        {comp.name}
                      </Link>
                    ) : (
                      <div style={{ color: 'var(--lam-white)', fontWeight: 500 }}>{comp.name}</div>
                    )}
                    <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>{comp.company_id}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--lam-white)' }}>{prod.name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--lam-gold)' }}>{ent.product_slug}</div>
                  </td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    {ent.plan_tier}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    {ent.max_seats} Seats
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '3px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: ent.status === 'active' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                      color: ent.status === 'active' ? '#2ecc71' : '#e74c3c'
                    }}>
                      {ent.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {ent.status === 'active' && (
                      <button
                        onClick={() => handleRevoke(ent.company_id, ent.product_slug)}
                        disabled={loading}
                        style={{
                          background: 'none',
                          border: '1px solid #e74c3c',
                          color: '#e74c3c',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '3px',
                          fontSize: 'var(--text-xs)',
                          cursor: 'pointer'
                        }}
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}

            {entitlements.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No product entitlements recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
