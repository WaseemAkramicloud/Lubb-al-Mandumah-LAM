'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { grantUserProductAccess, revokeUserProductAccess, inviteTeamMember } from '@/lib/actions/customer-auth'

interface Props {
  companyId: string
  currentCustomerId: string
  userRole: string
  members: any[]
  entitledProducts: string[]
  grants: any[]
}

export function TeamAccessClient({ companyId, currentCustomerId, userRole, members, entitledProducts, grants }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviteSuccess, setInviteSuccess] = useState('')

  const isOwnerOrAdmin = ['owner', 'admin'].includes(userRole)

  const hasAccess = (customerId: string, productSlug: string) => {
    return grants.some(g => g.customer_id === customerId && g.product_slug === productSlug && g.status === 'active')
  }

  const handleToggleAccess = async (customerId: string, productSlug: string, currentlyGranted: boolean) => {
    if (!isOwnerOrAdmin) return
    setLoading(true)
    setError('')
    try {
      if (currentlyGranted) {
        await revokeUserProductAccess(companyId, customerId, productSlug)
      } else {
        await grantUserProductAccess(companyId, customerId, productSlug)
      }
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return
    setLoading(true)
    setError('')
    setInviteSuccess('')

    try {
      const res = await inviteTeamMember(companyId, inviteEmail, inviteRole, entitledProducts)
      if (res.success) {
        setInviteSuccess(`Invitation link generated: ${res.inviteLink}`)
        setInviteEmail('')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isOwnerOrAdmin ? '2fr 1fr' : '1fr', gap: '2rem' }}>
      
      {/* Left: Team Members & Explicit Grants Table */}
      <div className="lam-card">
        <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.5rem' }}>
          Organization Members ({members.length})
        </h2>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '4px', marginBottom: '1rem', fontSize: 'var(--text-sm)' }}>
            {error}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--lam-border)' }}>
                <th style={{ padding: '0.75rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Member</th>
                <th style={{ padding: '0.75rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Role</th>
                {entitledProducts.map(slug => (
                  <th key={slug} style={{ padding: '0.75rem', color: 'var(--lam-gold)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'center' }}>
                    {slug}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map(m => {
                const cust = m.customer
                if (!cust) return null

                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ color: 'var(--lam-white)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                        {cust.first_name} {cust.last_name || ''}
                      </div>
                      <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>{cust.email}</div>
                    </td>

                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '3px', fontSize: '10px', textTransform: 'capitalize', background: 'rgba(255,255,255,0.05)', color: 'var(--lam-silver-light)' }}>
                        {m.company_role}
                      </span>
                    </td>

                    {entitledProducts.map(slug => {
                      const granted = hasAccess(cust.id, slug)
                      return (
                        <td key={slug} style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            disabled={!isOwnerOrAdmin || loading}
                            onClick={() => handleToggleAccess(cust.id, slug, granted)}
                            style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '4px',
                              fontSize: 'var(--text-xs)',
                              fontWeight: 600,
                              cursor: isOwnerOrAdmin ? 'pointer' : 'default',
                              border: granted ? '1px solid #2ecc71' : '1px solid var(--lam-border)',
                              background: granted ? 'rgba(46, 204, 113, 0.15)' : 'transparent',
                              color: granted ? '#2ecc71' : 'var(--lam-silver-dim)',
                              transition: 'all 0.2s'
                            }}
                          >
                            {granted ? '✓ Granted' : '+ Grant'}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Invite Member Form (for Owners/Admins) */}
      {isOwnerOrAdmin && (
        <div className="lam-card">
          <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1rem' }}>
            Invite Team Member
          </h2>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Send an invitation link to onboard a new employee to your organization with access to entitled products.
          </p>

          {inviteSuccess && (
            <div style={{ padding: '0.75rem', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', borderRadius: '4px', marginBottom: '1rem', fontSize: 'var(--text-xs)', wordBreak: 'break-all' }}>
              {inviteSuccess}
            </div>
          )}

          <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
                Employee Email
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--lam-silver-dim)', marginBottom: '0.5rem' }}>
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="form-input"
              >
                <option value="member">Member</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              {loading ? 'Generating Link...' : 'Generate Invite Link'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
