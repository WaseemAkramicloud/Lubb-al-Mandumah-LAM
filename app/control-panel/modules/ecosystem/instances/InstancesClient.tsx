'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProductInstance } from '@/lib/actions/ecosystem-admin'

interface Props {
  instances: any[]
  companies: any[]
  products: any[]
}

export function InstancesClient({ instances, companies, products }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const res = await createProductInstance(formData)
      if (res.success) {
        setShowForm(false)
        router.refresh()
      }
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
        <button onClick={() => setShowForm(prev => !prev)} className="btn btn-primary">
          {showForm ? 'Close Form' : '+ Register Tenant Instance'}
        </button>
      </div>

      {/* Register Instance Form */}
      {showForm && (
        <div className="lam-card" style={{ marginBottom: '2rem', border: '1px solid var(--lam-gold)' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1.5rem' }}>
            Register / Update Product Instance Reference
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Select Organization</label>
              <select name="company_id" required className="form-input">
                <option value="">— Select Organization —</option>
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
              <label>Instance Key / Identifier</label>
              <input type="text" name="instance_key" required placeholder="e.g. nexora-acme-prod" className="form-input" style={{ fontFamily: 'monospace' }} />
            </div>

            <div className="form-group">
              <label>Application Instance URL</label>
              <input type="url" name="instance_url" required placeholder="https://acme.nexora.lam.com" className="form-input" />
            </div>

            <div className="form-group">
              <label>Environment</label>
              <select name="environment" defaultValue="production" className="form-input">
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="sandbox">Sandbox</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" defaultValue="active" className="form-input">
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving Instance...' : 'Save Instance Reference'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Instances Table */}
      <div className="lam-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--lam-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Company</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Product</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Instance Key</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Instance URL</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Env</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {instances.map(inst => {
              const comp = inst.company || { name: 'Unknown', company_id: '' }
              const prod = inst.product || { name: inst.product_slug }

              return (
                <tr key={inst.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--lam-white)', fontWeight: 500 }}>{comp.name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>{comp.company_id}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--lam-white)' }}>{prod.name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--lam-gold)' }}>{inst.product_slug}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-light)' }}>
                      {inst.instance_key}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <a href={inst.instance_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--lam-gold)', textDecoration: 'none', fontSize: 'var(--text-xs)' }}>
                      {inst.instance_url} ↗
                    </a>
                  </td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
                    {inst.environment}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '3px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: inst.status === 'active' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(241, 196, 15, 0.1)',
                      color: inst.status === 'active' ? '#2ecc71' : '#f1c40f'
                    }}>
                      {inst.status}
                    </span>
                  </td>
                </tr>
              )
            })}

            {instances.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No product tenant instances registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
