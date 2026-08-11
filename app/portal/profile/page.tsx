import { getCurrentCustomer } from '@/lib/actions/customer-auth'
import { ProfileFormClient } from './ProfileFormClient'

export const metadata = {
  title: "My Profile | Customer Portal",
}

export default async function CustomerProfilePage() {
  const customer = await getCurrentCustomer()
  if (!customer) return null

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.5rem' }}>
          My Account Profile
        </h1>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
          Manage your identity details, email address, and personal preferences.
        </p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <ProfileFormClient customer={customer} />
      </div>
    </div>
  )
}
