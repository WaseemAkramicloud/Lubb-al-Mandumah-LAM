'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateClientNotes } from '@/lib/actions/crm'
import Link from 'next/link'

export function ClientDetailClient({ client }: { client: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState(client.notes || '')

  const handleSaveNotes = async () => {
    setLoading(true)
    setError('')
    try {
      await updateClientNotes(client.id, notes)
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
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '1.5rem', color: 'var(--lam-gold)' }}>
            Client Profile
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Organization Name</div>
              <div style={{ fontSize: 'var(--text-base)', color: 'var(--lam-white)', fontWeight: 500 }}>{client.organization_name}</div>
            </div>
            <div>
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Primary Contact</div>
              <div style={{ fontSize: 'var(--text-base)' }}>{client.contact_name}</div>
            </div>
            <div>
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Email</div>
              <div style={{ fontSize: 'var(--text-base)' }}><a href={`mailto:${client.email}`} style={{ color: 'var(--lam-gold)', textDecoration: 'none' }}>{client.email}</a></div>
            </div>
            <div>
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Phone</div>
              <div style={{ fontSize: 'var(--text-base)' }}>{client.phone || '-'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Related Products</div>
              <div style={{ fontSize: 'var(--text-base)', color: 'var(--lam-silver-light)' }}>
                {client.related_products && client.related_products.length > 0 ? client.related_products.join(', ') : '-'}
              </div>
            </div>
          </div>
          
          <div className="lam-divider" style={{ margin: '1.5rem 0' }} />
          
          <div>
            <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Original Lead Record</div>
            <Link href={`/control-panel/modules/leads-clients/${client.lead_id}`} style={{ color: 'var(--lam-silver-light)', textDecoration: 'underline', fontSize: 'var(--text-sm)' }}>
              View initial request details ↗
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Actions & Notes */}
      <div>
        <div className="lam-card">
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '1.5rem' }}>Client Notes</h2>
          
          {error && (
            <div style={{ padding: '1rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '4px', marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-input" 
            rows={10} 
            placeholder="Add relationship notes, deployment statuses, or important information..."
            style={{ marginBottom: '1rem' }}
          />
          <button onClick={handleSaveNotes} disabled={loading || notes === client.notes} className="btn btn-primary" style={{ width: '100%' }}>
            Save Notes
          </button>
        </div>
      </div>
    </div>
  )
}
