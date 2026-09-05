/**
 * DealFlow360 — Centralized Role-Based Access Control (RBAC) & Permissions
 * 
 * Defines all role constants, route access permissions, action-level capabilities,
 * and navigation item filters for:
 *  - SALES_REP
 *  - MANAGER (Sales Manager / Approver)
 *  - FINANCE (Finance / Operations)
 *  - ADMIN
 *  - CUSTOMER (Portal)
 */

export type UserRole = 'SALES_REP' | 'MANAGER' | 'FINANCE' | 'ADMIN' | 'CUSTOMER';

export interface NavItemConfig {
  path: string;
  label: string;
  href: string;
  icon?: string;
}

export type PermissionAction =
  | 'create:quotation'
  | 'edit:quotation'
  | 'delete:quotation'
  | 'approve:manager_level'
  | 'approve:finance_level'
  | 'configure:discount_tiers'
  | 'execute:fulfillment'
  | 'view:fulfillment'
  | 'manage:invoices'
  | 'manage:subscriptions'
  | 'view:deal_health'
  | 'view:reports'
  | 'manage:admin_settings';

// Master list of all internal navigation items
export const ALL_NAV_ITEMS: NavItemConfig[] = [
  { path: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { path: 'quotations', label: 'Quotations', href: '/quotations', icon: 'receipt_long' },
  { path: 'approvals', label: 'Approvals', href: '/approvals', icon: 'approval' },
  { path: 'fulfillment', label: 'Fulfillment', href: '/fulfillment', icon: 'local_shipping' },
  { path: 'subscriptions', label: 'Subscriptions', href: '/subscriptions', icon: 'autorenew' },
  { path: 'invoices', label: 'Invoices', href: '/invoices', icon: 'payments' },
  { path: 'deal-health', label: 'Deal Health', href: '/deal-health', icon: 'health_metrics' },
  { path: 'reports', label: 'Reports', href: '/reports', icon: 'bar_chart' },
  { path: 'admin-users', label: 'User Governance', href: '/admin/users', icon: 'manage_accounts' },
];

/**
 * Route access whitelist per role.
 * Any route not in this list for a given role will be route-guarded and redirected to dashboard.
 */
export const ROLE_ROUTE_ACCESS: Record<UserRole, string[]> = {
  ADMIN: [
    '/dashboard',
    '/quotations',
    '/approvals',
    '/fulfillment',
    '/subscriptions',
    '/invoices',
    '/deal-health',
    '/reports',
    '/customers',
    '/products',
    '/admin/users',
    '/admin/discount-tiers',
  ],
  MANAGER: [
    '/dashboard',
    '/quotations',
    '/approvals',
    '/fulfillment',
    '/deal-health',
    '/reports',
    '/admin/discount-tiers',
  ],
  FINANCE: [
    '/dashboard',
    '/quotations',
    '/approvals',
    '/fulfillment',
    '/subscriptions',
    '/invoices',
    '/deal-health',
    '/reports',
  ],
  SALES_REP: [
    '/dashboard',
    '/quotations',
    '/approvals',
    '/fulfillment',
    '/reports',
  ],
  CUSTOMER: [
    '/portal',
  ],
};

/**
 * Granular action permissions per role.
 */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  ADMIN: [
    'create:quotation',
    'edit:quotation',
    'delete:quotation',
    'approve:manager_level',
    'approve:finance_level',
    'configure:discount_tiers',
    'execute:fulfillment',
    'view:fulfillment',
    'manage:invoices',
    'manage:subscriptions',
    'view:deal_health',
    'view:reports',
    'manage:admin_settings',
  ],
  MANAGER: [
    'create:quotation',
    'edit:quotation',
    'approve:manager_level',
    'configure:discount_tiers',
    'execute:fulfillment',
    'view:fulfillment',
    'view:deal_health',
    'view:reports',
  ],
  FINANCE: [
    'approve:finance_level',
    'execute:fulfillment',
    'view:fulfillment',
    'manage:invoices',
    'manage:subscriptions',
    'view:deal_health',
    'view:reports',
  ],
  SALES_REP: [
    'create:quotation',
    'edit:quotation',
    'view:fulfillment',
    'view:reports',
  ],
  CUSTOMER: [],
};

/**
 * Check if a role can access a specific route.
 */
export function canAccessRoute(role: string | undefined | null, pathname: string): boolean {
  const normalizedRole = (role?.toUpperCase() || 'SALES_REP') as UserRole;
  const allowedRoutes = ROLE_ROUTE_ACCESS[normalizedRole] || ROLE_ROUTE_ACCESS.SALES_REP;

  return allowedRoutes.some((route) => {
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

/**
 * Check if a role has a specific capability/permission.
 */
export function hasPermission(role: string | undefined | null, action: PermissionAction): boolean {
  const normalizedRole = (role?.toUpperCase() || 'SALES_REP') as UserRole;
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissions.includes(action);
}

/**
 * Get the visible navigation items for a specific role at render time.
 * Only returns items the role is allowed to access — no locked or greyed-out items.
 */
export function getNavItemsForRole(role: string | undefined | null): NavItemConfig[] {
  const normalizedRole = (role?.toUpperCase() || 'SALES_REP') as UserRole;
  const allowedRoutes = ROLE_ROUTE_ACCESS[normalizedRole] || ROLE_ROUTE_ACCESS.SALES_REP;

  return ALL_NAV_ITEMS.filter((item) => {
    return allowedRoutes.some((route) => route === item.href || item.href.startsWith(`${route}/`));
  });
}

/**
 * Convenience helper methods for common UI conditional checks.
 */
export function canCreateQuotation(role: string | undefined | null): boolean {
  return hasPermission(role, 'create:quotation');
}

export function canExecuteFulfillment(role: string | undefined | null): boolean {
  return hasPermission(role, 'execute:fulfillment');
}

export function canApproveAtLevel(role: string | undefined | null, level: 'MANAGER' | 'FINANCE'): boolean {
  if (level === 'MANAGER') {
    return hasPermission(role, 'approve:manager_level');
  }
  if (level === 'FINANCE') {
    return hasPermission(role, 'approve:finance_level');
  }
  return false;
}

export function canApproveAny(role: string | undefined | null): boolean {
  return hasPermission(role, 'approve:manager_level') || hasPermission(role, 'approve:finance_level');
}

export function canManageInvoices(role: string | undefined | null): boolean {
  return hasPermission(role, 'manage:invoices');
}

export function canManageSubscriptions(role: string | undefined | null): boolean {
  return hasPermission(role, 'manage:subscriptions');
}

export function canViewDealHealth(role: string | undefined | null): boolean {
  return hasPermission(role, 'view:deal_health');
}
