'use client'

import { useState } from 'react'
import { saveCmsDraft, publishCmsSection } from '@/lib/actions/cms'
import { MediaPicker } from '@/components/ui/MediaPicker'

interface Props {
  sectionKey: string
  schema: Record<string, unknown>[]
  initialData: Record<string, unknown>
  canPublish: boolean
  previewUrl?: string
}

export default function CmsEditForm({ sectionKey, schema, initialData, canPublish, previewUrl }: Props) {
  const [data, setData] = useState<Record<string, unknown>>(initialData || {})
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  const handleFieldChange = (name: string, value: unknown) => {
    setData(prev => ({ ...prev, [name]: value }))
  }

  const handleArrayChange = (arrayName: string, index: number, fieldName: string, value: unknown) => {
    setData(prev => {
      const arr = [...(prev[arrayName] as Record<string, unknown>[] || [])]
      if (!arr[index]) arr[index] = {}
      arr[index] = { ...arr[index], [fieldName]: value }
      return { ...prev, [arrayName]: arr }
    })
  }

  const addArrayItem = (arrayName: string, template: Record<string, unknown> = {}) => {
    setData(prev => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] as Record<string, unknown>[] || []), template]
    }))
  }

  const removeArrayItem = (arrayName: string, index: number) => {
    setData(prev => {
      const arr = [...(prev[arrayName] as Record<string, unknown>[] || [])]
      arr.splice(index, 1)
      return { ...prev, [arrayName]: arr }
    })
  }

  const moveArrayItem = (arrayName: string, index: number, direction: 'up' | 'down') => {
    setData(prev => {
      const arr = [...(prev[arrayName] as Record<string, unknown>[] || [])]
      if (direction === 'up' && index > 0) {
        [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
      } else if (direction === 'down' && index < arr.length - 1) {
        [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]]
      }
      return { ...prev, [arrayName]: arr }
    })
  }

  const renderField = (field: Record<string, unknown>, value: unknown, onChange: (val: string) => void) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            className="form-input"
            value={(value as string) || ''}
            onChange={e => onChange(e.target.value)}
            rows={5}
            placeholder={`Enter ${field.label}...`}
          />
        )
      case 'image':
        return (
          <MediaPicker 
            value={(value as string) || ''} 
            onChange={onChange} 
            label={`Choose ${field.label}`} 
          />
        )
      case 'text':
      default:
        return (
          <input
            type="text"
            className="form-input"
            value={(value as string) || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={`Enter ${field.label}...`}
          />
        )
    }
  }

  const onSaveDraft = async () => {
    setLoading(true)
    setMsg({ text: '', type: '' })
    const res = await saveCmsDraft(sectionKey, data)
    if (res?.error) {
      setMsg({ text: res.error, type: 'error' })
    } else {
      setMsg({ text: 'Draft saved successfully.', type: 'success' })
    }
    setLoading(false)
  }

  const onPublish = async () => {
    if (!canPublish) return
    setLoading(true)
    setMsg({ text: '', type: '' })
    const res = await publishCmsSection(sectionKey, data)
    if (res?.error) {
      setMsg({ text: res.error, type: 'error' })
    } else {
      setMsg({ text: 'Content published live successfully.', type: 'success' })
    }
    setLoading(false)
  }

  return (
    <div className="lam-card">
      {msg.text && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '4px', 
          marginBottom: '1.5rem', 
          fontSize: 'var(--text-sm)',
          background: msg.type === 'error' ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)',
          color: msg.type === 'error' ? '#e74c3c' : '#2ecc71'
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {schema.map((field) => {
          if (field.type === 'array') {
            const items = (data[field.name as string] as Record<string, unknown>[]) || []
            return (
              <div key={field.name as string} style={{ border: '1px solid var(--lam-border)', borderRadius: '6px', padding: '1.5rem', background: 'var(--lam-surface)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '0.25rem' }}>{field.label as string}</h3>
                {!!field.description && <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>{field.description as string}</p>}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {items.map((item: Record<string, unknown>, index: number) => (
                    <div key={index} style={{ background: 'var(--lam-black)', padding: '1.5rem', border: '1px solid var(--lam-border)', borderRadius: '6px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => moveArrayItem(field.name as string, index, 'up')}
                          disabled={index === 0}
                          style={{ background: 'var(--lam-gunmetal)', border: '1px solid var(--lam-border)', color: index === 0 ? 'var(--lam-silver-dim)' : 'var(--lam-white)', cursor: index === 0 ? 'not-allowed' : 'pointer', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '12px' }}
                          title="Move Up"
                        >
                          &uarr;
                        </button>
                        <button 
                          onClick={() => moveArrayItem(field.name as string, index, 'down')}
                          disabled={index === items.length - 1}
                          style={{ background: 'var(--lam-gunmetal)', border: '1px solid var(--lam-border)', color: index === items.length - 1 ? 'var(--lam-silver-dim)' : 'var(--lam-white)', cursor: index === items.length - 1 ? 'not-allowed' : 'pointer', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '12px' }}
                          title="Move Down"
                        >
                          &darr;
                        </button>
                        <button 
                          onClick={() => removeArrayItem(field.name as string, index)}
                          style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', color: '#e74c3c', cursor: 'pointer', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '12px', marginLeft: '0.5rem' }}
                          title="Remove Item"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div style={{ color: 'var(--lam-gold)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', fontWeight: 600 }}>
                        Item {index + 1}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {(field.fields as Record<string, unknown>[]).map((subField) => (
                          <div key={subField.name as string}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                              {subField.label as string}
                              <span style={{ marginLeft: '0.5rem', color: 'var(--lam-silver-dim)', fontSize: '10px', fontWeight: 'normal', fontFamily: 'monospace' }}>
                                ({subField.name as string})
                              </span>
                            </label>
                            {renderField(subField, item[subField.name as string], (val) => handleArrayChange(field.name as string, index, subField.name as string, val))}
                            {!!subField.description && <p style={{ color: 'var(--lam-silver-dim)', fontSize: '12px', marginTop: '0.4rem' }}>{subField.description as string}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <button 
                    onClick={() => addArrayItem(field.name as string)}
                    className="btn" 
                    style={{ background: 'var(--lam-black)', color: 'var(--lam-silver)', border: '1px dashed var(--lam-border)', width: '100%', padding: '0.75rem' }}
                  >
                    + Add New {field.label as string} Item
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div key={field.name as string}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                {field.label as string}
                <span style={{ marginLeft: '0.5rem', color: 'var(--lam-silver-dim)', fontSize: '10px', fontWeight: 'normal', fontFamily: 'monospace' }}>
                  ({field.name as string})
                </span>
              </label>
              {renderField(field, data[field.name as string], (val) => handleFieldChange(field.name as string, val))}
              {!!field.description && <p style={{ color: 'var(--lam-silver-dim)', fontSize: '12px', marginTop: '0.4rem' }}>{field.description as string}</p>}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--lam-border)', display: 'flex', gap: '1rem' }}>
        <button onClick={onSaveDraft} disabled={loading} className="btn btn-secondary">
          {loading ? 'Saving...' : 'Save Draft'}
        </button>
        {previewUrl && (
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: 'var(--lam-surface)', border: '1px solid var(--lam-border)', color: 'var(--lam-white)', textDecoration: 'none', padding: '0.75rem 1rem', borderRadius: '4px', textAlign: 'center' }}>
            Preview Draft
          </a>
        )}
        {canPublish && (
          <button onClick={onPublish} disabled={loading} className="btn btn-primary">
            Publish to Live Site
          </button>
        )}
      </div>
    </div>
  )
}
