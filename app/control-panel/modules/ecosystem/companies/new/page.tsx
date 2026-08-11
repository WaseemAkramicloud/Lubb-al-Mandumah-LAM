import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'
import OnboardingForm from './OnboardingForm'

export const metadata = {
  title: 'Onboard Customer Account | LΛM Control Panel',
  robots: { index: false, follow: false },
}

export default async function OnboardCustomerPage() {
  await requirePermission('leads_clients', 'edit')

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/ecosystem/companies" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Customer Accounts
        </Link>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
          Onboard New Customer Account
        </h1>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
          Controlled staff onboarding workflow to provision customer organizations, demo accounts, product entitlements, and owner access.
        </p>
      </div>

      <div style={{ maxWidth: '800px' }}>
        <OnboardingForm />
      </div>
    </div>
  )
}
