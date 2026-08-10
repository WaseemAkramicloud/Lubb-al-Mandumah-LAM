"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { saveUserPermissions } from '@/lib/actions/users'
import PermissionBuilder from '@/components/PermissionBuilder'
import { StaffPermissions } from '@/lib/auth/permission-constants'

interface Props {
  profile: { id: string, staff_id: string, first_name: string, last_name: string, designation: string, work_email: string, status: string }
  initialPermissions: StaffPermissions
}

export default function EditUserForm({ profile, initialPermissions }: Props) {
  const router = useRouter()
  const [permissions, setPermissions] = useState<StaffPermissions>(initialPermissions)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')
    
    try {
      // In this stage, we are only allowing editing of permissions via this UI 
      // (Profile editing is basic or reserved for My Profile). 
      // We will only call saveUserPermissions.
      
      const res = await saveUserPermissions(profile.id, permissions)
      
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg('Permissions updated successfully.')
        router.refresh()
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/control-panel/users" style={{ color: 'var(--lam-silver)', textDecoration: 'none' }}>
          ← Back
        </Link>
        <h1 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-white)', margin: 0 }}>
          Edit Access: {profile.first_name} {profile.last_name}
        </h1>
      </div>

      <div className="lam-card">
        {errorMsg && (
          <div style={{ padding: '1rem', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '4px', marginBottom: '1.5rem', fontSize: 'var(--text-sm)' }}>
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div style={{ padding: '1rem', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', borderRadius: '4px', marginBottom: '1.5rem', fontSize: 'var(--text-sm)' }}>
            {successMsg}
          </div>
        )}

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--lam-border)' }}>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', display: 'block' }}>Staff ID</span>
            <span style={{ color: 'var(--lam-white)' }}>{profile.staff_id}</span>
          </div>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', display: 'block' }}>Email</span>
            <span style={{ color: 'var(--lam-white)' }}>{profile.work_email}</span>
          </div>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', display: 'block' }}>Designation</span>
            <span style={{ color: 'var(--lam-white)' }}>{profile.designation}</span>
          </div>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', display: 'block' }}>Status</span>
            <span style={{ 
              color: profile.status === 'active' ? '#2ecc71' : '#e74c3c', 
              textTransform: 'uppercase', 
              fontSize: 'var(--text-xs)', 
              fontWeight: 600 
            }}>
              {profile.status}
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Permissions'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
