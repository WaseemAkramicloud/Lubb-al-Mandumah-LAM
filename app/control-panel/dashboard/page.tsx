import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { fetchUserPermissions } from '@/lib/auth/permissions'
import DashboardGrid from './DashboardGrid'

export const metadata = {
  title: "Dashboard | LΛM Control Panel",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/staff-login')
  }

  const isSuperadmin = user.user_metadata?.role === 'super_admin'

  // Fetch settings for layout
  const { data: settings } = await supabase
    .from('staff_settings')
    .select('dashboard_layout')
    .eq('user_id', user.id)
    .single()

  const defaultLayout = ['products_portfolio', 'leads', 'my_leads', 'follow_ups', 'users', 'audit', 'content']
  const layout = settings?.dashboard_layout || defaultLayout

  // Fetch permissions to know which widgets they are allowed to see
  const permissions = await fetchUserPermissions(user.id)

  const permittedLayout = layout.filter((widgetId: string) => {
    if (isSuperadmin) return true
    if (['leads', 'my_leads', 'follow_ups'].includes(widgetId)) return !!permissions.leads_clients
    if (widgetId === 'users') return !!permissions.user_management
    if (widgetId === 'audit') return !!permissions.audit_log
    if (widgetId === 'content') return !!permissions.site_management
    if (widgetId === 'products_portfolio') return !!permissions.products
    return false
  })

  // Fetch Business Metric Counts
  const adminClient = getSupabaseAdmin()

  const { count: totalClientsCount } = await adminClient.from('crm_companies').select('*', { count: 'exact', head: true })
  const { count: activeSubscriptionsCount } = await adminClient.from('customer_product_entitlements').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { count: totalProductsCount } = await adminClient.from('cms_products').select('*', { count: 'exact', head: true })
  const { count: newRequestsCount } = await adminClient.from('crm_leads').select('*', { count: 'exact', head: true }).eq('status', 'New')
  
  const now = new Date().toISOString()
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 86400000).toISOString()
  const { count: expiringSubscriptionsCount } = await adminClient.from('customer_product_entitlements')
    .select('*', { count: 'exact', head: true })
    .gte('expires_at', now)
    .lte('expires_at', thirtyDaysFromNow)

  const pendingActionsCount = (newRequestsCount || 0) + (expiringSubscriptionsCount || 0)

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '0.25rem' }}>
          Executive Dashboard
        </h1>
        <p style={{ color: 'var(--lam-silver-dim)', fontSize: 'var(--text-sm)' }}>
          High-level operational metrics across client accounts, active subscriptions, and website CMS.
        </p>
      </div>
      
      <DashboardGrid 
        layout={permittedLayout} 
        data={{ 
          totalClientsCount: totalClientsCount || 0,
          activeSubscriptionsCount: activeSubscriptionsCount || 0,
          totalProductsCount: totalProductsCount || 0,
          newRequestsCount: newRequestsCount || 0,
          expiringSubscriptionsCount: expiringSubscriptionsCount || 0,
          pendingActionsCount
        }} 
      />
    </div>
  )
}
