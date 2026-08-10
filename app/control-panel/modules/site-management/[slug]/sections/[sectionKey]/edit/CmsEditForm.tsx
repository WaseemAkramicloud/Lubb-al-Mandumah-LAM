'use client'

import { useState } from 'react'
import { saveCmsDraft, publishCmsSection } from '@/lib/actions/cms'

interface Props {
  sectionKey: string
  schema: Record<string, unknown>[]
  initialData: Record<string, unknown>
  canPublish: boolean
}

export default function CmsEditForm({ sectionKey, schema, initialData, canPublish }: Props) {
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

  const renderField = (field: Record<string, unknown>, value: unknown, onChange: (val: string) => void) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            className="form-input"
            value={(value as string) || ''}
            onChange={e => onChange(e.target.value)}
            rows={4}
            placeholder={field.label as string}
          />
        )
      case 'image':
      case 'text':
      default:
        return (
          <input
            type="text"
            className="form-input"
            value={(value as string) || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={field.label as string}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {schema.map((field) => {
          if (field.type === 'array') {
            const items = (data[field.name as string] as Record<string, unknown>[]) || []
            return (
              <div key={field.name as string} style={{ border: '1px solid var(--lam-border)', borderRadius: '4px', padding: '1.5rem' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1rem' }}>{field.label as string}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {items.map((item: Record<string, unknown>, index: number) => (
                    <div key={index} style={{ background: 'var(--lam-black)', padding: '1rem', border: '1px solid var(--lam-border)', borderRadius: '4px', position: 'relative' }}>
                      <button 
                        onClick={() => removeArrayItem(field.name as string, index)}
                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                        title="Remove Item"
                      >
                        ✕
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                        {(field.fields as Record<string, unknown>[]).map((subField) => (
                          <div key={subField.name as string}>
                            <label className="form-label">{subField.label as string}</label>
                            {renderField(subField, item[subField.name as string], (val) => handleArrayChange(field.name as string, index, subField.name as string, val))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => addArrayItem(field.name as string)}
                  className="btn" 
                  style={{ marginTop: '1rem', background: 'var(--lam-surface)', color: 'var(--lam-silver)', border: '1px dashed var(--lam-border)', width: '100%' }}
                >
                  + Add {field.label as string} Item
                </button>
              </div>
            )
          }

          return (
            <div key={field.name as string}>
              <label className="form-label">{field.label as string}</label>
              {renderField(field, data[field.name as string], (val) => handleFieldChange(field.name as string, val))}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--lam-border)', display: 'flex', gap: '1rem' }}>
        <button onClick={onSaveDraft} disabled={loading} className="btn btn-secondary">
          {loading ? 'Saving...' : 'Save Draft'}
        </button>
        {canPublish && (
          <button onClick={onPublish} disabled={loading} className="btn btn-primary">
            Publish to Live Site
          </button>
        )}
      </div>
    </div>
  )
}
