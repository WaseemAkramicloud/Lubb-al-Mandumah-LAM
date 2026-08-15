'use client'

import { useState } from 'react'
import { issueTemporaryPasswordAction } from '@/lib/actions/customer-onboarding'

interface Props {
  customerId: string
  companyId: string
  ownerEmail: string
}

export default function AdminOwnerActions({ customerId, companyId, ownerEmail }: Props) {
  const [loading, setLoading] = useState(false)
  const [tempPwd, setTempPwd] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleIssueTempPwd = async () => {
    const confirm = window.confirm(
      `⚠️ WARNING: Issuing a new temporary password updates access credentials for LAM ID '${ownerEmail}' GLOBALLY across all associated organization memberships.\n\nAre you sure you want to issue a new temporary password?`
    )
    if (!confirm) return

    setLoading(true)
    setError('')
    setTempPwd(null)

    try {
      const res = await issueTemporaryPasswordAction(customerId, companyId)
      if (res.success && res.temporaryPassword) {
        setTempPwd(res.temporaryPassword)
      } else {
        setError(res.error || 'Failed to issue temporary password.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (tempPwd) {
      const details = `LAM ID Login Details:\nURL: https://id.lubbalmandumah.com\nEmail: ${ownerEmail}\nTemporary Password: ${tempPwd}\nNote: Mandatory password change required at first login.`
      navigator.clipboard.writeText(details)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--lam-border)' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleIssueTempPwd}
          disabled={loading}
          className="btn"
          style={{
            padding: '0.4rem 0.75rem',
            fontSize: '11px',
            background: 'rgba(201, 168, 76, 0.15)',
            color: 'var(--lam-gold)',
            border: '1px solid rgba(201, 168, 76, 0.3)'
          }}
        >
          {loading ? 'Issuing Password...' : '⚡ Issue Temporary Password'}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: '0.5rem', fontSize: '11px', color: '#e74c3c' }}>
          {error}
        </div>
      )}

      {tempPwd && (
        <div style={{ marginTop: '0.75rem', background: 'var(--lam-black)', padding: '0.85rem', borderRadius: '4px', border: '1px solid var(--lam-gold)' }}>
          <div style={{ fontSize: '11px', color: 'var(--lam-gold)', fontWeight: 600, marginBottom: '0.35rem' }}>
            🔑 New Temporary Credentials Issued:
          </div>
          <div style={{ fontSize: '11px', color: 'var(--lam-white)', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
            Password: <strong>{tempPwd}</strong>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="btn btn-primary"
            style={{ fontSize: '10px', padding: '0.35rem 0.75rem' }}
          >
            {copied ? 'Copied Details! ✓' : 'Copy Credentials'}
          </button>
        </div>
      )}
    </div>
  )
}
