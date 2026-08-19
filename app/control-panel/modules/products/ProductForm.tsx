'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveProductDraft, publishProduct, unpublishProduct, updateProductId } from '@/lib/actions/products'

interface ProductFormProps {
  initialData?: any
  isNew?: boolean
  canPublish?: boolean
  previewUrl?: string
  staffList?: { id: string; first_name: string; last_name: string }[]
  isSuperadmin?: boolean
}

export function ProductForm({ initialData, isNew = false, canPublish = false, previewUrl, staffList = [], isSuperadmin = false }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [productIdEdit, setProductIdEdit] = useState(false)
  const [newProductId, setNewProductId] = useState(initialData?.product_id || '')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      formData.append('is_new', isNew.toString())
      await saveProductDraft(formData)
      if (isNew) {
        router.push('/control-panel/modules/products')
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    try {
      await publishProduct(initialData.slug)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUnpublish = async () => {
    setLoading(true)
    try {
      await unpublishProduct(initialData.slug)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProductIdChange = async () => {
    if (!window.confirm(`WARNING: Changing the Product ID can break relational records that depend on it. Are you sure you want to change it to "${newProductId.toUpperCase()}"?`)) return
    setLoading(true)
    setError('')
    try {
      await updateProductId(initialData.slug, newProductId)
      router.refresh()
      setProductIdEdit(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sectionHeadingStyle = {
    fontSize: 'var(--text-lg)',
    marginBottom: '1.5rem',
    color: 'var(--lam-gold)',
    paddingTop: '1rem'
  }

  const sectionCardStyle = {
    padding: '1.5rem',
    background: 'rgba(201, 168, 76, 0.03)',
    border: '1px solid rgba(201, 168, 76, 0.15)',
    borderRadius: '6px',
    marginBottom: '1.5rem'
  }

  return (
    <form onSubmit={handleSubmit} className="lam-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '4px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {/* Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--lam-border)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)' }}>{isNew ? 'Create New Product' : 'Edit Product'}</h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={loading} className="btn" style={{ background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid var(--lam-border)' }}>
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          
          {!isNew && previewUrl && (
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              Preview Draft
            </a>
          )}
          
          {!isNew && initialData?.status === 'draft' && canPublish && (
            <button type="button" onClick={handlePublish} disabled={loading} className="btn btn-primary">
              Publish Live
            </button>
          )}
          
          {!isNew && initialData?.status === 'published' && canPublish && (
            <button type="button" onClick={handleUnpublish} disabled={loading} className="btn" style={{ border: '1px solid #e74c3c', color: '#e74c3c' }}>
              Unpublish
            </button>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* SECTION A: PUBLIC PRODUCT CONTENT                                */}
      {/* ================================================================ */}
      <h3 style={sectionHeadingStyle}>Public Product Content</h3>
      <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
        These fields control what appears on the LAM public website.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="form-group">
          <label>Product Name</label>
          <input type="text" name="name" required defaultValue={initialData?.name} className="form-input" />
        </div>
        
        <div className="form-group">
          <label>Slug (URL path)</label>
          <input type="text" name="slug" required defaultValue={initialData?.slug} className="form-input" disabled={!isNew} />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category" required defaultValue={initialData?.category || 'SaaS'} className="form-input">
            <option>SaaS</option>
            <option>Education</option>
            <option>Institutional</option>
            <option>Platforms</option>
          </select>
        </div>

        <div className="form-group">
          <label>Tagline</label>
          <input type="text" name="tagline" required defaultValue={initialData?.tagline} className="form-input" />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Short Description (Used in cards/SEO)</label>
        <textarea name="description" required defaultValue={initialData?.description} className="form-input" rows={3} />
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" name="restricted" value="true" defaultChecked={initialData?.restricted} />
          Restricted Access (e.g. Diplomatic)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" name="coming_soon" value="true" defaultChecked={initialData?.coming_soon} />
          Coming Soon
        </label>
        <div className="form-group" style={{ margin: 0, flex: 1 }}>
          <input type="text" name="badge" placeholder="Optional Badge (e.g. By Invitation)" defaultValue={initialData?.badge} className="form-input" style={{ padding: '0.25rem 0.5rem' }} />
        </div>
      </div>

      <div className="lam-divider" style={{ margin: '3rem 0' }} />

      <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '1.5rem', color: 'var(--lam-gold)' }}>Detail Page Content</h3>

      <div className="form-group">
        <label>What It Is</label>
        <textarea name="whatItIs" required defaultValue={initialData?.detail?.whatItIs} className="form-input" rows={3} />
      </div>

      <div className="form-group">
        <label>Who It Is For</label>
        <textarea name="whoItIsFor" required defaultValue={initialData?.detail?.whoItIsFor} className="form-input" rows={2} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
        <div className="form-group">
          <label>Problems Solved (One per line)</label>
          <textarea name="problemsSolved" required defaultValue={initialData?.detail?.problemsSolved?.join('\n')} className="form-input" rows={5} />
        </div>
        
        <div className="form-group">
          <label>Key Capabilities (One per line)</label>
          <textarea name="keyCapabilities" required defaultValue={initialData?.detail?.keyCapabilities?.join('\n')} className="form-input" rows={5} />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Benefits (One per line)</label>
        <textarea name="benefits" required defaultValue={initialData?.detail?.benefits?.join('\n')} className="form-input" rows={4} />
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Deployment Note</label>
        <input type="text" name="deploymentNote" required defaultValue={initialData?.detail?.deploymentNote} className="form-input" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
        <div className="form-group">
          <label>Related Solutions (Slugs, comma separated)</label>
          <input type="text" name="relatedSolutions" defaultValue={initialData?.detail?.relatedSolutions?.join(', ')} className="form-input" placeholder="e.g. atom, pointo" />
        </div>
        
        <div className="form-group">
          <label>CTA Type</label>
          <select name="ctaType" required defaultValue={initialData?.detail?.ctaType || 'demo'} className="form-input">
            <option value="demo">Request Demo</option>
            <option value="quote">Request Quote</option>
            <option value="institutional">Institutional Access</option>
            <option value="partnership">Partnership</option>
          </select>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SECTION B: INTERNAL PRODUCT INFORMATION                          */}
      {/* ================================================================ */}
      <div className="lam-divider" style={{ margin: '3rem 0' }} />
      
      <div style={sectionCardStyle}>
        <h3 style={{ ...sectionHeadingStyle, paddingTop: 0, marginBottom: '0.5rem' }}>Internal Product Information</h3>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ⚠ Internal only — never displayed on the public website
        </p>

        {/* Product ID */}
        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', border: '1px solid var(--lam-border)' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Permanent Product ID</label>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', marginBottom: '0.75rem' }}>
            Immutable internal identifier (e.g. ATOM, NEXORA). Used as the relational key throughout LAM.
          </p>
          
          {isNew ? (
            <input
              type="text"
              name="product_id"
              placeholder="e.g. ATOM, NEXORA, POINTO"
              className="form-input"
              style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600 }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {productIdEdit && isSuperadmin ? (
                <>
                  <input
                    type="text"
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                    className="form-input"
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600, flex: 1 }}
                  />
                  <button type="button" onClick={handleProductIdChange} disabled={loading} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    Save
                  </button>
                  <button type="button" onClick={() => { setProductIdEdit(false); setNewProductId(initialData?.product_id || '') }} className="btn" style={{ padding: '0.5rem 1rem', border: '1px solid var(--lam-border)', color: 'var(--lam-silver)' }}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--lam-gold)', letterSpacing: '0.05em' }}>
                    {initialData?.product_id || 'NOT SET'}
                  </span>
                  {isSuperadmin && (
                    <button type="button" onClick={() => setProductIdEdit(true)} style={{ background: 'none', border: 'none', color: 'var(--lam-silver-dim)', cursor: 'pointer', fontSize: 'var(--text-xs)', textDecoration: 'underline' }}>
                      Edit (Superadmin)
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="form-group">
            <label>Product Type</label>
            <select name="product_type" defaultValue={initialData?.product_type || ''} className="form-input">
              <option value="">— Select —</option>
              <option value="SaaS">SaaS</option>
              <option value="Platform">Platform</option>
              <option value="Internal System">Internal System</option>
              <option value="Service">Service</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Lifecycle Status</label>
            <select name="lifecycle_status" defaultValue={initialData?.lifecycle_status || 'Active'} className="form-input">
              <option value="Concept">Concept</option>
              <option value="Planning">Planning</option>
              <option value="Development">Development</option>
              <option value="Testing">Testing</option>
              <option value="Beta">Beta</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Deprecated">Deprecated</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>Database Architecture</label>
          <input type="text" name="db_architecture" defaultValue={initialData?.db_architecture || 'Separate Product Project'} className="form-input" style={{ color: 'var(--lam-silver-dim)' }} />
          <small style={{ color: 'var(--lam-silver-dim)', marginTop: '0.25rem', display: 'block' }}>Informational only — describes where this product's operational data lives.</small>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
          <div className="form-group">
            <label>Product Application URL</label>
            <input type="url" name="app_url" placeholder="https://app.example.com" defaultValue={initialData?.app_url || ''} className="form-input" />
          </div>

          <div className="form-group">
            <label>Product Admin URL</label>
            <input type="url" name="admin_url" placeholder="https://admin.example.com" defaultValue={initialData?.admin_url || ''} className="form-input" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="form-group">
            <label>Product Owner</label>
            <select name="product_owner" defaultValue={initialData?.product_owner || ''} className="form-input">
              <option value="">— None —</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Technical Owner</label>
            <select name="technical_owner" defaultValue={initialData?.technical_owner || ''} className="form-input">
              <option value="">— None —</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Commercial Owner</label>
            <select name="commercial_owner" defaultValue={initialData?.commercial_owner || ''} className="form-input">
              <option value="">— None —</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label>Internal Version</label>
          <input type="text" name="internal_version" placeholder="e.g. v2.1.0-beta" defaultValue={initialData?.internal_version || ''} className="form-input" />
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>Internal Notes</label>
          <textarea name="internal_notes" placeholder="Internal development notes, roadmap items, team discussions..." defaultValue={initialData?.internal_notes || ''} className="form-input" rows={4} />
        </div>
      </div>

      {/* ================================================================ */}
      {/* PRODUCT INTEGRATION METADATA                                     */}
      {/* ================================================================ */}
      <div style={sectionCardStyle}>
        <h3 style={{ ...sectionHeadingStyle, paddingTop: 0, marginBottom: '0.5rem' }}>Product Integration</h3>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Future-ready metadata — administrative placeholders for eventual integrations
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="form-group">
            <label>Integration Status</label>
            <select name="integration_status" defaultValue={initialData?.integration_status || 'Not Configured'} className="form-input">
              <option value="Not Configured">Not Configured</option>
              <option value="Development">Development</option>
              <option value="Connected">Connected</option>
              <option value="Warning">Warning</option>
              <option value="Error">Error</option>
            </select>
          </div>

          <div className="form-group">
            <label>SSO Status</label>
            <select name="sso_status" defaultValue={initialData?.sso_status || 'Not Configured'} className="form-input">
              <option value="Not Configured">Not Configured</option>
              <option value="Planned">Planned</option>
              <option value="Enabled">Enabled</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
          <div className="form-group">
            <label>Product API Base URL</label>
            <input type="url" name="api_base_url" placeholder="https://api.product.example.com" defaultValue={initialData?.api_base_url || ''} className="form-input" />
          </div>

          <div className="form-group">
            <label>Health Check URL</label>
            <input type="url" name="health_check_url" placeholder="https://api.product.example.com/health" defaultValue={initialData?.health_check_url || ''} className="form-input" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
          <div className="form-group">
            <label>Webhook URL</label>
            <input type="url" name="webhook_url" placeholder="https://api.product.example.com/webhook" defaultValue={initialData?.webhook_url || ''} className="form-input" />
          </div>

          <div className="form-group">
            <label>External Product Reference</label>
            <input type="text" name="external_product_ref" placeholder="External ID or reference" defaultValue={initialData?.external_product_ref || ''} className="form-input" />
          </div>
        </div>

        {!isNew && initialData?.last_sync_at && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
            <span style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Last Successful Sync: </span>
            <span style={{ color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
              {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(initialData.last_sync_at))}
            </span>
          </div>
        )}

        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label>Integration Notes</label>
          <textarea name="integration_notes" placeholder="Notes about API integration, connectivity, planned features..." defaultValue={initialData?.integration_notes || ''} className="form-input" rows={3} />
        </div>
      </div>
    </form>
  )
}
