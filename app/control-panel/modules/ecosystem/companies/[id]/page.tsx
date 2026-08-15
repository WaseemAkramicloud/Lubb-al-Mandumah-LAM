import { requirePermission } from '@/lib/auth/permissions'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { toggleCompanyStatusAction } from '@/lib/actions/customer-onboarding'
import { EditCompanyModal } from './EditCompanyModal'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Company Profile & Ecosystem Access | LΛM Control Panel',
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function EcosystemCompanyDetailPage({ params }: Props) {
  await requirePermission('leads_clients', 'view')

  const resolvedParams = await params
  const targetId = resolvedParams.id
  const adminClient = getSupabaseAdmin()

  // 1. Fetch Company Record (supports lookup by UUID PK or string company_id code)
  let { data: company } = await adminClient
    .from('crm_companies')
    .select(`
      *,
      assigned:staff_profiles!crm_companies_assigned_staff_fkey (id, first_name, last_name, email, staff_id)
    `)
    .eq('id', targetId)
    .maybeSingle()

  if (!company) {
    const { data: compByCode } = await adminClient
      .from('crm_companies')
      .select(`
        *,
        assigned:staff_profiles!crm_companies_assigned_staff_fkey (id, first_name, last_name, email, staff_id)
      `)
      .eq('company_id', targetId)
      .maybeSingle()

    company = compByCode
  }

  if (!company) {
    notFound()
  }

  // 2. Fetch Memberships & Linked Customer Identities
  const { data: memberships } = await adminClient
    .from('customer_company_memberships')
    .select(`
      id, company_role, status, created_at,
      identity:customer_identities (id, auth_user_id, email, first_name, last_name, status, last_login_at, created_at)
    `)
    .eq('company_id', company.id)
    .order('created_at', { ascending: true })

  // Identify Primary Owner
  const ownerMembership = memberships?.find(m => m.company_role === 'owner') || memberships?.[0]
  const primaryOwner = ownerMembership?.identity

  // 3. Fetch Product Entitlements (Company-Level Subscriptions)
  const { data: entitlements } = await adminClient
    .from('customer_product_entitlements')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: true })

  // 4. Fetch Tenant Product Instances (e.g. NEXORA tenant workspace reference)
  const { data: instances } = await adminClient
    .from('customer_product_instances')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: true })

  // 5. Fetch Explicit User Product Access Grants
  const { data: productAccess } = await adminClient
    .from('customer_product_access')
    .select(`
      id, product_slug, status, created_at, updated_at,
      customer:customer_identities (id, first_name, last_name, email)
    `)
    .eq('company_id', company.id)
    .order('created_at', { ascending: true })

  // 6. Fetch Account Audit Trail
  const { data: auditLogs } = await adminClient
    .from('customer_audit_logs')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })
    .limit(15)

  // 7. Fetch Staff Profiles for Staff Assignment in Edit Modal
  const { data: staffProfiles } = await adminClient
    .from('staff_profiles')
    .select('id, first_name, last_name, email, staff_id')
    .order('first_name', { ascending: true })

  const isDemo = company.company_type === 'demo'
  const isSuspended = company.status === 'Suspended' || company.status === 'Inactive'

  const infoItemStyle = { marginBottom: '1rem' }
  const labelStyle = { color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' as const, marginBottom: '0.25rem' }
  const valueStyle = { fontSize: 'var(--text-sm)', color: 'var(--lam-white)' }

  return (
    <div>
      {/* Top Header & Navigation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/control-panel/modules/ecosystem/companies" style={{ color: 'var(--lam-gold)', textDecoration: 'none', fontSize: 'var(--text-xs)' }}>
          ← Back to Customer Accounts
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', margin: 0 }}>
              {company.name}
            </h1>
            <span className={`badge ${isDemo ? 'badge-warning' : 'badge-gold'}`} style={{ fontSize: '11px' }}>
              {isDemo ? 'DEMO ACCOUNT' : 'STANDARD CUSTOMER'}
            </span>
            <span className={`badge ${isSuspended ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '11px' }}>
              {company.status.toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
            <span>Company Code: <strong style={{ color: 'var(--lam-gold)', fontFamily: 'monospace' }}>{company.company_id || company.id.slice(0, 8)}</strong></span>
            <span>Created: {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(company.created_at))}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <form action={async () => {
            'use server'
            await toggleCompanyStatusAction(company.id, company.status)
          }}>
            <button
              type="submit"
              className="btn"
              style={{
                padding: '0.5rem 1rem',
                fontSize: 'var(--text-xs)',
                background: isSuspended ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                color: isSuspended ? '#2ecc71' : '#e74c3c',
                border: `1px solid ${isSuspended ? 'rgba(46, 204, 113, 0.3)' : 'rgba(231, 76, 60, 0.3)'}`
              }}
            >
              {isSuspended ? 'Reactivate Account' : 'Suspend Account'}
            </button>
          </form>

          <EditCompanyModal company={company} staffProfiles={staffProfiles || []} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column */}
        <div>
          {/* 1. Company Overview Card */}
          <div className="lam-card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
              🏢 Company Overview
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div style={infoItemStyle}>
                <div style={labelStyle}>Display Name</div>
                <div style={valueStyle}>{company.name}</div>
              </div>

              <div style={infoItemStyle}>
                <div style={labelStyle}>Legal Name</div>
                <div style={valueStyle}>{company.legal_name || '-'}</div>
              </div>

              <div style={infoItemStyle}>
                <div style={labelStyle}>Customer Type</div>
                <div style={valueStyle}>{isDemo ? 'Demo / Trial Account' : 'Standard Enterprise Customer'}</div>
              </div>

              <div style={infoItemStyle}>
                <div style={labelStyle}>Primary Work Email</div>
                <div style={valueStyle}>
                  {company.email ? <a href={`mailto:${company.email}`} style={{ color: 'var(--lam-gold)', textDecoration: 'none' }}>{company.email}</a> : '-'}
                </div>
              </div>

              <div style={infoItemStyle}>
                <div style={labelStyle}>Main Phone</div>
                <div style={valueStyle}>{company.phone || '-'}</div>
              </div>

              <div style={infoItemStyle}>
                <div style={labelStyle}>Website URL</div>
                <div style={valueStyle}>
                  {company.website ? (
                    <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--lam-gold)', textDecoration: 'none' }}>
                      {company.website}
                    </a>
                  ) : '-'}
                </div>
              </div>

              <div style={infoItemStyle}>
                <div style={labelStyle}>Location</div>
                <div style={valueStyle}>{[company.city, company.country].filter(Boolean).join(', ') || '-'}</div>
              </div>

              <div style={infoItemStyle}>
                <div style={labelStyle}>Assigned Account Manager</div>
                <div style={valueStyle}>
                  {company.assigned ? `${(company.assigned as any).first_name} ${(company.assigned as any).last_name}` : 'Unassigned'}
                </div>
              </div>

              <div style={infoItemStyle}>
                <div style={labelStyle}>Account Source</div>
                <div style={valueStyle}>{company.source || 'Staff Controlled Onboarding'}</div>
              </div>
            </div>

            {company.notes && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--lam-border)' }}>
                <div style={labelStyle}>Internal Administrative Notes</div>
                <div style={{ background: 'var(--lam-surface)', padding: '1rem', borderRadius: '4px', color: 'var(--lam-silver-light)', whiteSpace: 'pre-wrap', fontSize: 'var(--text-xs)', lineHeight: 1.6 }}>
                  {company.notes}
                </div>
              </div>
            )}
          </div>

          {/* 2. Primary Owner & Company Members Card */}
          <div className="lam-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)' }}>
                👥 Primary Owner & Account Users ({memberships?.length || 0})
              </h2>
              <Link href="/control-panel/modules/ecosystem/identities" style={{ color: 'var(--lam-gold)', fontSize: 'var(--text-xs)', textDecoration: 'none' }}>
                Manage Identities →
              </Link>
            </div>

            {memberships && memberships.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr style={{ background: 'var(--lam-surface-elevated)', borderBottom: '1px solid var(--lam-border)' }}>
                      <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>Work Email</th>
                      <th style={{ textAlign: 'center', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>Company Role</th>
                      <th style={{ textAlign: 'center', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberships.map((mem: any) => {
                      const user = (mem.identity as any)
                      if (!user) return null
                      const isOwner = mem.company_role === 'owner'

                      return (
                        <tr key={mem.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                          <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: 'var(--lam-white)' }}>
                            {user.first_name} {user.last_name || ''}
                            {isOwner && (
                              <span className="badge badge-gold" style={{ fontSize: '9px', marginLeft: '0.5rem' }}>
                                OWNER
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', color: 'var(--lam-silver-light)' }}>
                            {user.email}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', textTransform: 'capitalize', color: 'var(--lam-silver-light)' }}>
                            {mem.company_role}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.15rem 0.4rem',
                              borderRadius: '3px',
                              fontSize: '9px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              background: user.status === 'active' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                              color: user.status === 'active' ? '#2ecc71' : '#e74c3c'
                            }}>
                              {user.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: 'var(--lam-silver-dim)' }}>
                            {user.last_login_at ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(user.last_login_at)) : 'Never'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
                No customer user memberships attached to this organization yet.
              </div>
            )}
          </div>

          {/* 3. Explicit User Product Access Grants */}
          <div className="lam-card">
            <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
              🔑 Explicit User Product Access Grants ({productAccess?.length || 0})
            </h2>

            {productAccess && productAccess.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr style={{ background: 'var(--lam-surface-elevated)', borderBottom: '1px solid var(--lam-border)' }}>
                      <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>User Name</th>
                      <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>Email</th>
                      <th style={{ textAlign: 'center', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>Product</th>
                      <th style={{ textAlign: 'center', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>Grant Status</th>
                      <th style={{ textAlign: 'right', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>Granted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productAccess.map((pa: any) => {
                      const u = (pa.customer as any)
                      if (!u) return null

                      return (
                        <tr key={pa.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                          <td style={{ padding: '0.65rem 0.85rem', fontWeight: 500, color: 'var(--lam-white)' }}>
                            {u.first_name} {u.last_name || ''}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', color: 'var(--lam-silver-light)' }}>
                            {u.email}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                            <span className="badge badge-gold" style={{ fontSize: '9px' }}>
                              {pa.product_slug.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.15rem 0.4rem',
                              borderRadius: '3px',
                              fontSize: '9px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              background: pa.status === 'active' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                              color: pa.status === 'active' ? '#2ecc71' : '#e74c3c'
                            }}>
                              {pa.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: 'var(--lam-silver-dim)' }}>
                            {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(pa.created_at))}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
                No explicit user product access grants registered.
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* 4. Company Product Entitlements */}
          <div className="lam-card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
              📦 Product Subscriptions & Entitlements
            </h2>

            {entitlements && entitlements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {entitlements.map((ent) => (
                  <div key={ent.id} style={{ background: 'var(--lam-surface)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--lam-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--lam-white)', fontSize: 'var(--text-sm)' }}>
                        {ent.product_slug.toUpperCase()}
                      </span>
                      <span style={{
                        padding: '0.15rem 0.4rem',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: ent.status === 'active' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                        color: ent.status === 'active' ? '#2ecc71' : '#e74c3c'
                      }}>
                        {ent.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-light)' }}>
                      <div>Plan: <strong style={{ color: 'var(--lam-gold)' }}>{ent.plan_tier.toUpperCase()}</strong></div>
                      <div>Seats: <strong style={{ color: 'var(--lam-white)' }}>{ent.max_seats} Max</strong></div>
                      {ent.expires_at && (
                        <div style={{ gridColumn: 'span 2', color: 'var(--lam-silver-dim)', marginTop: '0.25rem' }}>
                          Expires: {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(ent.expires_at))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
                No active product entitlements assigned.
              </div>
            )}
          </div>

          {/* 5. Product Tenant Instances (e.g. NEXORA Workspace Reference) */}
          <div className="lam-card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
              ⚡ SaaS Tenant Instances
            </h2>

            {instances && instances.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {instances.map((inst) => (
                  <div key={inst.id} style={{ background: 'var(--lam-surface)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--lam-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--lam-white)', fontSize: 'var(--text-xs)' }}>
                        {inst.product_slug.toUpperCase()} Instance
                      </span>
                      <span style={{
                        padding: '0.15rem 0.4rem',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: inst.status === 'active' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                        color: inst.status === 'active' ? '#2ecc71' : '#e74c3c'
                      }}>
                        {inst.status}
                      </span>
                    </div>

                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-light)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div>Tenant Key: <code style={{ color: 'var(--lam-gold)', fontFamily: 'monospace' }}>{inst.instance_key}</code></div>
                      <div>Environment: <span style={{ textTransform: 'capitalize' }}>{inst.environment}</span></div>
                      {inst.instance_url && (
                        <div>
                          URL:{' '}
                          <a href={inst.instance_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--lam-gold)', textDecoration: 'none' }}>
                            {inst.instance_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
                No product instances registered yet.
              </div>
            )}
          </div>

          {/* 6. Account Audit History */}
          <div className="lam-card">
            <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
              📋 Account Activity Log
            </h2>

            {auditLogs && auditLogs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {auditLogs.map((log) => (
                  <div key={log.id} style={{ background: 'var(--lam-surface)', padding: '0.75rem', borderRadius: '4px', borderLeft: '2px solid var(--lam-gold)' }}>
                    <div style={{ color: 'var(--lam-white)', fontWeight: 500, fontSize: 'var(--text-xs)', textTransform: 'capitalize' }}>
                      {log.action.replace(/_/g, ' ')}
                    </div>
                    <div style={{ color: 'var(--lam-silver-dim)', fontSize: '9px', marginTop: '0.2rem' }}>
                      {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(log.created_at))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
                No recent audit log events.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
