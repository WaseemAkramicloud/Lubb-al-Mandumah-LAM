'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveCollectionDraft, publishCollection, unpublishCollection } from '@/lib/actions/collections'

export function CollectionForm({ initialData, isNew = false, type, canPublish = false, previewUrl }: { initialData?: any, isNew?: boolean, type: 'solution' | 'industry', canPublish?: boolean, previewUrl?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      formData.append('type', type)
      formData.append('is_new', isNew.toString())
      
      await saveCollectionDraft(formData)

      if (isNew) {
        router.push(`/control-panel/modules/${type}s`)
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
      await publishCollection(initialData.slug, type)
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
      await unpublishCollection(initialData.slug, type)
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
        <h2 style={{ fontSize: 'var(--text-xl)', textTransform: 'capitalize' }}>{isNew ? `Create New ${type}` : `Edit ${type}`}</h2>
        
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
          <label>Title</label>
          <input type="text" name="title" required defaultValue={initialData?.title} className="form-input" />
        </div>
        
        <div className="form-group">
          <label>Slug (URL path)</label>
          <input type="text" name="slug" required defaultValue={initialData?.slug} className="form-input" disabled={!isNew} />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Description</label>
        <textarea name="description" required defaultValue={initialData?.data?.description} className="form-input" rows={3} />
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Common Needs (One per line)</label>
        <textarea name="commonNeeds" required defaultValue={initialData?.data?.commonNeeds?.join('\n')} className="form-input" rows={5} />
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Related Products (Slugs, comma separated)</label>
        <input type="text" name="relatedProducts" defaultValue={initialData?.data?.relatedProducts?.join(', ')} className="form-input" placeholder="e.g. atom, aimhighserp" />
      </div>

    </form>
  )
}
