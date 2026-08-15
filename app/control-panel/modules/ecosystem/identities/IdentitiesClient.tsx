'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  archiveCustomerUserAction,
  restoreCustomerUserAction,
  deleteCustomerUserAction
} from '@/lib/actions/customer-user-management'

export function IdentitiesClient({ identities }: { identities: any[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'unassigned' | 'all'>('all')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Classify identities
  const processedIdentities = identities.map(cust => {
    const activeMemberships = cust.memberships?.filter((m: any) => m.company && m.company.status !== 'Deleted') || []
    const isOrphaned = activeMemberships.length === 0
    const isArchived = cust.status === 'archived'

    return {
      ...cust,
      activeMemberships,
      isOrphaned,
      isArchived,
      tabCategory: isArchived ? 'archived' : isOrphaned ? 'unassigned' : 'active'
    }
  })

  const counts = {
    active: processedIdentities.filter(i => i.tabCategory === 'active').length,
    archived: processedIdentities.filter(i => i.tabCategory === 'archived').length,
    unassigned: processedIdentities.filter(i => i.tabCategory === 'unassigned').length,
    all: processedIdentities.length
  }

  const filteredIdentities = processedIdentities.filter(cust => {
    if (activeTab === 'active') return cust.tabCategory === 'active'
    if (activeTab === 'archived') return cust.tabCategory === 'archived'
    if (activeTab === 'unassigned') return cust.tabCategory === 'unassigned'
    return true
  })

  const handleArchive = async (cust: any) => {
    if (!window.confirm(`Are you sure you want to archive user "${cust.email}"?`)) return

    setLoadingId(cust.id)
    setError('')
    setSuccessMsg('')
    try {
      const res = await archiveCustomerUserAction(cust.id)
      if (res.success) {
        setSuccessMsg(`User ${cust.email} archived successfully.`)
        router.refresh()
      } else {
        setError(res.error || 'Failed to archive user.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingId(null)
    }
  }

  const handleRestore = async (cust: any) => {
    setLoadingId(cust.id)
    setError('')
    setSuccessMsg('')
    try {
      const res = await restoreCustomerUserAction(cust.id)
      if (res.success) {
        setSuccessMsg(`User ${cust.email} restored successfully.`)
        router.refresh()
      } else {
        setError(res.error || 'Failed to restore user.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingId(null)
    }
  }

  const handleOpenDeleteModal = (cust: any) => {
    setDeleteTarget(cust)
    setConfirmEmail('')
    setDeleteError('')
  }

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null)
    setConfirmEmail('')
    setDeleteError('')
  }

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deleteTarget) return

    setDeleteLoading(true)
    setDeleteError('')
    try {
      const res = await deleteCustomerUserAction(deleteTarget.id, confirmEmail)
      if (res.success) {
        setSuccessMsg(`LAM ID ${deleteTarget.email} permanently deleted.`)
        handleCloseDeleteModal()
        router.refresh()
      } else {
        setDeleteError(res.error || 'Failed to delete user.')
      }
    } catch (err: any) {
      setDeleteError(err.message || 'An unexpected error occurred.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div style={{ padding: '0.85rem 1rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.3)', borderRadius: '4px', marginBottom: '1.5rem', fontSize: 'var(--text-sm)' }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '0.85rem 1rem', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.3)', borderRadius: '4px', marginBottom: '1.5rem', fontSize: 'var(--text-sm)' }}>
          {successMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
        {[
          { key: 'all', label: 'All Users', count: counts.all },
          { key: 'active', label: 'Active Users', count: counts.active },
          { key: 'archived', label: 'Archived Users', count: counts.archived },
          { key: 'unassigned', label: 'Unassigned / Orphaned', count: counts.unassigned }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className="btn"
            style={{
              padding: '0.5rem 1rem',
              fontSize: 'var(--text-xs)',
              fontWeight: activeTab === tab.key ? 600 : 400,
              background: activeTab === tab.key ? 'rgba(201, 168, 76, 0.15)' : 'var(--lam-surface)',
              color: activeTab === tab.key ? 'var(--lam-gold)' : 'var(--lam-silver-dim)',
              border: `1px solid ${activeTab === tab.key ? 'var(--lam-gold)' : 'var(--lam-border)'}`,
              borderRadius: '4px'
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="lam-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--lam-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Customer Name</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>LAM ID / Work Email</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Organization Membership</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Last Login</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIdentities.map(cust => {
              const mem = cust.activeMemberships?.[0]
              const compName = mem?.company?.name || 'Unassigned / Orphaned'
              const compRole = mem?.company_role || ''

              return (
                <tr key={cust.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--lam-white)', fontWeight: 500 }}>
                    <Link href={`/control-panel/clients/users/${cust.id}`} style={{ color: 'var(--lam-white)', textDecoration: 'none' }}>
                      {cust.first_name} {cust.last_name || ''}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-gold)', fontSize: 'var(--text-sm)', fontFamily: 'monospace' }}>
                    {cust.email}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {mem?.company?.id ? (
                      <Link href={`/control-panel/modules/ecosystem/companies/${mem.company.id}`} style={{ color: 'var(--lam-gold)', textDecoration: 'none', fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                        {compName}
                      </Link>
                    ) : (
                      <div style={{ color: '#e67e22', fontSize: 'var(--text-xs)', fontWeight: 600 }}>⚠️ {compName}</div>
                    )}
                    {compRole && (
                      <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'capitalize' }}>
                        Role: {compRole}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
                    {cust.last_login_at ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cust.last_login_at)) : 'Never'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '3px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: cust.isArchived ? 'rgba(149, 165, 166, 0.15)' : cust.status === 'active' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                      color: cust.isArchived ? '#95a5a6' : cust.status === 'active' ? '#2ecc71' : '#e74c3c'
                    }}>
                      {cust.isArchived ? 'Archived' : cust.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <Link
                        href={`/control-panel/clients/users/${cust.id}`}
                        className="btn"
                        style={{
                          background: 'var(--lam-surface)',
                          border: '1px solid var(--lam-border)',
                          color: 'var(--lam-white)',
                          padding: '0.25rem 0.6rem',
                          fontSize: 'var(--text-xs)',
                          textDecoration: 'none'
                        }}
                      >
                        View User
                      </Link>

                      {cust.isArchived ? (
                        <button
                          type="button"
                          onClick={() => handleRestore(cust)}
                          disabled={loadingId === cust.id}
                          className="btn"
                          style={{
                            background: 'none',
                            border: '1px solid #2ecc71',
                            color: '#2ecc71',
                            padding: '0.25rem 0.6rem',
                            fontSize: 'var(--text-xs)',
                            cursor: 'pointer'
                          }}
                        >
                          Restore User
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleArchive(cust)}
                          disabled={loadingId === cust.id}
                          className="btn"
                          style={{
                            background: 'none',
                            border: '1px solid #e67e22',
                            color: '#e67e22',
                            padding: '0.25rem 0.6rem',
                            fontSize: 'var(--text-xs)',
                            cursor: 'pointer'
                          }}
                        >
                          Archive User
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenDeleteModal(cust)}
                        className="btn"
                        style={{
                          background: 'rgba(231, 76, 60, 0.1)',
                          border: '1px solid #e74c3c',
                          color: '#e74c3c',
                          padding: '0.25rem 0.6rem',
                          fontSize: 'var(--text-xs)',
                          cursor: 'pointer'
                        }}
                      >
                        Delete User
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {filteredIdentities.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No customer identities found for tab filter "{activeTab}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete User Confirmation Modal */}
      {deleteTarget && (
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
            <h3 style={{ color: '#e74c3c', fontSize: 'var(--text-lg)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚠️ Permanently Delete Client User / LAM ID
            </h3>
            <p style={{ color: 'var(--lam-silver-light)', fontSize: 'var(--text-xs)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              This action may permanently delete this LAM ID and cannot be undone. Please review the target identity profile carefully:
            </p>

            <div style={{ background: 'var(--lam-black)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--lam-border)', marginBottom: '1.25rem', fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>User Name: <strong>{deleteTarget.first_name} {deleteTarget.last_name || ''}</strong></div>
              <div>LAM ID / Email: <strong style={{ color: 'var(--lam-gold)' }}>{deleteTarget.email}</strong></div>
              <div>Identity Status: <span style={{ textTransform: 'uppercase', color: deleteTarget.status === 'active' ? '#2ecc71' : '#e74c3c' }}>{deleteTarget.status}</span></div>
              <div>Organization(s): <span>{deleteTarget.activeMemberships?.map((m: any) => m.company?.name).join(', ') || 'None (Unassigned / Orphaned)'}</span></div>
            </div>

            {deleteError && (
              <div style={{ padding: '0.85rem', background: 'rgba(231, 76, 60, 0.15)', border: '1px solid #e74c3c', color: '#e74c3c', borderRadius: '4px', fontSize: 'var(--text-xs)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                ⛔ <strong>Deletion Blocked:</strong> {deleteError}
              </div>
            )}

            <form onSubmit={handleConfirmDelete} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>
                  To confirm, type the user's exact LAM ID / Email (<code style={{ color: 'var(--lam-gold)' }}>{deleteTarget.email}</code>):
                </label>
                <input
                  type="email"
                  required
                  value={confirmEmail}
                  onChange={e => setConfirmEmail(e.target.value)}
                  placeholder={deleteTarget.email}
                  className="lam-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  disabled={deleteLoading}
                  className="btn"
                  style={{ background: 'var(--lam-surface)', color: 'white', border: '1px solid var(--lam-border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading || confirmEmail.trim().toLowerCase() !== deleteTarget.email.trim().toLowerCase()}
                  className="btn"
                  style={{
                    background: '#e74c3c',
                    color: 'white',
                    opacity: (deleteLoading || confirmEmail.trim().toLowerCase() !== deleteTarget.email.trim().toLowerCase()) ? 0.5 : 1
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
