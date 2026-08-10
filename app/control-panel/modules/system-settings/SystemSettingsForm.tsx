'use client'

import { useState } from 'react'
import { updateSystemSettings } from '@/lib/actions/system'

export function SystemSettingsForm({ settingsMap }: { settingsMap: Record<string, any> }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  const companyInfo = settingsMap['company_info'] || {}
  const socialLinks = settingsMap['social_links'] || {}
  const seoDefaults = settingsMap['seo_defaults'] || {}

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', type: '' })
    
    try {
      const formData = new FormData(e.currentTarget)
      const res = await updateSystemSettings(formData)
      
      if (res.success) {
        setMsg({ text: 'Global System Settings updated successfully.', type: 'success' })
      } else {
        setMsg({ text: res.error || 'Failed to update settings', type: 'error' })
      }
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {msg.text && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '4px', 
          fontSize: 'var(--text-sm)',
          background: msg.type === 'error' ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)',
          color: msg.type === 'error' ? '#e74c3c' : '#2ecc71'
        }}>
          {msg.text}
        </div>
      )}

      {/* Company Info */}
      <div className="lam-card">
        <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-white)', marginBottom: '1.5rem' }}>Company Contact Information</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input type="text" name="company_name" className="form-input" defaultValue={companyInfo.name || ''} />
          </div>
          <div className="form-group">
            <label className="form-label">Public Email</label>
            <input type="email" name="company_email" className="form-input" defaultValue={companyInfo.email || ''} />
          </div>
          <div className="form-group">
            <label className="form-label">Public Phone</label>
            <input type="text" name="company_phone" className="form-input" defaultValue={companyInfo.phone || ''} />
          </div>
          <div className="form-group">
            <label className="form-label">Headquarters Address</label>
            <input type="text" name="company_address" className="form-input" defaultValue={companyInfo.address || ''} />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="lam-card">
        <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-white)', marginBottom: '1.5rem' }}>Social Media Links</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">LinkedIn URL</label>
            <input type="url" name="social_linkedin" className="form-input" defaultValue={socialLinks.linkedin || ''} />
          </div>
          <div className="form-group">
            <label className="form-label">Twitter/X URL</label>
            <input type="url" name="social_twitter" className="form-input" defaultValue={socialLinks.twitter || ''} />
          </div>
          <div className="form-group">
            <label className="form-label">GitHub URL</label>
            <input type="url" name="social_github" className="form-input" defaultValue={socialLinks.github || ''} />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="lam-card">
        <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-white)', marginBottom: '1.5rem' }}>Global SEO Defaults</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group" style={{ maxWidth: '400px' }}>
            <label className="form-label">Title Suffix</label>
            <input type="text" name="seo_title_suffix" className="form-input" defaultValue={seoDefaults.title_suffix || ''} />
            <small style={{ color: 'var(--lam-silver-dim)', marginTop: '0.25rem', display: 'block' }}>Appended to page titles (e.g. " | LAM")</small>
          </div>
          <div className="form-group">
            <label className="form-label">Default Meta Description</label>
            <textarea name="seo_default_description" className="form-input" rows={3} defaultValue={seoDefaults.default_description || ''} />
          </div>
        </div>
      </div>

      <div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Global Settings'}
        </button>
      </div>
    </form>
  )
}
