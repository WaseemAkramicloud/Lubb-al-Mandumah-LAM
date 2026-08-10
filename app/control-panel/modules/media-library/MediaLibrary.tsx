'use client'

import { useState, useRef } from 'react'
import { uploadMedia, deleteMedia } from '@/lib/actions/media'

export function MediaLibrary({ assets }: { assets: any[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      await uploadMedia(formData)
      formRef.current?.reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, url: string) => {
    if (!window.confirm("Are you sure you want to delete this asset? This will break any pages that currently reference it.")) {
      return
    }

    try {
      await deleteMedia(id, url)
    } catch (err: any) {
      alert("Failed to delete: " + err.message)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    alert("Copied URL to clipboard!")
  }

  return (
    <div>
      {/* Uploader */}
      <div className="lam-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '1.5rem' }}>Upload New Asset</h2>
        
        {error && (
          <div style={{ padding: '1rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '4px', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1.5rem', alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Select File (Max 5MB)</label>
            <input type="file" name="file" required accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" className="form-input" style={{ paddingTop: '0.6rem' }} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Alt Text / Description</label>
            <input type="text" name="alt_text" required placeholder="Description for SEO/accessibility" className="form-input" />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ height: '42px' }}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {assets.map((asset) => (
          <div key={asset.id} className="lam-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '150px', background: 'var(--lam-gunmetal)', borderRadius: '4px', marginBottom: '1rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {asset.mime_type.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.file_url} alt={asset.alt_text} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ color: 'var(--lam-silver-dim)' }}>PDF Document</div>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', wordBreak: 'break-all', marginBottom: '0.25rem' }}>
                {asset.file_name}
              </p>
              <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', marginBottom: '1rem' }}>
                {asset.alt_text} • {(asset.size_bytes / 1024).toFixed(0)} KB
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button 
                onClick={() => copyToClipboard(asset.file_url)}
                className="btn" 
                style={{ flex: 1, padding: '0.5rem', fontSize: 'var(--text-xs)', background: 'var(--lam-gunmetal)', border: '1px solid var(--lam-border)', color: 'white' }}
              >
                Copy URL
              </button>
              <button 
                onClick={() => handleDelete(asset.id, asset.file_url)}
                className="btn" 
                style={{ padding: '0.5rem', fontSize: 'var(--text-xs)', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', color: '#e74c3c' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {assets.length === 0 && (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--lam-silver-dim)', border: '1px dashed var(--lam-border)', borderRadius: 'var(--radius-lg)' }}>
          No media assets found. Upload a file to get started.
        </div>
      )}
    </div>
  )
}
