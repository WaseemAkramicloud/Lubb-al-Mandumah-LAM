'use client'

import { useState, useEffect, useRef } from 'react'
import { getMediaAssets, uploadMedia } from '@/lib/actions/media'
import Image from 'next/image'

interface MediaAsset {
  id: string
  file_name: string
  file_url: string
  alt_text: string
  size_bytes: number
  mime_type: string
}

interface MediaPickerProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function MediaPicker({ value, onChange, label = 'Select Image' }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (isOpen) {
      loadAssets()
    }
  }, [isOpen])

  const loadAssets = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMediaAssets()
      setAssets(data)
    } catch (err: any) {
      setError('Failed to load media assets.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      await uploadMedia(formData)
      formRef.current?.reset()
      await loadAssets() // Refresh the list
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const selectAsset = (url: string) => {
    onChange(url)
    setIsOpen(false)
  }

  const removeAsset = () => {
    onChange('')
  }

  return (
    <div style={{ width: '100%' }}>
      {value ? (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', border: '1px solid var(--lam-border)', padding: '1rem', borderRadius: '4px', background: 'var(--lam-black)' }}>
          <div style={{ position: 'relative', width: '120px', height: '80px', borderRadius: '4px', overflow: 'hidden', background: 'var(--lam-gunmetal)' }}>
            <Image src={value} alt="Preview" fill style={{ objectFit: 'cover' }} unoptimized />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ color: 'var(--lam-silver)', fontSize: 'var(--text-sm)', wordBreak: 'break-all', margin: 0 }}>
              {value}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" onClick={() => setIsOpen(true)} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: 'var(--text-xs)' }}>
                Replace
              </button>
              <button type="button" onClick={removeAsset} className="btn" style={{ padding: '0.25rem 0.75rem', fontSize: 'var(--text-xs)', border: '1px solid #e74c3c', color: '#e74c3c', background: 'rgba(231,76,60,0.1)' }}>
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setIsOpen(true)} className="btn" style={{ width: '100%', background: 'var(--lam-surface)', color: 'var(--lam-silver)', border: '1px dashed var(--lam-border)', padding: '1rem' }}>
          + {label}
        </button>
      )}

      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', padding: '2rem' }}>
          <div style={{ background: 'var(--lam-charcoal)', width: '100%', maxWidth: '1000px', maxHeight: '90vh', borderRadius: '8px', display: 'flex', flexDirection: 'column', border: '1px solid var(--lam-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--lam-border)' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-white)', margin: 0 }}>Select Media</h2>
              <button type="button" onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--lam-silver)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              
              <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--lam-surface)', borderRadius: '4px', border: '1px dashed var(--lam-border)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-silver)', marginBottom: '1rem' }}>Upload New Image</h3>
                {error && <div style={{ color: '#e74c3c', fontSize: 'var(--text-xs)', marginBottom: '1rem' }}>{error}</div>}
                <form ref={formRef} onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <input type="file" name="file" required accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" className="form-input" style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="text" name="alt_text" placeholder="Alt text (optional)" className="form-input" />
                  </div>
                  <button type="submit" disabled={uploading} className="btn btn-primary" style={{ height: '42px' }}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </form>
              </div>

              <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-silver)', marginBottom: '1rem' }}>Existing Library</h3>
              
              {loading ? (
                <p style={{ color: 'var(--lam-silver-dim)' }}>Loading...</p>
              ) : assets.length === 0 ? (
                <p style={{ color: 'var(--lam-silver-dim)' }}>No media assets found.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                  {assets.filter(a => a.mime_type.startsWith('image/')).map(asset => (
                    <div 
                      key={asset.id} 
                      onClick={() => selectAsset(asset.file_url)}
                      style={{ 
                        border: '1px solid var(--lam-border)', 
                        borderRadius: '4px', 
                        overflow: 'hidden', 
                        cursor: 'pointer',
                        background: 'var(--lam-black)',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--lam-gold)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--lam-border)'}
                    >
                      <div style={{ position: 'relative', width: '100%', height: '120px', background: 'var(--lam-gunmetal)' }}>
                        <Image src={asset.file_url} alt={asset.alt_text || 'Media asset'} fill style={{ objectFit: 'cover' }} unoptimized />
                      </div>
                      <div style={{ padding: '0.5rem' }}>
                        <p style={{ color: 'var(--lam-silver)', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                          {asset.file_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--lam-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
