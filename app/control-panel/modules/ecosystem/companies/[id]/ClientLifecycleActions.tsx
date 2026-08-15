'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  suspendClientAction,
  reactivateClientAction,
  archiveClientAction,
  deleteClientAction
} from '@/lib/actions/customer-lifecycle'

interface Props {
  company: {
    id: string
    name: string
    company_id?: string
    status: string
  }
  primaryOwnerName?: string
  primaryOwnerEmail?: string
  subscribedProducts?: string[]
  userCount?: number
  tenantCount?: number
}

export default function ClientLifecycleActions({
  company,
  primaryOwnerName = 'Not set',
  primaryOwnerEmail = 'Not set',
  subscribedProducts = ['NEXORA'],
  userCount = 1,
  tenantCount = 1
}: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [typedConfirmation, setTypedConfirmation] = useState('')
  const [deleteOrphanedIdentity, setDeleteOrphanedIdentity] = useState(false)

  const isSuspended = company.status === 'Suspended'
  const isArchived = company.status === 'Archived'

  const normInput = typedConfirmation.trim().toLowerCase()
  const matchName = company.name.trim().toLowerCase()
  const matchCode = (company.company_id || '').trim().toLowerCase()
  const isDeleteEnabled = normInput === matchName || (matchCode && normInput === matchCode)

  const handleSuspend = async () => {
    if (!window.confirm(`Are you sure you want to suspend access for ${company.name}? Data will be preserved.`)) return
    setLoading(true)
    setError('')
    try {
      const res = await suspendClientAction(company.id)
      if (res.success) {
        setStatusMessage(`Client ${company.name} is now SUSPENDED.`)
        router.refresh()
      } else {
        setError(res.error || 'Failed to suspend client.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleReactivate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await reactivateClientAction(company.id)
      if (res.success) {
        setStatusMessage(`Client ${company.name} is now ACTIVE.`)
        router.refresh()
      } else {
        setError(res.error || 'Failed to reactivate client.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async () => {
    if (!window.confirm(`Are you sure you want to archive ${company.name}? The client will be moved to the Archived view.`)) return
    setLoading(true)
    setError('')
    try {
      const res = await archiveClientAction(company.id)
      if (res.success) {
        setStatusMessage(`Client ${company.name} is now ARCHIVED.`)
        router.refresh()
      } else {
        setError(res.error || 'Failed to archive client.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isDeleteEnabled) return

    setLoading(true)
    setError('')
    try {
      const res = await deleteClientAction(company.id, typedConfirmation, deleteOrphanedIdentity)
      if (res.success) {
        alert(`Client ${company.name} has been permanently deleted.`)
        if (res.redirectUrl) {
          window.location.href = res.redirectUrl
        } else {
          router.push('/control-panel/clients')
        }
      } else {
        setError(res.error || 'Permanent deletion failed.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during deletion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lam-card" style={{ marginBottom: '1.5rem', borderLeft: '3px solid var(--lam-gold)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: 'var(--text-base)', color: 'var(--lam-white)', margin: 0 }}>
          ⚙️ Client Actions & Lifecycle Management
        </h2>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
          Status: <strong style={{ color: isSuspended ? '#e74c3c' : isArchived ? '#f1c40f' : '#2ecc71' }}>{company.status.toUpperCase()}</strong>
        </span>
      </div>

      {statusMessage && (
        <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.3)', color: '#2ecc71', borderRadius: '4px', fontSize: 'var(--text-xs)', marginBottom: '1rem' }}>
          {statusMessage}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)', color: '#e74c3c', borderRadius: '4px', fontSize: 'var(--text-xs)', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {isSuspended || isArchived ? (
          <button
            type="button"
            onClick={handleReactivate}
            disabled={loading}
            className="btn"
            style={{
              padding: '0.6rem 1.25rem',
              fontSize: 'var(--text-xs)',
              background: 'rgba(46, 204, 113, 0.15)',
              color: '#2ecc71',
              border: '1px solid rgba(46, 204, 113, 0.4)',
              fontWeight: 600
            }}
          >
            {loading ? 'Processing...' : 'Reactivate Client'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSuspend}
            disabled={loading}
            className="btn"
            style={{
              padding: '0.6rem 1.25rem',
              fontSize: 'var(--text-xs)',
              background: 'rgba(241, 196, 15, 0.15)',
              color: '#f1c40f',
              border: '1px solid rgba(241, 196, 15, 0.4)',
              fontWeight: 500
            }}
          >
            {loading ? 'Processing...' : 'Suspend Client'}
          </button>
        )}

        {!isArchived && (
          <button
            type="button"
            onClick={handleArchive}
            disabled={loading}
            className="btn"
            style={{
              padding: '0.6rem 1.25rem',
              fontSize: 'var(--text-xs)',
              background: 'var(--lam-surface)',
              color: 'var(--lam-silver)',
              border: '1px solid var(--lam-border)',
              fontWeight: 500
            }}
          >
            {loading ? 'Processing...' : 'Archive Client'}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setShowDeleteModal(true)
            setTypedConfirmation('')
            setError('')
          }}
          disabled={loading}
          className="btn"
          style={{
            padding: '0.6rem 1.25rem',
            fontSize: 'var(--text-xs)',
            background: '#e74c3c',
            color: '#ffffff',
            border: '1px solid #c0392b',
            fontWeight: 600,
            marginLeft: 'auto'
          }}
        >
          Delete Client
        </button>
      </div>

      {/* Permanent Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--lam-surface-elevated)',
            border: '2px solid #e74c3c',
            borderRadius: '8px',
            maxWidth: '560px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', color: '#e74c3c', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠️ Confirm Permanent Client Deletion
              </h3>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--lam-silver-dim)', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '0.85rem', background: 'rgba(231, 76, 60, 0.15)', border: '1px solid rgba(231, 76, 60, 0.4)', color: '#e74c3c', borderRadius: '4px', fontSize: 'var(--text-xs)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              <strong>DANGER:</strong> This action will permanently delete this client organization&apos;s LAM records and cannot be undone. External SaaS tenant deprovisioning will be triggered automatically.
            </div>

            {/* Client Record Summary */}
            <div style={{ background: 'var(--lam-black)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--lam-border)', fontSize: 'var(--text-xs)', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div>Company Name: <strong style={{ color: 'var(--lam-white)' }}>{company.name}</strong></div>
              <div>Company Code: <strong style={{ color: 'var(--lam-gold)' }}>{company.company_id || company.id.slice(0, 8)}</strong></div>
              <div>Primary Owner: <span style={{ color: 'var(--lam-silver-light)' }}>{primaryOwnerName}</span></div>
              <div>Owner Email: <span style={{ color: 'var(--lam-silver-light)' }}>{primaryOwnerEmail}</span></div>
              <div>Subscribed Products: <strong style={{ color: 'var(--lam-gold)' }}>{subscribedProducts.join(', ').toUpperCase()}</strong></div>
              <div>Account Users: <span>{userCount} User(s)</span></div>
              <div>Tenant Instances: <span>{tenantCount} Instance(s)</span></div>
            </div>

            <form onSubmit={handleDeleteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-light)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                  To confirm permanent deletion, type the exact Company Name (<strong style={{ color: 'var(--lam-white)' }}>{company.name}</strong>) or Code (<strong style={{ color: 'var(--lam-gold)' }}>{company.company_id || company.id.slice(0, 8)}</strong>):
                </label>
                <input
                  type="text"
                  required
                  value={typedConfirmation}
                  onChange={(e) => setTypedConfirmation(e.target.value)}
                  placeholder="Type company name or code to confirm"
                  style={{
                    width: '100%',
                    background: 'var(--lam-surface)',
                    border: `1px solid ${isDeleteEnabled ? '#e74c3c' : 'var(--lam-border)'}`,
                    color: 'var(--lam-white)',
                    padding: '0.65rem 0.85rem',
                    fontSize: 'var(--text-xs)',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-light)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={deleteOrphanedIdentity}
                  onChange={(e) => setDeleteOrphanedIdentity(e.target.checked)}
                />
                <span>Also delete orphaned LAM ID if user belongs to no other company (Default: OFF)</span>
              </label>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="btn"
                  style={{ background: 'var(--lam-surface)', color: 'var(--lam-white)', border: '1px solid var(--lam-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isDeleteEnabled || loading}
                  className="btn"
                  style={{
                    background: isDeleteEnabled ? '#e74c3c' : 'rgba(231, 76, 60, 0.3)',
                    color: '#ffffff',
                    border: '1px solid #c0392b',
                    fontWeight: 600,
                    padding: '0.65rem 1.5rem',
                    cursor: isDeleteEnabled ? 'pointer' : 'not-allowed'
                  }}
                >
                  {loading ? 'Deleting Client...' : 'Permanently Delete Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
