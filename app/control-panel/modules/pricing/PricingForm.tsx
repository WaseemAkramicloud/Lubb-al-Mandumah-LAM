'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { savePricingPlan } from '@/lib/actions/pricing'
import Link from 'next/link'

export default function PricingForm({ initialData = null, products = [] }: { initialData?: any, products?: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    try {
      const res = await savePricingPlan(formData)
      if (res.success) {
        router.push('/control-panel/modules/pricing')
      } else {
        setError(res.error || 'Failed to save pricing plan')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lam-card">
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '4px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {initialData && <input type="hidden" name="id" value={initialData.id} />}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Related Product</label>
            <select name="product_slug" className="form-input" required defaultValue={initialData?.product_slug || ''}>
              <option value="" disabled>Select a product...</option>
              {products.map(p => (
                <option key={p.slug} value={p.slug}>{p.title}</option>
              ))}
            </select>
            <small style={{ color: 'var(--lam-silver-dim)', marginTop: '0.25rem', display: 'block' }}>Which product page should display this plan?</small>
          </div>
          
          <div className="form-group">
            <label className="form-label">Plan Name</label>
            <input type="text" name="plan_name" className="form-input" required defaultValue={initialData?.plan_name || ''} placeholder="e.g., Starter, Enterprise" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Currency Symbol</label>
            <input type="text" name="currency" className="form-input" defaultValue={initialData?.currency || ''} placeholder="e.g., $, €, SAR" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Display Price</label>
            <input type="text" name="display_price" className="form-input" required defaultValue={initialData?.display_price || ''} placeholder="e.g., 99, 0, or 'Contact Sales'" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Billing Period</label>
            <input type="text" name="billing_period_label" className="form-input" defaultValue={initialData?.billing_period_label || ''} placeholder="e.g., /month per user" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Features (One per line)</label>
          <textarea 
            name="features" 
            className="form-input" 
            rows={6} 
            required
            defaultValue={initialData?.features ? initialData.features.join('\n') : ''}
            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">CTA Text</label>
            <input type="text" name="cta_text" className="form-input" required defaultValue={initialData?.cta_text || 'Get Started'} />
          </div>
          
          <div className="form-group">
            <label className="form-label">CTA Link</label>
            <input type="text" name="cta_link" className="form-input" required defaultValue={initialData?.cta_link || '/contact'} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Display Order</label>
            <input type="number" name="order_index" className="form-input" required defaultValue={initialData?.order_index || '0'} />
            <small style={{ color: 'var(--lam-silver-dim)', marginTop: '0.25rem', display: 'block' }}>Lower numbers appear first.</small>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Plan')}
          </button>
          <Link href="/control-panel/modules/pricing" className="btn" style={{ background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid var(--lam-border)' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
