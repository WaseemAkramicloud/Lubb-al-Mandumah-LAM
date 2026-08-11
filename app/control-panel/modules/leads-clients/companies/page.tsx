import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'

export const metadata = {
  title: "Companies | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function CompaniesListPage() {
  await requirePermission('leads_clients', 'view')
  
  const supabase = await createClient()

  const { data: companies, error } = await supabase
    .from('crm_companies')
    .select(`
      id, company_id, name, country, city, email, status, source, created_at,
      assigned:staff_profiles!crm_companies_assigned_staff_fkey (
        first_name, last_name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching companies:", error)
  }

  const statusColors: Record<string, { bg: string; color: string }> = {
    'Active': { bg: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' },
    'Prospect': { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498db' },
    'Inactive': { bg: 'rgba(149, 165, 166, 0.1)', color: '#95a5a6' },
    'Churned': { bg: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' },
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)' }}>
          Companies
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/control-panel/modules/leads-clients" className="btn" style={{ background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid var(--lam-border)' }}>
            ← Leads
          </Link>
          <Link href="/control-panel/modules/leads-clients/clients" className="btn" style={{ background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid var(--lam-border)' }}>
            Clients
          </Link>
        </div>
      </div>

      <div className="lam-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--lam-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>ID</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Company Name</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Location</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned To</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies?.map((company) => {
              const ss = statusColors[company.status] || statusColors['Prospect']
              const location = [company.city, company.country].filter(Boolean).join(', ') || '-'
              
              return (
                <tr key={company.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
                      {company.company_id || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--lam-white)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>{company.name}</div>
                    {company.email && <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>{company.email}</div>}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    {location}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      background: ss.bg,
                      color: ss.color
                    }}>
                      {company.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    {company.assigned ? `${(company.assigned as any).first_name} ${(company.assigned as any).last_name}` : <span style={{ color: 'var(--lam-silver-dim)' }}>—</span>}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <Link href={`/control-panel/modules/leads-clients/companies/${company.id}`} style={{
                      display: 'inline-block',
                      background: 'none',
                      border: '1px solid var(--lam-border)',
                      color: 'var(--lam-silver)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: 'var(--text-xs)',
                      transition: 'all 0.2s'
                    }}>
                      View Profile
                    </Link>
                  </td>
                </tr>
              )
            })}
            
            {!companies || companies.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No companies found. Companies are created automatically during lead-to-client conversion.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
