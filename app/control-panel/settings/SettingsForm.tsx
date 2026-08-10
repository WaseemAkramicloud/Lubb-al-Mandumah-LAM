'use client'

import { useState } from 'react'
import { updateSettings } from '@/lib/actions/profile'
import { StaffPermissions } from '@/lib/auth/permission-constants'

interface Props {
  settings: { dashboard_layout?: string[], theme?: string, email_notifications?: boolean } | null
  permissions: StaffPermissions
  isSuperadmin: boolean
}

// Widget definitions that require specific permissions
const AVAILABLE_WIDGETS = [
  { id: 'leads', label: 'New Leads Overview', requiredModule: 'leads_clients' },
  { id: 'my_leads', label: 'My Assigned Leads', requiredModule: 'leads_clients' },
  { id: 'follow_ups', label: 'Follow-ups & Recent', requiredModule: 'leads_clients' },
  { id: 'users', label: 'Team Directory Summary', requiredModule: 'user_management' },
  { id: 'content', label: 'Pending Content Changes', requiredModule: 'site_management' },
  { id: 'audit', label: 'Recent System Activity', requiredModule: 'audit_log' },
]

export default function SettingsForm({ settings, permissions, isSuperadmin }: Props) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  const defaultLayout = settings?.dashboard_layout || ['leads', 'my_leads', 'follow_ups', 'users', 'audit', 'content']
  const [layout, setLayout] = useState<string[]>(defaultLayout)

  // Filter widgets the user actually has permission to see
  const permittedWidgets = AVAILABLE_WIDGETS.filter(w => 
    isSuperadmin || permissions[w.requiredModule as keyof StaffPermissions]
  )

  const toggleWidget = (id: string) => {
    setLayout(prev => {
      if (prev.includes(id)) {
        return prev.filter(wId => wId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const moveUp = (id: string) => {
    setLayout(prev => {
      const idx = prev.indexOf(id)
      if (idx <= 0) return prev
      const next = [...prev]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  const moveDown = (id: string) => {
    setLayout(prev => {
      const idx = prev.indexOf(id)
      if (idx === -1 || idx === prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', type: '' })

    const formData = new FormData(e.currentTarget)
    // Append the JSON array for layout
    formData.append('dashboard_layout', JSON.stringify(layout))
    
    const res = await updateSettings(formData)

    if (res?.error) {
      setMsg({ text: res.error, type: 'error' })
    } else {
      setMsg({ text: 'Settings updated successfully.', type: 'success' })
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Dashboard Configuration */}
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>Dashboard Widgets</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-silver-dim)', marginBottom: '1.5rem' }}>
            Show, hide, and reorder widgets on your personal dashboard. You can only see widgets you have permissions for.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--lam-surface)', padding: '1rem', borderRadius: '4px' }}>
            {permittedWidgets.map(widget => {
              const isVisible = layout.includes(widget.id)
              return (
                <div key={widget.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--lam-black)', border: '1px solid var(--lam-border)', borderRadius: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: 1 }}>
                    <input 
                      type="checkbox" 
                      checked={isVisible} 
                      onChange={() => toggleWidget(widget.id)}
                      style={{ accentColor: 'var(--lam-gold)' }}
                    />
                    <span style={{ color: isVisible ? 'var(--lam-white)' : 'var(--lam-silver-dim)' }}>{widget.label}</span>
                  </label>
                  
                  {isVisible && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" onClick={() => moveUp(widget.id)} style={{ background: 'none', border: '1px solid var(--lam-border)', color: 'var(--lam-silver)', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>↑</button>
                      <button type="button" onClick={() => moveDown(widget.id)} style={{ background: 'none', border: '1px solid var(--lam-border)', color: 'var(--lam-silver)', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>↓</button>
                    </div>
                  )}
                </div>
              )
            })}
            {permittedWidgets.length === 0 && (
              <span style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>No widgets available for your permission level.</span>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div style={{ borderTop: '1px solid var(--lam-border)', paddingTop: '2rem' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.5rem' }}>General Preferences</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
            <div>
              <label className="form-label">Interface Theme</label>
              <select name="theme" className="form-input" defaultValue={settings?.theme || 'dark'}>
                <option value="dark">LAM Dark (Default)</option>
                <option value="system">System Default</option>
              </select>
            </div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="notifications" 
                defaultChecked={settings?.email_notifications !== false} 
                style={{ accentColor: 'var(--lam-gold)' }}
              />
              <span style={{ color: 'var(--lam-silver)' }}>Enable Email Notifications for relevant modules</span>
            </label>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--lam-border)', paddingTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
