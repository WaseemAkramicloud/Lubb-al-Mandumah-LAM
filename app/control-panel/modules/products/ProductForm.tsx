'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveProductDraft, publishProduct, unpublishProduct } from '@/lib/actions/products'

export function ProductForm({ initialData, isNew = false, canPublish = false, previewUrl }: { initialData?: any, isNew?: boolean, canPublish?: boolean, previewUrl?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  return (
    <form onSubmit={handleSubmit} className="lam-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
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
          <select name="category" required defaultValue={initialData?.category || 'Business Software'} className="form-input">
            <option>Business Software</option>
            <option>Education</option>
            <option>Institutional Systems</option>
            <option>Platform Ecosystems</option>
            <option>Applications</option>
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
    </form>
  )
}
