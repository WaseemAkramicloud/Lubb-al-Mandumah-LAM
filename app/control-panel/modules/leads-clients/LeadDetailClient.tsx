'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateLeadStatus, assignLead, updateInternalNotes, convertToClient, deleteLead } from '@/lib/actions/crm'

export function LeadDetailClient({ lead, staffList, auditLogs }: { lead: any, staffList: any[], auditLogs: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState(lead.internal_notes || '')

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true)
    try {
      await updateLeadStatus(lead.id, e.target.value)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAssigneeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true)
    try {
      await assignLead(lead.id, e.target.value || null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    setLoading(true)
    try {
      await updateInternalNotes(lead.id, notes)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConvert = async () => {
    if (!window.confirm("Are you sure you want to convert this lead to a Client?")) return
    
    setLoading(true)
    try {
      const res = await convertToClient(lead.id)
      if (res.success) {
        router.push(`/control-panel/modules/leads-clients/clients/${res.clientId}`)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return
    
    setLoading(true)
    try {
      await deleteLead(lead.id)
      router.push('/control-panel/modules/leads-clients')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      
      {/* Left Column: Details */}
      <div>
        <div className="lam-card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
            Request Details
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-silver-dim)', textTransform: 'capitalize' }}>
              {lead.source_type} Request
            </span>
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Contact Person</div>
              <div style={{ fontSize: 'var(--text-base)' }}>{lead.contact_person}</div>
            </div>
            <div>
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Company</div>
              <div style={{ fontSize: 'var(--text-base)' }}>{lead.company || '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email</div>
              <div style={{ fontSize: 'var(--text-base)' }}><a href={`mailto:${lead.email}`} style={{ color: 'var(--lam-gold)', textDecoration: 'none' }}>{lead.email}</a></div>
            </div>
            <div>
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Phone</div>
              <div style={{ fontSize: 'var(--text-base)' }}>{lead.phone || '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Country</div>
              <div style={{ fontSize: 'var(--text-base)' }}>{lead.country || '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Interested Product</div>
              <div style={{ fontSize: 'var(--text-base)' }}>{lead.interested_product || '-'}</div>
            </div>
          </div>

          <div className="lam-divider" style={{ margin: '1.5rem 0' }} />
          
          <div>
            <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Message / Requirements</div>
            <div style={{ background: 'var(--lam-surface)', padding: '1.5rem', borderRadius: '4px', color: 'var(--lam-silver-light)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {lead.message || 'No message provided.'}
            </div>
          </div>
        </div>

        <div className="lam-card">
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '1.5rem' }}>Internal Notes</h2>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-input" 
            rows={5} 
            placeholder="Add internal notes about this lead..."
            style={{ marginBottom: '1rem' }}
          />
          <button onClick={handleSaveNotes} disabled={loading || notes === lead.internal_notes} className="btn btn-primary">
            Save Notes
          </button>
        </div>
      </div>

      {/* Right Column: Actions & Audit */}
      <div>
        <div className="lam-card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '1.5rem' }}>Management</h2>
          
          {error && (
            <div style={{ padding: '1rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '4px', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Status</label>
            <select 
              value={lead.status} 
              onChange={handleStatusChange}
              disabled={loading || lead.status === 'Converted'} 
              className="form-input"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Converted">Converted</option>
              <option value="Closed/Lost">Closed/Lost</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Assigned To</label>
            <select 
              value={lead.assigned_to || ''} 
              onChange={handleAssigneeChange}
              disabled={loading} 
              className="form-input"
            >
              <option value="">-- Unassigned --</option>
              {staffList.map(staff => (
                <option key={staff.id} value={staff.id}>{staff.first_name} {staff.last_name}</option>
              ))}
            </select>
          </div>

          {lead.status !== 'Converted' && (
            <button 
              onClick={handleConvert} 
              disabled={loading || !['Qualified', 'Proposal'].includes(lead.status)} 
              className="btn btn-primary" 
              style={{ width: '100%', marginBottom: '1rem', opacity: ['Qualified', 'Proposal'].includes(lead.status) ? 1 : 0.5 }}
              title={!['Qualified', 'Proposal'].includes(lead.status) ? "Status must be Qualified or Proposal to convert" : ""}
            >
              Convert to Client
            </button>
          )}

          {lead.status === 'Converted' && (
            <div style={{ padding: '1rem', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', borderRadius: '4px', textAlign: 'center', marginBottom: '1rem', fontSize: 'var(--text-sm)' }}>
              This lead has been converted to a Client.
            </div>
          )}

          <button 
            onClick={handleDelete} 
            disabled={loading} 
            className="btn" 
            style={{ width: '100%', background: 'none', border: '1px solid #e74c3c', color: '#e74c3c' }}
          >
            Delete Lead
          </button>
        </div>

        <div className="lam-card">
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '1.5rem' }}>Activity History</h2>
          
          {auditLogs.length === 0 ? (
            <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '1rem' }}>
              No history found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {auditLogs.map((log) => {
                const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(log.created_at))
                const user = log.staff_profiles ? `${log.staff_profiles.first_name} ${log.staff_profiles.last_name}` : 'System'
                
                let message = ''
                if (log.action_type === 'status_change') message = `Status changed to ${log.action_details.new_status}`
                else if (log.action_type === 'assigned') message = `Assigned to ${log.action_details.assigned_to ? 'a user' : 'Unassigned'}`
                else if (log.action_type === 'converted') message = `Converted to Client`
                else message = log.action_type

                return (
                  <div key={log.id} style={{ borderLeft: '2px solid var(--lam-gold)', paddingLeft: '1rem' }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-white)', marginBottom: '0.25rem' }}>{message}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>{user} • {date}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
