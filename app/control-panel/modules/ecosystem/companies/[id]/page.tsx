import { requirePermission } from '@/lib/auth/permissions'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { toggleCompanyStatusAction } from '@/lib/actions/customer-onboarding'
import { EditCompanyModal } from './EditCompanyModal'
import AdminOwnerActions from './AdminOwnerActions'
import ClientLifecycleActions from './ClientLifecycleActions'
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

  // 1. Fetch Company Record
  let { data: company } = await adminClient
    .from('crm_companies')
    .select(`
      *,
      assigned:staff_profiles!crm_companies_assigned_staff_fkey (id, first_name, last_name, staff_id)
    `)
    .eq('id', targetId)
    .maybeSingle()

  if (!company) {
    const { data: compByCode } = await adminClient
      .from('crm_companies')
      .select(`
        *,
        assigned:staff_profiles!crm_companies_assigned_staff_fkey (id, first_name, last_name, staff_id)
      `)
      .eq('company_id', targetId)
      .maybeSingle()

    company = compByCode
  }

  if (!company) {
    notFound()
  }

  // 2. Fetch Customer Account & Organizations
  const { data: customerAccount } = await adminClient
    .from('lam_customer_accounts')
    .select('*')
    .ilike('name', company.name)
    .maybeSingle()

  const { data: organizations } = await adminClient
    .from('lam_organizations')
    .select('*')
    .eq('customer_account_id', customerAccount?.id || company.id)

  // 3. Fetch Product Workspaces
  const { data: workspaces } = await adminClient
    .from('lam_product_workspaces')
    .select('*, organization:lam_organizations(id, organization_code, name)')
    .eq('customer_account_id', customerAccount?.id || company.id)

  // Calculate active seats per workspace
  const workspaceSeatCounts: Record<string, number> = {}
  if (workspaces && workspaces.length > 0) {
    for (const ws of workspaces) {
      const { count } = await adminClient
        .from('lam_workspace_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('workspace_id', ws.id)
        .eq('status', 'active')
      workspaceSeatCounts[ws.id] = count || 0
    }
  }

  // 4. Fetch Memberships & Linked Customer Identities
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
  const primaryOwner: any = Array.isArray(ownerMembership?.identity) ? ownerMembership.identity[0] : ownerMembership?.identity

  // 5. Fetch Product Entitlements (Company-Level Subscriptions)
  const { data: entitlements } = await adminClient
    .from('customer_product_entitlements')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: true })

  // 6. Fetch Tenant Product Instances
  const { data: instances } = await adminClient
    .from('customer_product_instances')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: true })

  // 7. Fetch Account Audit Trail
  const { data: auditLogs } = await adminClient
    .from('customer_audit_logs')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })
    .limit(15)

  // 8. Fetch Staff Profiles for Staff Assignment
  const { data: staffProfiles } = await adminClient
    .from('staff_profiles')
    .select('id, first_name, last_name, staff_id')
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
        <Link href="/control-panel/clients" style={{ color: 'var(--lam-gold)', textDecoration: 'none', fontSize: 'var(--text-xs)' }}>
          ← Back to Clients
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
            <span>Customer Account Code: <strong style={{ color: 'var(--lam-gold)', fontFamily: 'monospace' }}>{customerAccount?.customer_account_code || company.company_id || company.id.slice(0, 8)}</strong></span>
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
          {/* Client Lifecycle Actions Card */}
          <ClientLifecycleActions
            company={{
              id: company.id,
              name: company.name,
              company_id: company.company_id,
              status: company.status
            }}
            primaryOwnerName={primaryOwner ? `${primaryOwner.first_name || ''} ${primaryOwner.last_name || ''}`.trim() : 'Not set'}
            primaryOwnerEmail={primaryOwner?.email || company.email || 'Not set'}
            subscribedProducts={(entitlements || []).map((e: any) => e.product_slug)}
            userCount={memberships?.length || 1}
            tenantCount={instances?.length || 1}
          />

          {/* 1. Product Workspaces Card (Stage B Hierarchy Display) */}
          <div className="lam-card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
              ⚡ Subscribed Product Workspaces ({workspaces?.length || 0})
            </h2>

            {workspaces && workspaces.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {workspaces.map((ws: any) => {
                  const activeSeats = workspaceSeatCounts[ws.id] || 0
                  return (
                    <div key={ws.id} style={{ background: 'var(--lam-surface)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--lam-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--lam-white)', fontSize: 'var(--text-sm)' }}>
                            {ws.product_slug.toUpperCase()} Workspace
                          </span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--lam-gold)', background: 'black', padding: '0.15rem 0.5rem', borderRadius: '3px', fontSize: 'var(--text-xs)' }}>
                            {ws.workspace_code}
                          </span>
                        </div>
                        <span style={{
                          padding: '0.15rem 0.4rem',
                          borderRadius: '3px',
                          fontSize: '9px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          background: ws.status === 'active' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                          color: ws.status === 'active' ? '#2ecc71' : '#e74c3c'
                        }}>
                          {ws.status}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--lam-silver-light)', marginTop: '0.5rem' }}>
                        <div>Organization: <strong>{ws.organization?.name || '-'}</strong></div>
                        <div>Plan Tier: <strong style={{ color: 'var(--lam-gold)', textTransform: 'capitalize' }}>{ws.plan_tier}</strong></div>
                        <div>Active Seats: <strong style={{ color: 'var(--lam-white)' }}>{activeSeats} / {ws.max_seats} Seats</strong></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
                No product workspaces provisioned yet.
              </div>
            )}
          </div>

          {/* 2. Company Overview Card */}
          <div className="lam-card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
              🏢 Company Profile Overview
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div style={infoItemStyle}>
                <div style={labelStyle}>Client Name</div>
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
                <div style={labelStyle}>Location</div>
                <div style={valueStyle}>{[company.city, company.country].filter(Boolean).join(', ') || '-'}</div>
              </div>

              <div style={infoItemStyle}>
                <div style={labelStyle}>Assigned Account Manager</div>
                <div style={valueStyle}>
                  {company.assigned ? `${(company.assigned as any).first_name} ${(company.assigned as any).last_name}` : 'Unassigned'}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Company Owner & Account Members */}
          <div className="lam-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-white)', margin: 0 }}>
                👥 Primary Owner & Account Users ({memberships?.length || 0})
              </h2>
            </div>

            {memberships && memberships.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr style={{ background: 'var(--lam-surface-elevated)', borderBottom: '1px solid var(--lam-border)' }}>
                      <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>Name</th>
                      <th style={{ textAlign: 'left', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>Work Email</th>
                      <th style={{ textAlign: 'center', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>Role</th>
                      <th style={{ textAlign: 'center', padding: '0.65rem 0.85rem', color: 'var(--lam-silver-dim)' }}>Status</th>
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
                                COMPANY OWNER
                              </span>
                            )}
                            {isOwner && (
                              <AdminOwnerActions customerId={user.id} companyId={company.id} ownerEmail={user.email} />
                            )}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', color: 'var(--lam-silver-light)' }}>
                            {user.email}
                          </td>
                          <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', color: 'var(--lam-silver-light)' }}>
                            {isOwner ? 'Company Owner' : 'Member'}
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
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
                No customer user memberships registered.
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Organizations List */}
          <div className="lam-card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', color: 'var(--lam-gold)', marginBottom: '1.25rem', borderBottom: '1px solid var(--lam-border)', paddingBottom: '0.75rem' }}>
              🏛️ Organizations ({organizations?.length || 0})
            </h2>

            {organizations && organizations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {organizations.map((org: any) => (
                  <div key={org.id} style={{ background: 'var(--lam-surface)', padding: '0.85rem', borderRadius: '4px', border: '1px solid var(--lam-border)' }}>
                    <div style={{ color: 'var(--lam-white)', fontWeight: 600, fontSize: 'var(--text-xs)' }}>{org.name}</div>
                    <div style={{ color: 'var(--lam-gold)', fontFamily: 'monospace', fontSize: '11px', marginTop: '0.2rem' }}>{org.organization_code}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--lam-silver-dim)', fontSize: 'var(--text-xs)' }}>
                No organizations attached.
              </div>
            )}
          </div>

          {/* Account Audit History */}
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
