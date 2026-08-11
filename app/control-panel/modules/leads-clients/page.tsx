import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'

export const metadata = {
  title: "Leads | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function LeadsListPage() {
  await requirePermission('leads_clients', 'view')
  
  const supabase = await createClient()

  // Fetch leads with relational product name and staff assignment
  const { data: leads, error } = await supabase
    .from('crm_leads')
    .select(`
      id, source_type, contact_person, company, email, interested_product, product_slug, status, created_at,
      assigned_to,
      assignee:staff_profiles!crm_leads_assigned_to_fkey (
        first_name, last_name
      ),
      product:cms_products!crm_leads_product_slug_fkey (
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching leads:", error)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }
      case 'Contacted': return { bg: 'rgba(241, 196, 15, 0.1)', color: '#f1c40f' }
      case 'Qualified': return { bg: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6' }
      case 'Proposal': return { bg: 'rgba(230, 126, 34, 0.1)', color: '#e67e22' }
      case 'Converted': return { bg: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' }
      case 'Closed/Lost': return { bg: 'rgba(149, 165, 166, 0.1)', color: '#95a5a6' }
      default: return { bg: 'rgba(255, 255, 255, 0.1)', color: 'var(--lam-silver)' }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)' }}>
          Leads
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/control-panel/modules/leads-clients/companies" className="btn" style={{ background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid var(--lam-border)' }}>
            Companies
          </Link>
          <Link href="/control-panel/modules/leads-clients/clients" className="btn" style={{ background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid var(--lam-border)' }}>
            Clients →
          </Link>
        </div>
      </div>

      <div className="lam-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--lam-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Contact / Company</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Source</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Product</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned To</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads?.map((lead) => {
              const statusStyle = getStatusColor(lead.status)
              const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(lead.created_at))
              // Display product name from relational join, fallback to free text
              const productDisplay = (lead.product as any)?.name || lead.interested_product || '-'
              
              return (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    {date}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--lam-white)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>{lead.contact_person}</div>
                    {lead.company && <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>{lead.company}</div>}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)', textTransform: 'capitalize' }}>
                    {lead.source_type}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    {productDisplay}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    {lead.assignee ? `${(lead.assignee as any).first_name} ${(lead.assignee as any).last_name}` : <span style={{ color: 'var(--lam-silver-dim)' }}>Unassigned</span>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: statusStyle.bg,
                      color: statusStyle.color
                    }}>
                      {lead.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <Link href={`/control-panel/modules/leads-clients/${lead.id}`} style={{
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
                      View Details
                    </Link>
                  </td>
                </tr>
              )
            })}
            
            {!leads || leads.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
