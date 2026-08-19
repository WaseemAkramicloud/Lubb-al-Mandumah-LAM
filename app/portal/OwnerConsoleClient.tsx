'use client'

import { useState } from 'react'
import { createWorkspaceEmployeeAccount, updateWorkspaceUserStatusAction, resetWorkspaceUserPasswordAction } from '@/lib/actions/customer-auth'

export function OwnerConsoleClient({ ownerData }: { ownerData: any }) {
  const { customerAccount, organizations, workspaces } = ownerData

  const [activeTab, setActiveTab] = useState<'workspaces' | 'users' | 'organizations'>('workspaces')
  const [selectedWsId, setSelectedWsId] = useState<string>(workspaces[0]?.id || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [newPasswordNotice, setNewPasswordNotice] = useState<{ userId: string; pass: string } | null>(null)

  // Add User Form State
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({
    workspaceId: workspaces[0]?.id || '',
    userId: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'member'
  })

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')

    try {
      const res = await createWorkspaceEmployeeAccount({
        workspaceId: addForm.workspaceId,
        userId: addForm.userId,
        password: addForm.password,
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        workspaceRole: addForm.role
      })

      if (res.success) {
        setSuccessMsg(`User '${res.userId}' created for workspace '${res.workspaceCode}'. Initial Password: ${res.initialPassword}`)
        setShowAddModal(false)
        setAddForm({ workspaceId: workspaces[0]?.id || '', userId: '', password: '', firstName: '', lastName: '', role: 'member' })
        window.location.reload()
      } else {
        setError(res.error || 'Failed to create workspace user.')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (workspaceId: string, membershipId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    if (!confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'reactivate'} this user?`)) return

    setLoading(true)
    setError('')
    try {
      const res = await updateWorkspaceUserStatusAction({ workspaceId, membershipId, newStatus })
      if (res.success) {
        window.location.reload()
      } else {
        setError(res.error || 'Failed to update user status.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (workspaceId: string, authUserId: string, userId: string) => {
    if (!confirm(`Reset password for user '${userId}'?`)) return

    setLoading(true)
    setError('')
    try {
      const res = await resetWorkspaceUserPasswordAction({ workspaceId, authUserId })
      if (res.success) {
        setNewPasswordNotice({ userId, pass: res.newPassword! })
      } else {
        setError(res.error || 'Failed to reset password.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedWs = workspaces.find((w: any) => w.id === selectedWsId) || workspaces[0]

  return (
    <div>
      {/* Account Context Banner */}
      <div className="lam-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(201, 168, 76, 0.08) 0%, rgba(20, 20, 20, 0.9) 100%)', border: '1px solid rgba(201, 168, 76, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              Company Owner Console • LAM Access Web Hub
            </span>
            <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', margin: '0.25rem 0' }}>
              {customerAccount?.name || 'Customer Account'}
            </h1>
            <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
              Account Code: <strong style={{ color: 'var(--lam-silver-light)' }}>{customerAccount?.customer_account_code}</strong> • Status: <span style={{ textTransform: 'capitalize', color: customerAccount?.status === 'active' ? '#2ecc71' : '#e74c3c' }}>{customerAccount?.status}</span>
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.25rem', fontSize: 'var(--text-xs)' }}
          >
            + Add Workspace Employee
          </button>
        </div>
      </div>

      {/* Global Notifications */}
      {error && (
        <div style={{ padding: '0.85rem', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)', color: '#e74c3c', borderRadius: '4px', marginBottom: '1.5rem', fontSize: 'var(--text-sm)' }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '0.85rem', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.3)', color: '#2ecc71', borderRadius: '4px', marginBottom: '1.5rem', fontSize: 'var(--text-sm)' }}>
          {successMsg}
        </div>
      )}
      {newPasswordNotice && (
        <div style={{ padding: '1rem', background: 'rgba(241, 196, 15, 0.15)', border: '1px solid rgba(241, 196, 15, 0.4)', color: '#f1c40f', borderRadius: '4px', marginBottom: '1.5rem', fontSize: 'var(--text-sm)' }}>
          <strong>Password Reset Issued for '{newPasswordNotice.userId}':</strong>
          <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-md)', margin: '0.5rem 0', padding: '0.5rem', background: '#000', borderRadius: '4px', border: '1px solid var(--lam-border)' }}>
            {newPasswordNotice.pass}
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>Copy this temporary password. It will not be shown again.</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--lam-border)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('workspaces')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'workspaces' ? '2px solid var(--lam-gold)' : '2px solid transparent',
            color: activeTab === 'workspaces' ? 'var(--lam-gold)' : 'var(--lam-silver-dim)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 'var(--text-sm)'
          }}
        >
          Product Workspaces ({workspaces.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '2px solid var(--lam-gold)' : '2px solid transparent',
            color: activeTab === 'users' ? 'var(--lam-gold)' : 'var(--lam-silver-dim)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 'var(--text-sm)'
          }}
        >
          Workspace Users & Roles
        </button>
        <button
          onClick={() => setActiveTab('organizations')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'organizations' ? '2px solid var(--lam-gold)' : '2px solid transparent',
            color: activeTab === 'organizations' ? 'var(--lam-gold)' : 'var(--lam-silver-dim)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 'var(--text-sm)'
          }}
        >
          Organizations ({organizations.length})
        </button>
      </div>

      {/* TAB 1: PRODUCT WORKSPACES */}
      {activeTab === 'workspaces' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {workspaces.map((ws: any) => {
            const isFull = ws.activeSeats >= ws.maxSeats

            return (
              <div key={ws.id} className="lam-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--lam-border)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', margin: 0 }}>{ws.productName}</h3>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>Org: {ws.organizationName}</span>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '3px',
                      fontSize: '11px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      background: 'rgba(201, 168, 76, 0.15)',
                      color: 'var(--lam-gold)',
                      border: '1px solid rgba(201, 168, 76, 0.3)'
                    }}>
                      {ws.workspaceCode}
                    </span>
                  </div>

                  {/* Calculated Active Seat Usage Progress */}
                  <div style={{ margin: '1.25rem 0', background: 'rgba(0,0,0,0.4)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--lam-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--lam-silver-dim)' }}>Active Seat Usage</span>
                      <strong style={{ color: isFull ? '#e74c3c' : 'var(--lam-silver-light)' }}>
                        {ws.activeSeats} / {ws.maxSeats} Seats ({Math.round((ws.activeSeats / ws.maxSeats) * 100)}%)
                      </strong>
                    </div>
                    <div style={{ height: '6px', background: 'var(--lam-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (ws.activeSeats / ws.maxSeats) * 100)}%`,
                        background: isFull ? '#e74c3c' : 'var(--lam-gold)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    {isFull && (
                      <span style={{ display: 'block', marginTop: '0.4rem', fontSize: '10px', color: '#e74c3c' }}>
                        ⚠️ Seat allowance reached. Upgrade plan tier to add users.
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.25rem' }}>
                    <div>Plan Tier: <strong style={{ color: 'var(--lam-white)', textTransform: 'capitalize' }}>{ws.planTier}</strong></div>
                    <div>Identity Mode: <strong style={{ color: 'var(--lam-white)' }}>{ws.identityMode}</strong></div>
                    <div>Active Members: <strong style={{ color: 'var(--lam-white)' }}>{ws.members.length}</strong></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <a
                    href={ws.ssoLaunchUrl}
                    className="btn btn-primary"
                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '0.65rem', fontSize: 'var(--text-xs)' }}
                  >
                    Open {ws.productName} →
                  </a>
                  <button
                    onClick={() => { setSelectedWsId(ws.id); setActiveTab('users') }}
                    className="btn"
                    style={{ padding: '0.65rem', background: 'var(--lam-surface)', border: '1px solid var(--lam-border)', color: 'var(--lam-white)', fontSize: 'var(--text-xs)' }}
                  >
                    Manage Users
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TAB 2: WORKSPACE USERS & ROLES */}
      {activeTab === 'users' && selectedWs && (
        <div className="lam-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', margin: 0 }}>
                Workspace Users: <span style={{ color: 'var(--lam-gold)' }}>{selectedWs.productName} ({selectedWs.workspaceCode})</span>
              </h3>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
                Org: {selectedWs.organizationName} • Seat Usage: {selectedWs.activeSeats}/{selectedWs.maxSeats}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select
                value={selectedWsId}
                onChange={e => setSelectedWsId(e.target.value)}
                className="form-input"
                style={{ padding: '0.5rem', fontSize: 'var(--text-xs)' }}
              >
                {workspaces.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.productName} ({w.workspaceCode})</option>
                ))}
              </select>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
                style={{ padding: '0.55rem 1rem', fontSize: 'var(--text-xs)' }}
              >
                + Add User
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="lam-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--lam-border)', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem' }}>Workspace User ID</th>
                  <th style={{ padding: '0.75rem' }}>Full Name</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Auth Identity ID</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedWs.members.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                      No workspace members found.
                    </td>
                  </tr>
                ) : (
                  selectedWs.members.map((m: any) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 'var(--text-sm)' }}>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', color: 'var(--lam-gold)' }}>{m.userId}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--lam-white)' }}>{m.customerName}</td>
                      <td style={{ padding: '0.75rem', textTransform: 'capitalize', color: 'var(--lam-silver-light)' }}>{m.workspaceRole}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '3px',
                          fontSize: '10px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          background: m.status === 'active' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                          color: m.status === 'active' ? '#2ecc71' : '#e74c3c'
                        }}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
                        {m.authUserId?.substring(0, 12)}...
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleResetPassword(selectedWs.id, m.authUserId, m.userId)}
                            className="btn"
                            disabled={loading}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '11px', background: 'var(--lam-surface)', border: '1px solid var(--lam-border)', color: 'var(--lam-white)' }}
                          >
                            Reset Pwd
                          </button>
                          <button
                            onClick={() => handleToggleStatus(selectedWs.id, m.id, m.status)}
                            className="btn"
                            disabled={loading}
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '11px',
                              background: m.status === 'active' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)',
                              color: m.status === 'active' ? '#e74c3c' : '#2ecc71',
                              border: 'none'
                            }}
                          >
                            {m.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORGANIZATIONS */}
      {activeTab === 'organizations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {organizations.map((org: any) => (
            <div key={org.id} className="lam-card">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-gold)', fontFamily: 'monospace' }}>{org.organization_code}</span>
              <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', margin: '0.25rem 0 0.5rem' }}>{org.name}</h3>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
                Status: <span style={{ textTransform: 'capitalize', color: org.status === 'active' ? '#2ecc71' : '#e74c3c' }}>{org.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="lam-card" style={{ width: '100%', maxWidth: '480px', background: '#141414', border: '1px solid var(--lam-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', margin: 0 }}>Add Workspace Employee</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--lam-silver-dim)', cursor: 'pointer', fontSize: 'var(--text-lg)' }}>✕</button>
            </div>

            <form onSubmit={handleAddUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>Target Product Workspace</label>
                <select
                  value={addForm.workspaceId}
                  onChange={e => setAddForm({ ...addForm, workspaceId: e.target.value })}
                  className="form-input"
                  style={{ width: '100%' }}
                >
                  {workspaces.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.productName} ({w.workspaceCode}) — Usage: {w.activeSeats}/{w.maxSeats}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>User ID (Workspace Scoped)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ali, teacher, finance1"
                  value={addForm.userId}
                  onChange={e => setAddForm({ ...addForm, userId: e.target.value })}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Ali"
                    value={addForm.firstName}
                    onChange={e => setAddForm({ ...addForm, firstName: e.target.value })}
                    className="form-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>Last Name</label>
                  <input
                    type="text"
                    placeholder="Khan"
                    value={addForm.lastName}
                    onChange={e => setAddForm({ ...addForm, lastName: e.target.value })}
                    className="form-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', marginBottom: '0.4rem' }}>Initial Password (Optional — Auto Generated if Blank)</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={addForm.password}
                  onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn" style={{ flex: 1, background: 'var(--lam-surface)', border: '1px solid var(--lam-border)', color: 'var(--lam-white)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                  {loading ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
