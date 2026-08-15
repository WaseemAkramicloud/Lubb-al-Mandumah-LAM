'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  archiveCustomerUserAction,
  restoreCustomerUserAction,
  resetCustomerUserPasswordAction,
  removeCustomerCompanyMembershipAction,
  deleteCustomerUserAction
} from '@/lib/actions/customer-user-management'

interface Props {
  identity: any
}

export function UserDetailClient({ identity }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Password Reset Modal State
  const [resetModalData, setResetModalData] = useState<{ email: string; newPassword: string } | null>(null)
  const [showResetPwd, setShowResetPwd] = useState(false)
  const [copiedPwd, setCopiedPwd] = useState(false)
  const [copiedCreds, setCopiedCreds] = useState(false)

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const activeMemberships = identity.memberships?.filter((m: any) => m.company && m.company.status !== 'Deleted') || []
  const isOrphaned = activeMemberships.length === 0
  const isArchived = identity.status === 'archived'

  const handleArchive = async () => {
    if (!window.confirm(`Are you sure you want to archive user "${identity.email}"?`)) return
    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await archiveCustomerUserAction(identity.id)
      if (res.success) {
        setSuccessMsg(`User ${identity.email} archived successfully.`)
        router.refresh()
      } else {
        setError(res.error || 'Failed to archive user.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await restoreCustomerUserAction(identity.id)
      if (res.success) {
        setSuccessMsg(`User ${identity.email} restored successfully.`)
        router.refresh()
      } else {
        setError(res.error || 'Failed to restore user.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!window.confirm(`Are you sure you want to issue a new password for ${identity.email}?`)) return
    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await resetCustomerUserPasswordAction(identity.id)
      if (res.success && res.newPassword) {
        setResetModalData({ email: res.email || identity.email, newPassword: res.newPassword })
        setShowResetPwd(false)
      } else {
        setError(res.error || 'Failed to reset password.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMembership = async (companyId: string, companyName: string) => {
    if (!window.confirm(`Are you sure you want to remove user "${identity.email}" from "${companyName}"?`)) return
    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await removeCustomerCompanyMembershipAction(identity.id, companyId)
      if (res.success) {
        setSuccessMsg(`Membership for "${companyName}" removed successfully.`)
        router.refresh()
      } else {
        setError(res.error || 'Failed to remove membership.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeleteLoading(true)
    setDeleteError('')
    try {
      const res = await deleteCustomerUserAction(identity.id, confirmEmail)
      if (res.success) {
        router.push('/control-panel/clients/users')
      } else {
        setDeleteError(res.error || 'Failed to delete user.')
      }
    } catch (err: any) {
      setDeleteError(err.message || 'An unexpected error occurred.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCopyPwd = () => {
    if (resetModalData?.newPassword) {
      navigator.clipboard.writeText(resetModalData.newPassword)
      setCopiedPwd(true)
      setTimeout(() => setCopiedPwd(false), 2500)
    }
  }

  const handleCopyDetails = () => {
    if (resetModalData) {
      const text = `LAM ID Login Details:\nURL: https://id.lubbalmandumah.com\nLAM ID / Login Email: ${resetModalData.email}\nNewly Issued Password: ${resetModalData.newPassword}\nNote: The user may keep this password or change it voluntarily.`
      navigator.clipboard.writeText(text)
      setCopiedCreds(true)
      setTimeout(() => setCopiedCreds(false), 2500)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {error && (
        <div style={{ padding: '0.85rem 1rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.3)', borderRadius: '4px', fontSize: 'var(--text-sm)' }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '0.85rem 1rem', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.3)', borderRadius: '4px', fontSize: 'var(--text-sm)' }}>
          {successMsg}
        </div>
      )}

      {/* Header Banner */}
      <div className="lam-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-white)', marginBottom: '0.25rem' }}>
              {identity.first_name} {identity.last_name || ''}
            </h1>
            <span style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '3px',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textTransform: 'uppercase',
              background: isArchived ? 'rgba(149, 165, 166, 0.15)' : identity.status === 'active' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
              color: isArchived ? '#95a5a6' : identity.status === 'active' ? '#2ecc71' : '#e74c3c'
            }}>
              {isArchived ? 'Archived' : identity.status}
            </span>
            {isOrphaned && (
              <span style={{ padding: '0.2rem 0.6rem', borderRadius: '3px', fontSize: 'var(--text-xs)', fontWeight: 600, background: 'rgba(230, 126, 34, 0.15)', color: '#e67e22' }}>
                Unassigned / Orphaned
              </span>
            )}
          </div>
          <div style={{ color: 'var(--lam-gold)', fontSize: 'var(--text-sm)', fontFamily: 'monospace' }}>
            {identity.email}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isArchived ? (
            <button
              type="button"
              onClick={handleRestore}
              disabled={loading}
              className="btn"
              style={{ background: 'none', border: '1px solid #2ecc71', color: '#2ecc71', fontSize: 'var(--text-xs)' }}
            >
              Restore User
            </button>
          ) : (
            <button
              type="button"
              onClick={handleArchive}
              disabled={loading}
              className="btn"
              style={{ background: 'none', border: '1px solid #e67e22', color: '#e67e22', fontSize: 'var(--text-xs)' }}
            >
              Archive User
            </button>
          )}

          <button
            type="button"
            onClick={handleResetPassword}
            disabled={loading}
            className="btn btn-primary"
            style={{ fontSize: 'var(--text-xs)' }}
          >
            Reset / Issue New Password
          </button>

          <button
            type="button"
            onClick={() => { setShowDeleteModal(true); setConfirmEmail(''); setDeleteError('') }}
            disabled={loading}
            className="btn"
            style={{ background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', color: '#e74c3c', fontSize: 'var(--text-xs)' }}
          >
            Delete User
          </button>
        </div>
      </div>

      {/* Grid details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Section 1: LAM ID & Identity */}
        <div className="lam-card">
          <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--lam-gold)', marginBottom: '1rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
            LAM ID & Identity Profile
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: 'var(--text-xs)', color: 'var(--lam-white)' }}>
            <div>First Name: <strong>{identity.first_name}</strong></div>
            <div>Last Name: <span>{identity.last_name || '-'}</span></div>
            <div>LAM ID / Login Email: <strong style={{ color: 'var(--lam-gold)', fontFamily: 'monospace' }}>{identity.email}</strong></div>
            <div>Identity Status: <span style={{ textTransform: 'capitalize' }}>{identity.status}</span></div>
            <div>Auth Link UUID: <span style={{ fontFamily: 'monospace', color: identity.auth_user_id ? '#2ecc71' : '#e74c3c' }}>{identity.auth_user_id || 'Unlinked'}</span></div>
            <div>Last Login: <span>{identity.last_login_at ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(identity.last_login_at)) : 'Never'}</span></div>
            <div>Created Date: <span>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(identity.created_at))}</span></div>
          </div>
        </div>

        {/* Section 2: Organization Memberships */}
        <div className="lam-card">
          <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--lam-gold)', marginBottom: '1rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
            Organization Memberships
          </h3>
          {activeMemberships.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activeMemberships.map((m: any) => (
                <div key={m.id} style={{ background: 'var(--lam-surface)', padding: '0.85rem', borderRadius: '4px', border: '1px solid var(--lam-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Link href={`/control-panel/modules/ecosystem/companies/${m.company.id}`} style={{ color: 'var(--lam-gold)', fontWeight: 600, textDecoration: 'none', fontSize: 'var(--text-xs)' }}>
                      {m.company.name}
                    </Link>
                    <div style={{ color: 'var(--lam-silver-dim)', fontSize: '11px', textTransform: 'capitalize' }}>
                      Role: {m.company_role} | Status: {m.status}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMembership(m.company.id, m.company.name)}
                    className="btn"
                    style={{ background: 'none', border: '1px solid #e67e22', color: '#e67e22', padding: '0.2rem 0.5rem', fontSize: '11px' }}
                  >
                    Remove From Company
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1rem', background: 'rgba(230, 126, 34, 0.1)', border: '1px solid rgba(230, 126, 34, 0.3)', color: '#e67e22', borderRadius: '4px', fontSize: 'var(--text-xs)' }}>
              ⚠️ <strong>Unassigned / Orphaned Identity:</strong> This LAM ID has no active company memberships remaining.
            </div>
          )}
        </div>

        {/* Section 3: Product Access Grants */}
        <div className="lam-card" style={{ gridColumn: 'span 2' }}>
          <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--lam-gold)', marginBottom: '1rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.5rem' }}>
            Product Access Grants
          </h3>
          {identity.product_access && identity.product_access.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
              {identity.product_access.map((pa: any) => (
                <div key={pa.id} style={{ background: 'var(--lam-surface)', padding: '0.85rem', borderRadius: '4px', border: '1px solid var(--lam-border)', fontSize: 'var(--text-xs)' }}>
                  <div>Product: <strong style={{ color: 'var(--lam-gold)' }}>{pa.product_slug?.toUpperCase()}</strong></div>
                  <div>Company: <span>{pa.company?.name || 'Central'}</span></div>
                  <div>Grant Status: <span style={{ color: '#2ecc71', fontWeight: 600 }}>{pa.status?.toUpperCase()}</span></div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
              No explicit product access grants registered.
            </div>
          )}
        </div>
      </div>

      {/* Password Reset Modal */}
      {resetModalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--lam-surface-elevated)',
            border: '1px solid var(--lam-gold)',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <h3 style={{ color: 'var(--lam-gold)', fontSize: 'var(--text-lg)', marginBottom: '0.5rem' }}>
              🔑 Newly Issued Password
            </h3>
            <p style={{ color: 'var(--lam-silver-light)', fontSize: 'var(--text-xs)', marginBottom: '1.25rem' }}>
              A new strong password has been issued for <strong>{resetModalData.email}</strong>. The previous password is no longer valid.
            </p>

            <div style={{ background: 'var(--lam-black)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--lam-border)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--text-xs)' }}>
              <div>Login URL: <code style={{ color: 'var(--lam-gold)' }}>https://id.lubbalmandumah.com</code></div>
              <div>LAM ID / Login Email: <code style={{ color: 'var(--lam-white)' }}>{resetModalData.email}</code></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span>Newly Issued Password:</span>
                <code style={{ background: 'black', padding: '0.2rem 0.5rem', borderRadius: '3px', color: 'var(--lam-gold)', fontFamily: 'monospace' }}>
                  {showResetPwd ? resetModalData.newPassword : '••••••••••••••••'}
                </code>
                <button
                  type="button"
                  onClick={() => setShowResetPwd(!showResetPwd)}
                  className="btn"
                  style={{ background: 'none', border: '1px solid var(--lam-border)', color: 'var(--lam-silver-dim)', fontSize: '11px', padding: '0.2rem 0.5rem' }}
                >
                  {showResetPwd ? 'Hide' : 'Reveal'}
                </button>
              </div>
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: '11px' }}>
                The user may keep this password or change it voluntarily from their account.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCopyPwd}
                className="btn"
                style={{ background: 'var(--lam-surface)', color: 'white', border: '1px solid var(--lam-border)', fontSize: 'var(--text-xs)' }}
              >
                {copiedPwd ? 'Password Copied! ✓' : 'Copy Password'}
              </button>
              <button
                type="button"
                onClick={handleCopyDetails}
                className="btn btn-primary"
                style={{ fontSize: 'var(--text-xs)' }}
              >
                {copiedCreds ? 'Details Copied! ✓' : 'Copy All Details'}
              </button>
              <button
                type="button"
                onClick={() => setResetModalData(null)}
                className="btn"
                style={{ background: 'var(--lam-surface)', color: 'white', border: '1px solid var(--lam-border)', fontSize: 'var(--text-xs)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--lam-surface-elevated)',
            border: '1px solid #e74c3c',
            borderRadius: '8px',
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <h3 style={{ color: '#e74c3c', fontSize: 'var(--text-lg)', marginBottom: '0.5rem' }}>
              ⚠️ Permanently Delete Client User / LAM ID
            </h3>
            <p style={{ color: 'var(--lam-silver-light)', fontSize: 'var(--text-xs)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              This action may permanently delete this LAM ID and cannot be undone.
            </p>

            <div style={{ background: 'var(--lam-black)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--lam-border)', marginBottom: '1.25rem', fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>User Name: <strong>{identity.first_name} {identity.last_name || ''}</strong></div>
              <div>LAM ID / Email: <strong style={{ color: 'var(--lam-gold)' }}>{identity.email}</strong></div>
              <div>Identity Status: <span style={{ textTransform: 'uppercase', color: identity.status === 'active' ? '#2ecc71' : '#e74c3c' }}>{identity.status}</span></div>
              <div>Organization(s): <span>{activeMemberships.map((m: any) => m.company?.name).join(', ') || 'None (Unassigned / Orphaned)'}</span></div>
            </div>

            {deleteError && (
              <div style={{ padding: '0.85rem', background: 'rgba(231, 76, 60, 0.15)', border: '1px solid #e74c3c', color: '#e74c3c', borderRadius: '4px', fontSize: 'var(--text-xs)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                ⛔ <strong>Deletion Blocked:</strong> {deleteError}
              </div>
            )}

            <form onSubmit={handleConfirmDelete} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                  To confirm, type the user's exact LAM ID / Email (<code style={{ color: 'var(--lam-gold)' }}>{identity.email}</code>):
                </label>
                <input
                  type="email"
                  required
                  value={confirmEmail}
                  onChange={e => setConfirmEmail(e.target.value)}
                  placeholder={identity.email}
                  className="lam-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="btn"
                  style={{ background: 'var(--lam-surface)', color: 'white', border: '1px solid var(--lam-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading || confirmEmail.trim().toLowerCase() !== identity.email.trim().toLowerCase()}
                  className="btn"
                  style={{
                    background: '#e74c3c',
                    color: 'white',
                    opacity: (deleteLoading || confirmEmail.trim().toLowerCase() !== identity.email.trim().toLowerCase()) ? 0.5 : 1
                  }}
                >
                  {deleteLoading ? 'Deleting User...' : 'Permanently Delete User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
