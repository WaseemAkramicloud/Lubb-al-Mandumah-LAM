import { getCurrentCustomer } from '@/lib/actions/customer-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const metadata = {
  title: "Customer Account Portal | LΛM ID",
  robots: { index: false, follow: false },
}

export default async function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCurrentCustomer()

  if (!customer) {
    redirect('/id/login?redirect_to=/portal')
  }

  const supabase = getSupabaseAdmin()

  // Fetch customer's primary active company
  const { data: membership } = await supabase
    .from('customer_company_memberships')
    .select(`
      company_role,
      company:crm_companies (id, company_id, name, status)
    `)
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  const company = (membership as any)?.company

  const navLinks = [
    { href: '/portal', label: 'Dashboard' },
    { href: '/portal/company', label: 'My Company' },
    { href: '/portal/products', label: 'My Products' },
    { href: '/portal/team', label: 'Team & Access' },
    { href: '/portal/security', label: 'Security' },
    { href: '/portal/profile', label: 'Profile' },
    { href: '/portal/support', label: 'Support' }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--lam-black)', color: 'var(--lam-white)' }}>
      {/* Top Bar */}
      <header style={{
        height: '64px',
        borderBottom: '1px solid var(--lam-border)',
        background: 'rgba(15, 15, 15, 0.9)',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/portal" style={{ textDecoration: 'none', color: 'var(--lam-white)', fontWeight: 700, fontSize: 'var(--text-lg)', letterSpacing: '0.1em' }}>
            L<span style={{ color: 'var(--lam-gold)' }}>Λ</span>M ID <span style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', fontWeight: 400, marginLeft: '0.5rem' }}>CUSTOMER PORTAL</span>
          </Link>

          {company && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(201, 168, 76, 0.08)',
              border: '1px solid rgba(201, 168, 76, 0.2)',
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              fontSize: 'var(--text-xs)'
            }}>
              <span style={{ color: 'var(--lam-gold)', fontWeight: 600 }}>{company.name}</span>
              {company.company_id && (
                <span style={{ fontFamily: 'monospace', color: 'var(--lam-silver-dim)' }}>({company.company_id})</span>
              )}
            </div>
          )}
        </div>

        {/* User Info & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <nav style={{ display: 'flex', gap: '1rem', fontSize: 'var(--text-sm)' }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} style={{ color: 'var(--lam-silver-light)', textDecoration: 'none' }}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ height: '20px', width: '1px', background: 'var(--lam-border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--lam-white)' }}>
                {customer.first_name} {customer.last_name || ''}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--lam-silver-dim)' }}>
                {customer.email}
              </div>
            </div>
            <form action="/api/auth/customer-signout" method="POST" style={{ margin: 0 }}>
              <button type="submit" style={{
                background: 'none',
                border: '1px solid var(--lam-border)',
                color: 'var(--lam-silver-dim)',
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer'
              }}>
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {children}
      </main>
    </div>
  )
}
