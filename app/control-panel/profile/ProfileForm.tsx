'use client'

import { useState } from 'react'
import { updateProfileDetails, updatePassword } from '@/lib/actions/profile'

interface Props {
  profile: { staff_id: string, work_email: string, first_name: string, last_name: string, phone?: string, designation?: string, status: string }
}

export default function ProfileForm({ profile }: Props) {
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' })

  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' })

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileMsg({ text: '', type: '' })

    const formData = new FormData(e.currentTarget)
    const res = await updateProfileDetails(formData)

    if (res?.error) {
      setProfileMsg({ text: res.error, type: 'error' })
    } else {
      setProfileMsg({ text: 'Profile updated successfully.', type: 'success' })
    }
    setProfileLoading(false)
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordMsg({ text: '', type: '' })

    const formData = new FormData(e.currentTarget)
    const res = await updatePassword(formData)

    if (res?.error) {
      setPasswordMsg({ text: res.error, type: 'error' })
    } else {
      setPasswordMsg({ text: 'Password updated securely.', type: 'success' })
      ;(e.target as HTMLFormElement).reset()
    }
    setPasswordLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Read-Only Identity Section */}
      <div className="lam-card">
        <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.5rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
          Identity Information
        </h2>
        
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Staff ID</label>
            <input type="text" className="form-input" value={profile.staff_id} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', display: 'block', marginTop: '0.25rem' }}>Immutable identifier.</span>
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Work Email</label>
            <input type="text" className="form-input" value={profile.work_email} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', display: 'block', marginTop: '0.25rem' }}>Managed by Superadmin.</span>
          </div>
        </div>
      </div>

      {/* Editable Profile Details */}
      <div className="lam-card">
        <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.5rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
          Personal Details
        </h2>

        {profileMsg.text && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1.5rem', 
            fontSize: 'var(--text-sm)',
            background: profileMsg.type === 'error' ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)',
            color: profileMsg.type === 'error' ? '#e74c3c' : '#2ecc71'
          }}>
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">First Name</label>
              <input type="text" name="first_name" className="form-input" defaultValue={profile.first_name} required />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Last Name</label>
              <input type="text" name="last_name" className="form-input" defaultValue={profile.last_name} required />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Phone Number (Optional)</label>
              <input type="tel" name="phone" className="form-input" defaultValue={profile.phone || ''} placeholder="+971..." />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Designation</label>
              <input type="text" name="designation" className="form-input" defaultValue={profile.designation || ''} />
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="lam-card" style={{ borderColor: 'var(--lam-border)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.5rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
          Change Password
        </h2>

        {passwordMsg.text && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1.5rem', 
            fontSize: 'var(--text-sm)',
            background: passwordMsg.type === 'error' ? 'rgba(231,76,60,0.1)' : 'rgba(46,204,113,0.1)',
            color: passwordMsg.type === 'error' ? '#e74c3c' : '#2ecc71'
          }}>
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
          {/* Supabase doesn't strictly require current_password unless enabled, but good practice */}
          <div>
            <label className="form-label">Current Password</label>
            <input type="password" name="current_password" className="form-input" required />
          </div>
          <div>
            <label className="form-label">New Password</label>
            <input type="password" name="new_password" className="form-input" required minLength={6} />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input type="password" name="confirm_password" className="form-input" required minLength={6} />
          </div>
          <div>
            <button type="submit" className="btn btn-primary" disabled={passwordLoading} style={{ width: '100%' }}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
