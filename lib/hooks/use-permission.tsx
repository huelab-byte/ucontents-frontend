"use client"

import { useAuth } from "@/lib/auth-context"
import { useMemo, useCallback } from "react"

/**
 * Hook to check user permissions
 * 
 * @example
 * const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission()
 * 
 * if (hasPermission('view_users')) {
 *   // Show user list
 * }
 * 
 * if (hasAnyPermission(['view_users', 'manage_users'])) {
 *   // Show user management section
 * }
 * 
 * if (hasAllPermissions(['view_users', 'create_user'])) {
 *   // Show create user button
 * }
 */
export function usePermission() {
  const { user } = useAuth()

  // Get permissions from user object (already flattened by auth context)
  const permissions = useMemo(() => {
    if (!user) return []
    return user.permissions || []
  }, [user])

  // Get user role for super admin check
  const userRole = user?.role

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!userRole) return false
    
    // Super admin has all permissions
    if (userRole === 'super_admin') return true
    
    return permissions.includes(permission)
  }, [permissions, userRole])

  /**
   * Check if user has any of the given permissions (OR logic)
   */
  const hasAnyPermission = useCallback((permissionList: string[]): boolean => {
    if (!userRole) return false
    
    // Super admin has all permissions
    if (userRole === 'super_admin') return true
    
    return permissionList.some(permission => permissions.includes(permission))
  }, [permissions, userRole])

  /**
   * Check if user has all of the given permissions (AND logic)
   */
  const hasAllPermissions = useCallback((permissionList: string[]): boolean => {
    if (!userRole) return false
    
    // Super admin has all permissions
    if (userRole === 'super_admin') return true
    
    return permissionList.every(permission => permissions.includes(permission))
  }, [permissions, userRole])

  /**
   * Check if user is super admin (has all permissions)
   */
  const isSuperAdmin = useCallback((): boolean => {
    return userRole === 'super_admin'
  }, [userRole])

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
  }
}
