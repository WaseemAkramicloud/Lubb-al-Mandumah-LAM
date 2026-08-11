import { requirePermission } from '@/lib/auth/permissions'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'

export const metadata = {
  title: 'SSO & OAuth Applications | LΛM Ecosystem Admin',
  robots: { index: false, follow: false },
}

export default async function EcosystemSsoPage() {
  await requirePermission('system_settings', 'view')

  const adminClient = getSupabaseAdmin()

  // Fetch registered SSO applications
  const { data: ssoApps } = await adminClient
    .from('sso_applications')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Link href="/control-panel/modules/ecosystem" style={{ color: 'var(--lam-gold)', textDecoration: 'none', fontSize: 'var(--text-xs)' }}>
              ← Ecosystem Admin
            </Link>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)' }}>
            OAuth 2.0 / OIDC Applications Registry
          </h1>
          <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
            Registered client applications authorized to trust the LAM ID SSO identity server.
          </p>
        </div>
      </div>

      <div className="lam-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
          <thead>
            <tr style={{ background: 'var(--lam-surface-elevated)', borderBottom: '1px solid var(--lam-border)' }}>
              <th style={{ textAlign: 'left', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Client ID</th>
              <th style={{ textAlign: 'left', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Application Name</th>
              <th style={{ textAlign: 'left', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Product Slug</th>
              <th style={{ textAlign: 'left', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Allowed Redirect URIs</th>
              <th style={{ textAlign: 'center', padding: '0.85rem 1.25rem', color: 'var(--lam-silver-dim)' }}>Trusted</th>
            </tr>
          </thead>
          <tbody>
            {ssoApps && ssoApps.length > 0 ? (
              ssoApps.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--lam-border)' }}>
                  <td style={{ padding: '0.85rem 1.25rem', fontFamily: 'monospace', color: 'var(--lam-gold)', fontWeight: 600 }}>
                    {app.client_id}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', color: 'var(--lam-white)', fontWeight: 600 }}>
                    {app.client_name}
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', color: 'var(--lam-silver)' }}>
                    <span className="badge badge-gold" style={{ fontSize: '11px' }}>
                      {app.product_slug.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {app.redirect_uris.map((uri: string, idx: number) => (
                        <code key={idx} style={{ fontSize: '11px', color: 'var(--lam-silver-dim)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
                          {uri}
                        </code>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>
                    <span className={`badge ${app.is_trusted ? 'badge-success' : 'badge-warning'}`}>
                      {app.is_trusted ? 'VERIFIED' : 'UNTRUSTED'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--lam-silver-dim)' }}>
                  No OAuth applications registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
