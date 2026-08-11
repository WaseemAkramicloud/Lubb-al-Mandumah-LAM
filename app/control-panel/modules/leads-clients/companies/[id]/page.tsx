import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/auth/permissions'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = {
  title: "Company Profile | LΛM Control Panel",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function CompanyDetailPage({ params }: Props) {
  await requirePermission('leads_clients', 'view')
  
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch company
  const { data: company, error } = await supabase
    .from('crm_companies')
    .select(`
      *,
      assigned:staff_profiles!crm_companies_assigned_staff_fkey (first_name, last_name)
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (error || !company) {
    notFound()
  }

  // Fetch contacts for this company
  const { data: contacts } = await supabase
    .from('crm_contacts')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  // Fetch product interests
  const { data: productInterests } = await supabase
    .from('crm_company_products')
    .select(`
      id, interest_type, created_at,
      product:cms_products!crm_company_products_product_slug_fkey (name, slug)
    `)
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  // Fetch linked leads
  const { data: linkedLeads } = await supabase
    .from('crm_leads')
    .select('id, contact_person, status, source_type, created_at')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch linked clients
  const { data: linkedClients } = await supabase
    .from('crm_clients')
    .select('id, organization_name, contact_name, created_at')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  const interestTypeColors: Record<string, { bg: string; color: string }> = {
    'Interested': { bg: 'rgba(52, 152, 219, 0.1)', color: '#3498db' },
    'Demo': { bg: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6' },
    'Active Client': { bg: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71' },
    'Churned': { bg: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' },
  }

  const infoItemStyle = { marginBottom: '1rem' }
  const labelStyle = { color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' as const, marginBottom: '0.25rem' }
  const valueStyle = { fontSize: 'var(--text-base)' }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/control-panel/modules/leads-clients/companies" style={{ color: 'var(--lam-silver-dim)', textDecoration: 'none', fontSize: 'var(--text-sm)' }}>
          ← Back to Companies
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column */}
        <div>
          {/* Company Info */}
          <div className="lam-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--lam-gold)', marginBottom: '0.25rem' }}>{company.name}</h2>
                {company.company_id && (
                  <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>{company.company_id}</span>
                )}
              </div>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                background: company.status === 'Active' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(52, 152, 219, 0.1)',
                color: company.status === 'Active' ? '#2ecc71' : '#3498db'
              }}>
                {company.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={infoItemStyle}>
                <div style={labelStyle}>Legal Name</div>
                <div style={valueStyle}>{company.legal_name || '-'}</div>
              </div>
              <div style={infoItemStyle}>
                <div style={labelStyle}>Email</div>
                <div style={valueStyle}>
                  {company.email ? <a href={`mailto:${company.email}`} style={{ color: 'var(--lam-gold)', textDecoration: 'none' }}>{company.email}</a> : '-'}
                </div>
              </div>
              <div style={infoItemStyle}>
                <div style={labelStyle}>Phone</div>
                <div style={valueStyle}>{company.phone || '-'}</div>
              </div>
              <div style={infoItemStyle}>
                <div style={labelStyle}>Website</div>
                <div style={valueStyle}>
                  {company.website ? <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--lam-gold)', textDecoration: 'none' }}>{company.website}</a> : '-'}
                </div>
              </div>
              <div style={infoItemStyle}>
                <div style={labelStyle}>Location</div>
                <div style={valueStyle}>{[company.city, company.country].filter(Boolean).join(', ') || '-'}</div>
              </div>
              <div style={infoItemStyle}>
                <div style={labelStyle}>Source</div>
                <div style={valueStyle}>{company.source || '-'}</div>
              </div>
              <div style={infoItemStyle}>
                <div style={labelStyle}>Assigned Staff</div>
                <div style={valueStyle}>
                  {company.assigned ? `${(company.assigned as any).first_name} ${(company.assigned as any).last_name}` : '-'}
                </div>
              </div>
              <div style={infoItemStyle}>
                <div style={labelStyle}>Since</div>
                <div style={valueStyle}>{new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(company.created_at))}</div>
              </div>
            </div>

            {company.notes && (
              <>
                <div className="lam-divider" style={{ margin: '1.5rem 0' }} />
                <div>
                  <div style={labelStyle}>Notes</div>
                  <div style={{ background: 'var(--lam-surface)', padding: '1rem', borderRadius: '4px', color: 'var(--lam-silver-light)', whiteSpace: 'pre-wrap', fontSize: 'var(--text-sm)' }}>
                    {company.notes}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Contacts */}
          <div className="lam-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.5rem' }}>
              Contacts ({contacts?.length || 0})
            </h3>

            {contacts && contacts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {contacts.map((contact: any) => (
                  <div key={contact.id} style={{ padding: '1rem', background: 'var(--lam-surface)', borderRadius: '4px', border: '1px solid var(--lam-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 500, color: 'var(--lam-white)' }}>
                        {contact.first_name} {contact.last_name || ''}
                      </span>
                      {contact.job_title && (
                        <span style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>{contact.job_title}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: 'var(--text-sm)', color: 'var(--lam-silver-light)' }}>
                      {contact.email && <span>✉ {contact.email}</span>}
                      {contact.phone && <span>☎ {contact.phone}</span>}
                      {contact.preferred_contact && contact.preferred_contact !== 'Email' && (
                        <span style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>Prefers: {contact.preferred_contact}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '1rem' }}>
                No contacts recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Product Interests */}
          <div className="lam-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.5rem' }}>
              Product Interests
            </h3>

            {productInterests && productInterests.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {productInterests.map((pi: any) => {
                  const its = interestTypeColors[pi.interest_type] || interestTypeColors['Interested']
                  return (
                    <div key={pi.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--lam-surface)', borderRadius: '4px' }}>
                      <Link href={`/control-panel/modules/products/${(pi.product as any)?.slug}/edit`} style={{ color: 'var(--lam-white)', textDecoration: 'none', fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                        {(pi.product as any)?.name || pi.product_slug}
                      </Link>
                      <span style={{ padding: '0.15rem 0.5rem', borderRadius: '3px', fontSize: 'var(--text-xs)', fontWeight: 600, background: its.bg, color: its.color }}>
                        {pi.interest_type}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '1rem' }}>
                No product interests recorded.
              </div>
            )}
          </div>

          {/* Linked Leads */}
          <div className="lam-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.5rem' }}>
              Linked Leads ({linkedLeads?.length || 0})
            </h3>

            {linkedLeads && linkedLeads.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {linkedLeads.map((lead: any) => (
                  <Link key={lead.id} href={`/control-panel/modules/leads-clients/${lead.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--lam-surface)', borderRadius: '4px', textDecoration: 'none', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    <span>{lead.contact_person}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>{lead.status}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '1rem' }}>
                No linked leads.
              </div>
            )}
          </div>

          {/* Linked Clients */}
          <div className="lam-card">
            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.5rem' }}>
              Client Records ({linkedClients?.length || 0})
            </h3>

            {linkedClients && linkedClients.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {linkedClients.map((client: any) => (
                  <Link key={client.id} href={`/control-panel/modules/leads-clients/clients/${client.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--lam-surface)', borderRadius: '4px', textDecoration: 'none', color: 'var(--lam-silver-light)', fontSize: 'var(--text-sm)' }}>
                    <span>{client.contact_name}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)' }}>
                      {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(client.created_at))}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '1rem' }}>
                No client records.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
