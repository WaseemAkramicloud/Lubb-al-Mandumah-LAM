"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { checkEmailUniqueness, createStaffUser } from '@/lib/actions/users'
import PermissionBuilder from '@/components/PermissionBuilder'
import { StaffPermissions } from '@/lib/auth/permission-constants'

export default function CreateUserPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [emailPrefix, setEmailPrefix] = useState('')
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  
  const [isChecking, setIsChecking] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [permissions, setPermissions] = useState<StaffPermissions>({})

  // Auto-generate email prefix
  useEffect(() => {
    if (isEditingEmail) return // Don't auto-update if they are manually editing it

    const generatePrefix = (first: string, last: string) => {
      if (!first && !last) return ''
      
      const cleanFirst = first.toLowerCase().replace(/[^a-z0-9]/g, '')
      const cleanLast = last.toLowerCase().replace(/[^a-z0-9]/g, '')
      
      if (!cleanFirst) return cleanLast
      if (!cleanLast) return cleanFirst
      
      return `${cleanFirst}.${cleanLast}`
    }

    const prefix = generatePrefix(firstName, lastName)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmailPrefix(prefix)
  }, [firstName, lastName, isEditingEmail])

  // Debounce email uniqueness check
  useEffect(() => {
    if (!emailPrefix) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmailAvailable(null)
      return
    }

    const checkUnique = async () => {
      setIsChecking(true)
      const workEmail = `${emailPrefix}@lamweb.com`
      try {
        const unique = await checkEmailUniqueness(workEmail)
        setEmailAvailable(unique)
      } catch {
        setEmailAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }

    const timer = setTimeout(() => {
      checkUnique()
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [emailPrefix])


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    
    if (emailAvailable === false) {
      setErrorMsg("This email is already taken. Please modify the prefix.")
      setIsSubmitting(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.append('permissions', JSON.stringify(permissions))
    
    try {
      const res = await createStaffUser(formData)
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        router.push('/control-panel/users')
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/control-panel/users" style={{ color: 'var(--lam-silver)', textDecoration: 'none' }}>
          ← Back
        </Link>
        <h1 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-white)', margin: 0 }}>
          Create Staff User
        </h1>
      </div>

      <div className="lam-card">
        {errorMsg && (
          <div style={{ padding: '1rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '4px', marginBottom: '1.5rem', fontSize: 'var(--text-sm)' }}>
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="first_name">First Name *</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="last_name">Last Name *</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="designation">Designation / Role *</label>
            <input
              id="designation"
              name="designation"
              type="text"
              required
              placeholder="e.g. Finance Manager"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email_prefix">Work Email *</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                id="email_prefix"
                name="email_prefix"
                type="text"
                required
                className="form-input"
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, flex: 1 }}
                value={emailPrefix}
                onChange={(e) => {
                  setIsEditingEmail(true)
                  setEmailPrefix(e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, ''))
                }}
              />
              <span style={{ 
                padding: '0.75rem 1rem', 
                background: 'var(--lam-surface)', 
                border: '1px solid var(--lam-border)',
                borderLeft: 'none',
                borderTopRightRadius: 'var(--radius-sm)',
                borderBottomRightRadius: 'var(--radius-sm)',
                color: 'var(--lam-silver-dim)',
                fontSize: 'var(--text-sm)',
                userSelect: 'none'
              }}>
                @lamweb.com
              </span>
            </div>
            
            {emailPrefix && (
              <div style={{ marginTop: '0.5rem', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isChecking ? (
                  <span style={{ color: 'var(--lam-silver)' }}>Checking availability...</span>
                ) : emailAvailable === true ? (
                  <span style={{ color: '#2ecc71' }}>✓ Email is available</span>
                ) : emailAvailable === false ? (
                  <span style={{ color: '#e74c3c' }}>✗ Email is already taken. Please try {emailPrefix}2 or similar.</span>
                ) : null}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="temporary_password">Temporary Password *</label>
            <input
              id="temporary_password"
              name="temporary_password"
              type="text"
              required
              minLength={8}
              placeholder="Generates temporary credential"
              className="form-input"
            />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', display: 'block', marginTop: '0.5rem' }}>
              The user will be forced to change this password on their first login.
            </span>
          </div>

          {/* Permissions Builder Section */}
          <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--lam-border)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.5rem' }}>Access & Permissions</h2>
            <PermissionBuilder 
              initialPermissions={permissions}
              onPermissionsChange={setPermissions} 
            />
          </div>

          <div style={{ borderTop: '1px solid var(--lam-border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting || isChecking || emailAvailable === false}
              style={{ width: '100%' }}
            >
              {isSubmitting ? 'Creating User...' : 'Create Staff User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
