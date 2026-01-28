"use client"

import { usePermission } from "@/lib/hooks/use-permission"
import { ReactNode } from "react"

interface PermissionGuardProps {
  children: ReactNode
  permission?: string
  permissions?: string[]
  requireAll?: boolean // If true, requires all permissions (AND), otherwise any (OR)
  fallback?: ReactNode
}

/**
 * Component to conditionally render children based on user permissions
 * 
 * @example
 * <PermissionGuard permission="view_users">
 *   <UserList />
 * </PermissionGuard>
 * 
 * <PermissionGuard permissions={['view_users', 'create_user']} requireAll>
 *   <CreateUserButton />
 * </PermissionGuard>
 * 
 * <PermissionGuard 
 *   permissions={['view_users', 'view_analytics']} 
 *   fallback={<div>Access denied</div>}
 * >
 *   <Dashboard />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions)
    } else {
      hasAccess = hasAnyPermission(permissions)
    }
  } else {
    // No permission check specified, allow access
    hasAccess = true
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
