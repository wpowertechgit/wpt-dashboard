export type AppRole = 'admin' | 'production' | 'office' | 'office_production' | 'viewer' | null | undefined

export type PermissionKey =
  | 'view_dashboard' | 'view_projects' | 'edit_projects'
  | 'view_subassemblies' | 'edit_subassemblies'
  | 'view_planning'
  | 'view_blockages' | 'edit_blockages'
  | 'view_pdca' | 'edit_pdca'
  | 'view_daily_flow' | 'edit_daily_flow'
  | 'view_kpi' | 'edit_kpi'
  | 'view_tasks' | 'create_tasks' | 'manage_tasks'
  | 'view_inventory' | 'edit_inventory'
  | 'manage_users' | 'manage_roles'

export const ROLE_DEFAULTS: Record<string, PermissionKey[]> = {
  admin: [
    'view_dashboard','view_projects','edit_projects',
    'view_subassemblies','edit_subassemblies','view_planning',
    'view_blockages','edit_blockages','view_pdca','edit_pdca',
    'view_daily_flow','edit_daily_flow','view_kpi','edit_kpi',
    'view_tasks','create_tasks','manage_tasks',
    'view_inventory','edit_inventory',
    'manage_users','manage_roles',
  ],
  production: [
    'view_dashboard','view_projects','edit_projects',
    'view_subassemblies','edit_subassemblies','view_planning',
    'view_blockages','edit_blockages','view_pdca','edit_pdca',
    'view_daily_flow','edit_daily_flow','view_kpi','edit_kpi',
    'view_inventory',
  ],
  office: [
    'view_tasks','create_tasks',
    'view_inventory','edit_inventory',
  ],
  office_production: [
    'view_dashboard','view_projects','edit_projects',
    'view_subassemblies','edit_subassemblies','view_planning',
    'view_blockages','edit_blockages','view_pdca','edit_pdca',
    'view_daily_flow','edit_daily_flow','view_kpi','edit_kpi',
    'view_tasks','create_tasks',
    'view_inventory','edit_inventory',
  ],
  viewer: [
    'view_dashboard','view_projects',
    'view_subassemblies','view_planning',
    'view_blockages','view_pdca',
    'view_daily_flow','view_kpi',
    'view_tasks','view_inventory',
  ],
}

export interface PermissionOverride {
  permission_key: PermissionKey
  granted: boolean
}

export function resolvePermissions(role: AppRole, overrides: PermissionOverride[]): Set<PermissionKey> {
  const base = new Set<PermissionKey>(role ? (ROLE_DEFAULTS[role] ?? []) : [])
  for (const o of overrides) {
    if (o.granted) base.add(o.permission_key)
    else base.delete(o.permission_key)
  }
  return base
}

export function canWriteOperationalData(role: AppRole, options: { demoMode?: boolean } = {}): boolean {
  if (options.demoMode) return true
  return role === 'admin' || role === 'production' || role === 'office_production'
}
