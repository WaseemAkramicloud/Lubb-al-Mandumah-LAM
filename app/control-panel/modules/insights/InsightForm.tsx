'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveInsightDraft, publishInsight, unpublishInsight } from '@/lib/actions/insights'

export function InsightForm({ initialData, isNew = false }: { initialData?: any, isNew?: boolean }) {
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
      await saveInsightDraft(formData)
      if (isNew) {
        router.push('/control-panel/modules/insights')
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
      await publishInsight(initialData.slug)
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
      await unpublishInsight(initialData.slug)
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--lam-border)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)' }}>{isNew ? 'Create Article' : 'Edit Article'}</h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={loading} className="btn" style={{ background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid var(--lam-border)' }}>
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          
          {!isNew && initialData?.status === 'draft' && (
            <button type="button" onClick={handlePublish} disabled={loading} className="btn btn-primary">
              Publish Live
            </button>
          )}
          
          {!isNew && initialData?.status === 'published' && (
            <button type="button" onClick={handleUnpublish} disabled={loading} className="btn" style={{ border: '1px solid #e74c3c', color: '#e74c3c' }}>
              Unpublish
            </button>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Article Title</label>
        <input type="text" name="title" required defaultValue={initialData?.title} className="form-input" />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
        <div className="form-group">
          <label>Slug (URL path)</label>
          <input type="text" name="slug" required defaultValue={initialData?.slug} className="form-input" disabled={!isNew} />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category" required defaultValue={initialData?.category || 'Articles'} className="form-input">
            <option>Articles</option>
            <option>Product Updates</option>
            <option>Business Technology</option>
            <option>ERP & Automation</option>
            <option>Digital Transformation</option>
            <option>Guides</option>
            <option>News</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
        <div className="form-group">
          <label>Publish Date</label>
          <input type="date" name="date" required defaultValue={initialData?.date || new Date().toISOString().split('T')[0]} className="form-input" />
        </div>

        <div className="form-group">
          <label>Author</label>
          <input type="text" name="author" required defaultValue={initialData?.author || 'LΛM Strategy'} className="form-input" />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Excerpt / Summary</label>
        <textarea name="excerpt" required defaultValue={initialData?.excerpt} className="form-input" rows={3} />
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Article Content (HTML/Markdown)</label>
        <textarea name="content" required defaultValue={initialData?.content} className="form-input" rows={15} style={{ fontFamily: 'monospace' }} />
      </div>

    </form>
  )
}
