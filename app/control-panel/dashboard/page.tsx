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

  // Fetch Widget Data
  const adminClient = getSupabaseAdmin()
  
  let newRequestsCount = 0
  let myAssignedCount = 0
  let recentUpdatesCount = 0
  
  if (permittedLayout.includes('leads') || permittedLayout.includes('my_leads') || permittedLayout.includes('follow_ups')) {
    const { count: newCount } = await adminClient.from('crm_leads').select('*', { count: 'exact', head: true }).eq('status', 'New')
    newRequestsCount = newCount || 0

    const { count: assignedCount } = await adminClient.from('crm_leads').select('*', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .not('status', 'in', '("Closed/Lost","Converted")')
    myAssignedCount = assignedCount || 0

    // eslint-disable-next-line react-hooks/purity
    const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
    const { count: updatedCount } = await adminClient.from('crm_leads').select('*', { count: 'exact', head: true })
      .gte('updated_at', oneWeekAgo)
    recentUpdatesCount = updatedCount || 0
  }

  let activeStaffCount = 0
  if (permittedLayout.includes('users')) {
    const { count } = await adminClient.from('staff_profiles').select('*', { count: 'exact', head: true }).eq('status', 'active')
    activeStaffCount = count || 0
  }

  let recentLogsCount = 0
  if (permittedLayout.includes('audit')) {
    // past 24 hours
    // eslint-disable-next-line react-hooks/purity
    const yesterday = new Date(Date.now() - 86400000).toISOString()
    const { count } = await adminClient.from('audit_logs').select('*', { count: 'exact', head: true }).gte('created_at', yesterday)
    recentLogsCount = count || 0
  }

  // Product Portfolio Counts
  let totalProducts = 0
  let activeProducts = 0
  let devProducts = 0
  let testProducts = 0
  let pausedProducts = 0

  if (permittedLayout.includes('products_portfolio')) {
    const { count: total } = await adminClient.from('cms_products').select('*', { count: 'exact', head: true })
    totalProducts = total || 0

    const { count: active } = await adminClient.from('cms_products').select('*', { count: 'exact', head: true }).eq('lifecycle_status', 'Active')
    activeProducts = active || 0

    const { count: dev } = await adminClient.from('cms_products').select('*', { count: 'exact', head: true }).eq('lifecycle_status', 'Development')
    devProducts = dev || 0

    const { count: test } = await adminClient.from('cms_products').select('*', { count: 'exact', head: true }).in('lifecycle_status', ['Testing', 'Beta'])
    testProducts = test || 0

    const { count: paused } = await adminClient.from('cms_products').select('*', { count: 'exact', head: true }).eq('lifecycle_status', 'Paused')
    pausedProducts = paused || 0
  }

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--lam-white)', marginBottom: '2rem' }}>
        Dashboard
      </h1>
      
      <DashboardGrid 
        layout={permittedLayout} 
        data={{ 
          newRequestsCount, myAssignedCount, recentUpdatesCount, activeStaffCount, recentLogsCount,
          totalProducts, activeProducts, devProducts, testProducts, pausedProducts
        }} 
      />
    </div>
  )
}
