'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveCareerDraft, publishCareer, unpublishCareer } from '@/lib/actions/careers'

export function CareerForm({ initialData, isNew = false }: { initialData?: any, isNew?: boolean }) {
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
      await saveCareerDraft(formData)
      if (isNew) {
        router.push('/control-panel/modules/careers')
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
      await publishCareer(initialData.slug)
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
      await unpublishCareer(initialData.slug)
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
        <h2 style={{ fontSize: 'var(--text-xl)' }}>{isNew ? 'Create Vacancy' : 'Edit Vacancy'}</h2>
        
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="form-group">
          <label>Role Title</label>
          <input type="text" name="title" required defaultValue={initialData?.title} className="form-input" />
        </div>
        
        <div className="form-group">
          <label>Slug (URL path)</label>
          <input type="text" name="slug" required defaultValue={initialData?.slug} className="form-input" disabled={!isNew} />
        </div>

        <div className="form-group">
          <label>Department</label>
          <input type="text" name="department" required defaultValue={initialData?.data?.department || 'Engineering'} className="form-input" />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input type="text" name="location" required defaultValue={initialData?.data?.location || 'Remote'} className="form-input" />
        </div>

        <div className="form-group">
          <label>Job Type</label>
          <select name="job_type" required defaultValue={initialData?.data?.type || 'Full-time'} className="form-input">
            <option>Full-time</option>
            <option>Contract</option>
            <option>Part-time</option>
            <option>Internship</option>
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Description</label>
        <textarea name="description" required defaultValue={initialData?.data?.description} className="form-input" rows={6} />
      </div>

      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Requirements (One per line)</label>
        <textarea name="requirements" required defaultValue={initialData?.data?.requirements?.join('\n')} className="form-input" rows={6} />
      </div>

    </form>
  )
}
