'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  const deleteBtnRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Portal mount check
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Action states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [typedConfirmation, setTypedConfirmation] = useState('')
  const [deleteOrphanedIdentity, setDeleteOrphanedIdentity] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const isSuspended = company.status === 'Suspended'
  const isArchived = company.status === 'Archived'

  // Lock body scroll and attach Escape key listener when modal is open
  useEffect(() => {
    if (!showDeleteModal) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        handleCloseModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Focus input after modal mounts
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 50)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showDeleteModal, loading])

  const handleOpenModal = () => {
    setTypedConfirmation('')
    setDeleteOrphanedIdentity(false)
    setDeleteError('')
    setShowDeleteModal(true)
  }

  const handleCloseModal = () => {
    if (loading) return
    setShowDeleteModal(false)
    setTypedConfirmation('')
    setDeleteError('')
    // Return focus to delete button
    setTimeout(() => {
      if (deleteBtnRef.current) {
        deleteBtnRef.current.focus()
      }
    }, 50)
  }

  const normInput = typedConfirmation.trim().toLowerCase()
  const matchName = company.name.trim().toLowerCase()
  const matchCode = (company.company_id || '').trim().toLowerCase()
  const isDeleteEnabled = normInput === matchName || (matchCode !== '' && normInput === matchCode)

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
    if (!isDeleteEnabled || loading) return

    setLoading(true)
    setDeleteError('')
    try {
      const res = await deleteClientAction(company.id, typedConfirmation, deleteOrphanedIdentity)
      if (res.success) {
        if (res.redirectUrl) {
          window.location.href = res.redirectUrl
        } else {
          router.push('/control-panel/clients')
        }
      } else {
        setDeleteError(res.error || 'Permanent deletion failed.')
        setLoading(false)
      }
    } catch (err: any) {
      setDeleteError(err.message || 'An error occurred during deletion.')
      setLoading(false)
    }
  }

  const modalContent = showDeleteModal && mounted ? (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1.5rem',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleCloseModal()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        style={{
          backgroundColor: '#121212',
          border: '2px solid #e74c3c',
          borderRadius: '8px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9)',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
          <h3 id="delete-modal-title" style={{ fontSize: '1.25rem', color: '#e74c3c', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ Permanently Delete Client
          </h3>
          <button
            type="button"
            onClick={handleCloseModal}
            disabled={loading}
            aria-label="Close dialog"
            style={{ background: 'none', border: 'none', color: 'var(--lam-silver-dim)', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '0.85rem 1rem', background: 'rgba(231, 76, 60, 0.15)', border: '1px solid rgba(231, 76, 60, 0.4)', color: '#e74c3c', borderRadius: '4px', fontSize: '12px', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          <strong>DANGER:</strong> This action will permanently delete this client organization&apos;s LAM records and cannot be undone. External SaaS tenant deprovisioning will be triggered automatically.
        </div>

        {deleteError && (
          <div style={{ padding: '0.85rem 1rem', background: 'rgba(231, 76, 60, 0.2)', border: '1px solid #e74c3c', color: '#ffffff', borderRadius: '4px', fontSize: '12px', marginBottom: '1.25rem', fontWeight: 600 }}>
            Error: {deleteError}
          </div>
        )}

        {/* Client Record Summary */}
        <div style={{ background: '#0a0a0a', padding: '1rem', borderRadius: '6px', border: '1px solid var(--lam-border)', fontSize: '12px', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
          <div>Company Name: <strong style={{ color: '#ffffff' }}>{company.name}</strong></div>
          <div>Company Code: <strong style={{ color: 'var(--lam-gold)' }}>{company.company_id || company.id.slice(0, 8)}</strong></div>
          <div>Primary Owner: <span style={{ color: 'var(--lam-silver-light)' }}>{primaryOwnerName}</span></div>
          <div>Owner Email: <span style={{ color: 'var(--lam-silver-light)' }}>{primaryOwnerEmail}</span></div>
          <div>Subscribed Products: <strong style={{ color: 'var(--lam-gold)' }}>{subscribedProducts.join(', ').toUpperCase()}</strong></div>
          <div>Account Users: <span>{userCount} User(s)</span></div>
          <div>Tenant Instances: <span>{tenantCount} Instance(s)</span></div>
        </div>

        <form onSubmit={handleDeleteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--lam-silver-light)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
              To confirm permanent deletion, type the exact Company Name (<strong style={{ color: '#ffffff' }}>{company.name}</strong>) or Code (<strong style={{ color: 'var(--lam-gold)' }}>{company.company_id || company.id.slice(0, 8)}</strong>):
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              disabled={loading}
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              placeholder="Type company name or code to confirm"
              style={{
                width: '100%',
                background: '#1a1a1a',
                border: `1px solid ${isDeleteEnabled ? '#e74c3c' : 'var(--lam-border)'}`,
                color: '#ffffff',
                padding: '0.65rem 0.85rem',
                fontSize: '13px',
                borderRadius: '4px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '12px', color: 'var(--lam-silver-light)', cursor: loading ? 'not-allowed' : 'pointer' }}>
            <input
              type="checkbox"
              disabled={loading}
              checked={deleteOrphanedIdentity}
              onChange={(e) => setDeleteOrphanedIdentity(e.target.checked)}
            />
            <span>Also delete orphaned LAM ID if user belongs to no other company (Default: OFF)</span>
          </label>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              disabled={loading}
              onClick={handleCloseModal}
              className="btn"
              style={{ background: 'var(--lam-surface)', color: '#ffffff', border: '1px solid var(--lam-border)', padding: '0.6rem 1.25rem', fontSize: '12px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isDeleteEnabled || loading}
              className="btn"
              style={{
                background: isDeleteEnabled && !loading ? '#e74c3c' : 'rgba(231, 76, 60, 0.3)',
                color: '#ffffff',
                border: '1px solid #c0392b',
                fontWeight: 600,
                padding: '0.6rem 1.5rem',
                fontSize: '12px',
                cursor: isDeleteEnabled && !loading ? 'pointer' : 'not-allowed',
                opacity: isDeleteEnabled && !loading ? 1 : 0.6
              }}
            >
              {loading ? 'Deleting Client...' : 'Permanently Delete Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null

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
          ref={deleteBtnRef}
          type="button"
          onClick={handleOpenModal}
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

      {/* Render Delete Confirmation Modal via React Portal directly into body */}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </div>
  )
}
