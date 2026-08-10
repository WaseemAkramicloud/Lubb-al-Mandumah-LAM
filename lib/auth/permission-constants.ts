// Type definitions
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'publish' | 'manage_pricing'

export type ModuleName = 
  | 'leads_clients'
  | 'site_management'
  | 'products'
  | 'insights'
  | 'pricing_plans'
  | 'careers'
  | 'media_library'
  | 'user_management'
  | 'access_permissions'
  | 'audit_log'
  | 'system_settings'

export type StaffPermissions = Partial<Record<ModuleName, PermissionAction[]>>

// Constants
export const MODULE_DEFINITIONS: Record<ModuleName, { label: string, actions: PermissionAction[] }> = {
  leads_clients: { label: 'Leads & Clients', actions: ['view', 'create', 'edit', 'delete'] },
  site_management: { label: 'Site Management', actions: ['view', 'create', 'edit', 'publish'] },
  products: { label: 'Products', actions: ['view', 'create', 'edit', 'delete'] },
  insights: { label: 'Insights', actions: ['view', 'create', 'edit', 'delete', 'publish'] },
  pricing_plans: { label: 'Pricing & Plans', actions: ['view', 'edit', 'manage_pricing'] },
  careers: { label: 'Careers', actions: ['view', 'create', 'edit', 'delete'] },
  media_library: { label: 'Media Library', actions: ['view', 'create', 'delete'] },
  user_management: { label: 'User Management', actions: ['view', 'create', 'edit', 'delete'] },
  access_permissions: { label: 'Access & Permissions', actions: ['view', 'edit'] },
  audit_log: { label: 'Audit Log', actions: ['view'] },
  system_settings: { label: 'System Settings', actions: ['view', 'edit'] },
}

export const ROLE_TEMPLATES: Record<string, { label: string, permissions: StaffPermissions }> = {
  content_editor: {
    label: 'Content Editor',
    permissions: {
      site_management: ['view', 'create', 'edit', 'publish'],
      insights: ['view', 'create', 'edit', 'publish'],
      media_library: ['view', 'create', 'delete']
    }
  },
  sales: {
    label: 'Sales / Client Relations',
    permissions: {
      leads_clients: ['view', 'create', 'edit', 'delete'],
      products: ['view']
    }
  },
  product_manager: {
    label: 'Product Manager',
    permissions: {
      products: ['view', 'create', 'edit', 'delete'],
      pricing_plans: ['view', 'edit']
    }
  },
  commercial_manager: {
    label: 'Commercial Manager',
    permissions: {
      leads_clients: ['view', 'edit'],
      pricing_plans: ['view', 'edit', 'manage_pricing'],
      insights: ['view']
    }
  },
  administrator: {
    label: 'Administrator',
    permissions: {
      leads_clients: ['view', 'create', 'edit', 'delete'],
      site_management: ['view', 'create', 'edit', 'publish'],
      products: ['view', 'create', 'edit', 'delete'],
      insights: ['view', 'create', 'edit', 'delete', 'publish'],
      pricing_plans: ['view', 'edit', 'manage_pricing'],
      careers: ['view', 'create', 'edit', 'delete'],
      media_library: ['view', 'create', 'delete'],
      user_management: ['view']
    }
  },
  superadmin: {
    label: 'Superadmin',
    permissions: {
      leads_clients: ['view', 'create', 'edit', 'delete'],
      site_management: ['view', 'create', 'edit', 'publish'],
      products: ['view', 'create', 'edit', 'delete'],
      insights: ['view', 'create', 'edit', 'delete', 'publish'],
      pricing_plans: ['view', 'edit', 'manage_pricing'],
      careers: ['view', 'create', 'edit', 'delete'],
      media_library: ['view', 'create', 'delete'],
      user_management: ['view', 'create', 'edit', 'delete'],
      access_permissions: ['view', 'edit'],
      audit_log: ['view'],
      system_settings: ['view', 'edit']
    }
  },
  empty: {
    label: 'Custom (Empty)',
    permissions: {}
  }
}
