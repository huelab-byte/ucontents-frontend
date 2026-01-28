"use client"

import * as React from "react"
import { usePermission } from "@/lib/hooks/use-permission"

interface PermissionGateProps {
  /** Single permission to check */
  permission?: string
  /** Multiple permissions - user must have ANY of these (OR logic) */
  anyOf?: string[]
  /** Multiple permissions - user must have ALL of these (AND logic) */
  allOf?: string[]
  /** Content to render if user has permission */
  children: React.ReactNode
  /** Fallback content to render if user doesn't have permission */
  fallback?: React.ReactNode
}

/**
 * Component to conditionally render content based on user permissions
 * 
 * @example
 * // Single permission
 * <PermissionGate permission="view_users">
 *   <UserList />
 * </PermissionGate>
 * 
 * @example
 * // Any of the permissions (OR logic)
 * <PermissionGate anyOf={["view_users", "manage_users"]}>
 *   <UserManagement />
 * </PermissionGate>
 * 
 * @example
 * // All permissions required (AND logic)
 * <PermissionGate allOf={["view_users", "create_user"]}>
 *   <CreateUserButton />
 * </PermissionGate>
 * 
 * @example
 * // With fallback
 * <PermissionGate permission="delete_user" fallback={<span>Not authorized</span>}>
 *   <DeleteButton />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()

  // Determine if user has required permission(s)
  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (anyOf && anyOf.length > 0) {
    hasAccess = hasAnyPermission(anyOf)
  } else if (allOf && allOf.length > 0) {
    hasAccess = hasAllPermissions(allOf)
  } else {
    // No permission specified, allow access
    hasAccess = true
  }

  if (hasAccess) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

/**
 * Hook-based alternative for permission checking in component logic
 * Returns a function that can be used to conditionally include items
 * 
 * @example
 * const can = useCanAccess()
 * 
 * const menuItems = [
 *   { label: "Dashboard", href: "/dashboard" },
 *   can("view_users") && { label: "Users", href: "/users" },
 *   can(["view_roles", "manage_roles"]) && { label: "Roles", href: "/roles" },
 * ].filter(Boolean)
 */
export function useCanAccess() {
  const { hasPermission, hasAnyPermission } = usePermission()

  return (permissions: string | string[]): boolean => {
    if (Array.isArray(permissions)) {
      return hasAnyPermission(permissions)
    }
    return hasPermission(permissions)
  }
}
