import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { fetchUserPermissions } from '@/lib/auth/permissions'
import { ModuleName } from '@/lib/auth/permission-constants'
import Link from 'next/link'
import { logout } from '@/lib/actions/auth'

export default async function ControlPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/staff-login')
  }

  const isSuperadmin = user.user_metadata?.role === 'super_admin'

  // Fetch staff profile
  const adminClient = getSupabaseAdmin()
  const { data: profile } = await adminClient
    .from('staff_profiles')
    .select('status, requires_password_change, staff_id')
    .eq('id', user.id)
    .single()

  // Enforce account status (If profile doesn't exist yet but it's superadmin, allow it to pass temporarily so they can run migration/work)
  const isSuspended = profile?.status === 'suspended'
  if (isSuspended) {
    // Cannot call server action here directly for logout, so redirect to a route that handles it or login with error
    redirect('/staff-login?error=account_suspended')
  }

  // Force password change
  if (profile?.requires_password_change) {
    redirect('/force-change-password')
  }

  // Fetch permissions for sidebar rendering
  const permissions = await fetchUserPermissions(user.id)
  
  // Helper to determine if a module link should be shown
  const canAccess = (moduleName: ModuleName) => {
    if (isSuperadmin) return true
    return !!permissions[moduleName]
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--lam-black)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        background: 'var(--lam-gunmetal)', 
        borderRight: '1px solid var(--lam-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 10
      }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--lam-border)' }}>
          <div style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.5rem', 
            fontWeight: 700,
            background: 'var(--lam-gradient-gold)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.25rem'
          }}>
            LΛM Control Panel
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--lam-silver-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Website & Staff Administration
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/control-panel/dashboard" style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--lam-white)',
            background: 'rgba(255, 255, 255, 0.05)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            textDecoration: 'none'
          }}>
            Dashboard
          </Link>
          
          {/* Dynamic Modules based on permissions */}
          {canAccess('leads_clients') && (
            <Link href="/control-panel/leads" style={sidebarLinkStyle}>
              Leads & Clients
            </Link>
          )}
          {canAccess('site_management') && (
            <Link href="/control-panel/site" style={sidebarLinkStyle}>
              Site Management
            </Link>
          )}
          {canAccess('products') && (
            <Link href="/control-panel/products" style={sidebarLinkStyle}>
              Products
            </Link>
          )}
          {canAccess('insights') && (
            <Link href="/control-panel/insights" style={sidebarLinkStyle}>
              Insights
            </Link>
          )}
          {canAccess('pricing_plans') && (
            <Link href="/control-panel/modules/pricing" style={sidebarLinkStyle}>
              Pricing & Plans
            </Link>
          )}
          {canAccess('careers') && (
            <Link href="/control-panel/careers" style={sidebarLinkStyle}>
              Careers
            </Link>
          )}
          {canAccess('media_library') && (
            <Link href="/control-panel/media" style={sidebarLinkStyle}>
              Media Library
            </Link>
          )}
          
          {canAccess('user_management') && (
            <Link href="/control-panel/users" style={sidebarLinkStyle}>
              User Management
            </Link>
          )}
          {canAccess('access_permissions') && (
            <Link href="/control-panel/access" style={sidebarLinkStyle}>
              Access & Permissions
            </Link>
          )}
          {canAccess('audit_log') && (
            <Link href="/control-panel/audit" style={sidebarLinkStyle}>
              Audit Log
            </Link>
          )}
          {canAccess('system_settings') && (
            <Link href="/control-panel/modules/system-settings" style={sidebarLinkStyle}>
              System Settings
            </Link>
          )}
          <Link href="/control-panel/profile" style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--lam-silver)',
            fontSize: 'var(--text-sm)',
            textDecoration: 'none'
          }}>
            My Profile
          </Link>
          <Link href="/control-panel/settings" style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--lam-silver)',
            fontSize: 'var(--text-sm)',
            textDecoration: 'none'
          }}>
            Settings
          </Link>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--lam-border)' }}>
          <form action={logout}>
            <button type="submit" style={{
              width: '100%',
              padding: '0.75rem',
              background: 'transparent',
              border: '1px solid var(--lam-border)',
              color: 'var(--lam-silver)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              transition: 'all 0.2s ease'
            }}>
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <header style={{ 
          height: '70px', 
          borderBottom: '1px solid var(--lam-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 2rem',
          background: 'var(--lam-black)',
          position: 'sticky',
          top: 0,
          zIndex: 9
        }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--lam-silver)' }}>
            Logged in as <span style={{ color: 'var(--lam-gold)' }}>{user.email}</span>
            <span style={{ margin: '0 0.5rem', color: 'var(--lam-border)' }}>|</span>
            {isSuperadmin ? 'Superadmin' : 'Staff'}
            {profile?.staff_id && (
              <>
                <span style={{ margin: '0 0.5rem', color: 'var(--lam-border)' }}>|</span>
                <span style={{ color: 'var(--lam-silver-dim)' }}>ID: {profile.staff_id}</span>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '2rem' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

// Extracted style for cleaner JSX
const sidebarLinkStyle = {
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--lam-silver)',
  fontSize: 'var(--text-sm)',
  textDecoration: 'none',
  transition: 'background 0.2s, color 0.2s'
}
