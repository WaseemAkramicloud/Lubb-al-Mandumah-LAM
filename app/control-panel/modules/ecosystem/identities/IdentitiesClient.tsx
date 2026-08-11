'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleCustomerIdentityStatus } from '@/lib/actions/ecosystem-admin'

export function IdentitiesClient({ identities }: { identities: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleToggleStatus = async (customerId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    if (!window.confirm(`Are you sure you want to change account status to "${newStatus.toUpperCase()}"?`)) return

    setLoading(true)
    setError('')
    try {
      await toggleCustomerIdentityStatus(customerId, newStatus)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '4px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div className="lam-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--lam-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Customer Name</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Work Email</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Organization</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Last Login</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {identities.map(cust => {
              const mem = cust.memberships?.[0]
              const compName = mem?.company?.name || 'Unassigned'
              const compRole = mem?.company_role || ''

              return (
                <tr key={cust.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--lam-white)', fontWeight: 500 }}>
                    {cust.first_name} {cust.last_name || ''}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    {cust.email}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--lam-white)', fontSize: 'var(--text-sm)' }}>{compName}</div>
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
                      background: cust.status === 'active' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                      color: cust.status === 'active' ? '#2ecc71' : '#e74c3c'
                    }}>
                      {cust.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleStatus(cust.id, cust.status)}
                      disabled={loading}
                      style={{
                        background: 'none',
                        border: cust.status === 'active' ? '1px solid #e74c3c' : '1px solid #2ecc71',
                        color: cust.status === 'active' ? '#e74c3c' : '#2ecc71',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: 'var(--text-xs)',
                        cursor: 'pointer'
                      }}
                    >
                      {cust.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                    </button>
                  </td>
                </tr>
              )
            })}

            {identities.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No customer identities registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
