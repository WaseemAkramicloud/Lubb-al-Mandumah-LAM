import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'

export const metadata = {
  title: "Clients | LΛM Control Panel",
  robots: { index: false, follow: false },
}

export default async function ClientsListPage() {
  await requirePermission('leads_clients', 'view')
  
  const supabase = await createClient()

  const { data: clients, error } = await supabase
    .from('crm_clients')
    .select(`
      id, organization_name, contact_name, email, related_products, created_at,
      owner:staff_profiles!crm_clients_relationship_owner_fkey (
        first_name, last_name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching clients:", error)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)' }}>
          Clients
        </h1>
        <Link href="/control-panel/modules/leads-clients" className="btn" style={{ background: 'var(--lam-gunmetal)', color: 'white', border: '1px solid var(--lam-border)' }}>
          ← View Leads
        </Link>
      </div>

      <div className="lam-card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--lam-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Organization</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Contact Person</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Related Products</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Relationship Owner</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600 }}>Converted</th>
              <th style={{ padding: '1rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((client) => {
              const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(client.created_at))
              
              return (
                <tr key={client.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--lam-white)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                    {client.organization_name}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--lam-silver)', fontSize: 'var(--text-sm)' }}>{client.contact_name}</div>
                    <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>{client.email}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    {client.related_products && client.related_products.length > 0 ? client.related_products.join(', ') : '-'}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    {client.owner ? `${(client.owner as any).first_name} ${(client.owner as any).last_name}` : <span style={{ color: 'var(--lam-silver-dim)' }}>Unassigned</span>}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    {date}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <Link href={`/control-panel/modules/leads-clients/clients/${client.id}`} style={{
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
            
            {!clients || clients.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No clients found. Convert a lead to create a client profile.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
