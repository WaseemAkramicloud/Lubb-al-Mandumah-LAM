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

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { href: '/control-panel/dashboard', label: 'Dashboard', module: null },
      ]
    },
    {
      group: 'BUSINESS',
      items: [
        { href: '/control-panel/clients', label: 'Clients', module: 'leads_clients' as ModuleName },
        { href: '/control-panel/subscriptions', label: 'Products & Subscriptions', module: 'leads_clients' as ModuleName },
      ]
    },
    {
      group: 'WEBSITE',
      items: [
        { href: '/control-panel/modules/site-management', label: 'Website Management', module: 'site_management' as ModuleName },
      ]
    },
    {
      group: 'ADMINISTRATION',
      items: [
        { href: '/control-panel/users', label: 'Staff Users', module: 'user_management' as ModuleName },
        { href: '/control-panel/audit', label: 'Audit Log', module: 'audit_log' as ModuleName },
        { href: '/control-panel/modules/system-settings', label: 'System Settings', module: 'system_settings' as ModuleName },
        { href: '/control-panel/profile', label: 'My Profile', module: null },
      ]
    }
  ]

  return (
    <nav style={{ flex: 1, padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
      {navGroups.map((group) => {
        const visibleItems = group.items.filter(item => !item.module || canAccess(item.module))
        if (visibleItems.length === 0) return null

        return (
          <div key={group.group}>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--lam-silver-dim)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              paddingLeft: '0.75rem'
            }}>
              {group.group}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {visibleItems.map((item) => {
                const isActive = item.href === '/control-panel/dashboard'
                  ? pathname === item.href
                  : pathname?.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      color: isActive ? 'var(--lam-gold)' : 'var(--lam-silver)',
                      background: isActive ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--lam-gold)' : '3px solid transparent',
                      fontSize: 'var(--text-sm)',
                      fontWeight: isActive ? 600 : 400,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}
    </nav>
  )
}
