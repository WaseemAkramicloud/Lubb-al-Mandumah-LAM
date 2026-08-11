"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ModuleName } from '@/lib/auth/permission-constants'

interface SidebarNavProps {
  permissions: Record<string, string[]>
  isSuperadmin: boolean
}

export default function SidebarNav({ permissions, isSuperadmin }: SidebarNavProps) {
  const pathname = usePathname()

  const canAccess = (moduleName: ModuleName) => {
    if (isSuperadmin) return true
    return !!permissions[moduleName]
  }

  const navItems = [
    { href: '/control-panel/dashboard', label: 'Dashboard', module: null },
    { href: '/control-panel/modules/ecosystem', label: 'Ecosystem Admin', module: 'leads_clients' as ModuleName },
    { href: '/control-panel/modules/leads-clients', label: 'Leads & Clients', module: 'leads_clients' as ModuleName },
    { href: '/control-panel/modules/site-management', label: 'Site Management', module: 'site_management' as ModuleName },
    { href: '/control-panel/modules/products', label: 'Products', module: 'products' as ModuleName },
    { href: '/control-panel/modules/solutions', label: 'Solutions', module: 'site_management' as ModuleName },
    { href: '/control-panel/modules/industries', label: 'Industries', module: 'site_management' as ModuleName },
    { href: '/control-panel/modules/insights', label: 'Insights', module: 'insights' as ModuleName },
    { href: '/control-panel/modules/pricing', label: 'Pricing & Plans', module: 'pricing_plans' as ModuleName },
    { href: '/control-panel/modules/careers', label: 'Careers', module: 'careers' as ModuleName },
    { href: '/control-panel/modules/media-library', label: 'Media Library', module: 'media_library' as ModuleName },
    
    // Admin specific
    { href: '/control-panel/users', label: 'User Management', module: 'user_management' as ModuleName },
    { href: '/control-panel/access', label: 'Access & Permissions', module: 'access_permissions' as ModuleName },
    { href: '/control-panel/audit', label: 'Audit Log', module: 'audit_log' as ModuleName },
    { href: '/control-panel/modules/system-settings', label: 'System Settings', module: 'system_settings' as ModuleName },
    
    // Personal
    { href: '/control-panel/profile', label: 'My Profile', module: null },
    { href: '/control-panel/settings', label: 'Settings', module: null },
  ]

  return (
    <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {navItems.map((item) => {
        // Only show if user has access (or if it requires no specific module permission)
        if (item.module && !canAccess(item.module)) return null

        // Check active state
        // Exact match for dashboard/profile/settings, prefix match for modules (so subpages stay active)
        const isActive = item.href === '/control-panel/dashboard' 
          ? pathname === item.href
          : pathname?.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? 'var(--lam-white)' : 'var(--lam-silver)',
              background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? 600 : 400,
              textDecoration: 'none',
              transition: 'background 0.2s, color 0.2s'
            }}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
