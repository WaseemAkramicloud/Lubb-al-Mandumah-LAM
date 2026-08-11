'use client'

import { useState } from 'react'
import { updateSystemSettings, updateEcosystemSettings } from '@/lib/actions/system'

export function SystemSettingsForm({ settingsMap }: { settingsMap: Record<string, any> }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [ecoLoading, setEcoLoading] = useState(false)
  const [ecoMsg, setEcoMsg] = useState({ text: '', type: '' })

  const companyInfo = settingsMap['company_info'] || {}
  const socialLinks = settingsMap['social_links'] || {}
  const seoDefaults = settingsMap['seo_defaults'] || {}
  const ecosystem = settingsMap['lam_ecosystem'] || {}

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

  async function handleEcosystemSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEcoLoading(true)
    setEcoMsg({ text: '', type: '' })

    try {
      const formData = new FormData(e.currentTarget)
      const res = await updateEcosystemSettings(formData)

      if (res.success) {
        setEcoMsg({ text: 'LAM Ecosystem settings saved.', type: 'success' })
      } else {
        setEcoMsg({ text: res.error || 'Failed to update ecosystem settings', type: 'error' })
      }
    } catch (err: any) {
      setEcoMsg({ text: err.message, type: 'error' })
    } finally {
      setEcoLoading(false)
    }
  }

  const alertStyle = (type: string) => ({
    padding: '1rem',
    borderRadius: '4px',
    fontSize: 'var(--text-sm)',
    background: type === 'error' ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)',
    color: type === 'error' ? '#e74c3c' : '#2ecc71'
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* ============================================================== */}
      {/* EXISTING SYSTEM SETTINGS                                        */}
      {/* ============================================================== */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {msg.text && <div style={alertStyle(msg.type)}>{msg.text}</div>}

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
              <small style={{ color: 'var(--lam-silver-dim)', marginTop: '0.25rem', display: 'block' }}>Appended to page titles (e.g. &quot; | LAM&quot;)</small>
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

      {/* ============================================================== */}
      {/* LAM ECOSYSTEM (NEW)                                             */}
      {/* ============================================================== */}
      <form onSubmit={handleEcosystemSubmit}>
        <div className="lam-card" style={{ border: '1px solid rgba(201, 168, 76, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-gold)' }}>LAM Ecosystem</h2>
            <span style={{ 
              fontSize: 'var(--text-xs)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              color: 'var(--lam-silver-dim)',
              background: 'rgba(0,0,0,0.3)',
              padding: '0.25rem 0.5rem',
              borderRadius: '3px'
            }}>
              Internal Configuration
            </span>
          </div>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', marginBottom: '2rem' }}>
            Architectural source of truth for future LAM Central development. These fields are informational — they do not activate integrations.
          </p>

          {ecoMsg.text && <div style={{ ...alertStyle(ecoMsg.type), marginBottom: '1.5rem' }}>{ecoMsg.text}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Parent Platform Name</label>
              <input type="text" name="eco_parent_platform" className="form-input" defaultValue={ecosystem.parent_platform_name || 'LAM'} style={{ color: 'var(--lam-gold)', fontWeight: 600 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Architecture Model</label>
              <input type="text" name="eco_architecture_model" className="form-input" defaultValue={ecosystem.architecture_model || 'Independent Product Applications'} />
            </div>
            <div className="form-group">
              <label className="form-label">Product Database Strategy</label>
              <input type="text" name="eco_product_db_strategy" className="form-input" defaultValue={ecosystem.product_db_strategy || 'Separate project/database per serious SaaS'} />
            </div>
            <div className="form-group">
              <label className="form-label">Internal ERP</label>
              <input type="text" name="eco_internal_erp" className="form-input" defaultValue={ecosystem.internal_erp || 'ATOM'} />
            </div>
            <div className="form-group">
              <label className="form-label">LAM Central Status</label>
              <select name="eco_lam_central_status" className="form-input" defaultValue={ecosystem.lam_central_status || 'Not Yet Enabled'}>
                <option value="Not Yet Enabled">Not Yet Enabled</option>
                <option value="Planning">Planning</option>
                <option value="Development">Development</option>
                <option value="Active">Active</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cross-Product SSO Status</label>
              <select name="eco_cross_product_sso" className="form-input" defaultValue={ecosystem.cross_product_sso_status || 'Not Yet Enabled'}>
                <option value="Not Yet Enabled">Not Yet Enabled</option>
                <option value="Planning">Planning</option>
                <option value="Development">Development</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Ecosystem Notes</label>
            <textarea name="eco_notes" className="form-input" rows={4} defaultValue={ecosystem.ecosystem_notes || ''} placeholder="Strategic notes about the LAM ecosystem architecture, planned integrations, or roadmap decisions..." />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button type="submit" className="btn" disabled={ecoLoading} style={{ background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid rgba(201, 168, 76, 0.3)' }}>
              {ecoLoading ? 'Saving...' : 'Save Ecosystem Configuration'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
