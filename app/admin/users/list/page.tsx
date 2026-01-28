"use client"

import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { UserTable } from "@/components/users/user-table"
import { UserRow } from "@/components/users/user-row"
import { Pagination } from "@/components/users/pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, UserIcon, SearchIcon, CheckmarkCircle01Icon, AlertCircleIcon, ClockIcon } from "@hugeicons/core-free-icons"
import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import type { User } from "@/components/users/types"
import { AddUserDialog, EditUserDialog, DeleteUserDialog, type RoleOption } from "@/components/users/dialogs"
import { userService, roleService } from "@/lib/api"
import type { User as ApiUser } from "@/lib/api"
import { usePermission } from "@/lib/hooks/use-permission"

// Map backend status to frontend display
const mapStatusToDisplay = (status: string): "Active" | "Suspended" => {
  return status === 'active' ? 'Active' : 'Suspended'
}

// Map frontend display to backend status
const mapDisplayToStatus = (display: string): 'active' | 'suspended' => {
  return display === 'Active' ? 'active' : 'suspended'
}

// Map backend user to frontend user format
const mapApiUserToFrontend = (apiUser: ApiUser): User => {
  // Get primary role from roles array (default to "Customer" if no role assigned)
  const primaryRole = apiUser.roles?.[0]?.name || "Customer"

  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: primaryRole,
    status: mapStatusToDisplay(apiUser.status),
    isSystem: apiUser.is_system || false,
    createdAt: apiUser.created_at,
    lastLogin: apiUser.last_login_at,
  }
}

// Roles will be fetched from API

const statusColors: Record<string, { className: string; icon: any }> = {
  Active: {
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckmarkCircle01Icon,
  },
  Suspended: {
    className: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: AlertCircleIcon,
  },
}

const getRoleColor = (roleName: string): string => {
  const roleColors: Record<string, string> = {
    Owner: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    Admin: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    Member: "bg-green-500/10 text-green-600 border-green-500/20",
    Viewer: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  }
  return roleColors[roleName] || "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function UsersListPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { hasPermission } = usePermission()
  
  const [users, setUsers] = React.useState<User[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [roleFilter, setRoleFilter] = React.useState<string>("all")
  const [editingUser, setEditingUser] = React.useState<User | null>(null)
  const [deletingUser, setDeletingUser] = React.useState<User | null>(null)
  const [totalPages, setTotalPages] = React.useState(1)
  const [totalItems, setTotalItems] = React.useState(0)
  const [roles, setRoles] = React.useState<RoleOption[]>([])
  const itemsPerPage = 10

  // Permission check
  if (!hasPermission("view_users") && !hasPermission("manage_users")) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  // Get current page from URL params
  const currentPage = React.useMemo(() => {
    const pageParam = searchParams.get('page')
    const page = pageParam ? parseInt(pageParam, 10) : 1
    return isNaN(page) || page < 1 ? 1 : page
  }, [searchParams])

  // Update URL when page changes
  const setCurrentPage = React.useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("")
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      if (searchQuery && currentPage !== 1) {
        setCurrentPage(1) // Reset to first page on search
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, currentPage, setCurrentPage])

  // Fetch roles from API
  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await roleService.getAll()
        if (response.success && response.data) {
          setRoles(response.data.map(role => ({
            id: role.id,
            name: role.name,
            slug: role.slug,
          })))
        }
      } catch (err) {
        console.error("Failed to fetch roles:", err)
      }
    }
    fetchRoles()
  }, [])

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: any = {
        page: currentPage,
        per_page: itemsPerPage,
      }

      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery
      }

      if (roleFilter !== "all") {
        params.filter = { role: roleFilter.toLowerCase() }
      }

      const response = await userService.getAll(params)

      if (response.success && response.data) {
        const mappedUsers = response.data.map(mapApiUserToFrontend)
        setUsers(mappedUsers)

        if (response.pagination) {
          setTotalPages(response.pagination.last_page)
          setTotalItems(response.pagination.total)
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, debouncedSearchQuery, roleFilter])

  // Fetch users from API
  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleAddUser = async (userData: Omit<User, "id" | "createdAt">) => {
    try {
      // Find the role slug from the fetched roles
      const selectedRole = roles.find(r => r.name === userData.role)
      
      // Create user without password - they will receive an email to set their password
      const response = await userService.create({
        name: userData.name,
        email: userData.email,
        roles: selectedRole ? [selectedRole.slug] : [],
        status: mapDisplayToStatus(userData.status),
      })

      if (response.success && response.data) {
        const createdUser = mapApiUserToFrontend(response.data)

        // Update local state (avoid full re-fetch)
        setUsers((prev) => {
          // If we're not on first page, we still want counts to update,
          // but keep current page list stable.
          if (currentPage !== 1) return prev

          const next = [createdUser, ...prev]
          // Keep at most itemsPerPage entries on the current page
          return next.slice(0, itemsPerPage)
        })

        setTotalItems((prev) => {
          const nextTotal = prev + 1
          setTotalPages(Math.max(1, Math.ceil(nextTotal / itemsPerPage)))
          return nextTotal
        })
      }
    } catch (err: any) {
      throw err
    }
  }

  const handleUpdateUser = async (id: number | string, updates: Partial<User>) => {
    try {
      // Find the role slug from the fetched roles
      const selectedRole = roles.find(r => r.name === updates.role)
      
      // Always send all fields - permission check is done on the backend
      const updateData = {
        name: updates.name,
        email: updates.email,
        roles: selectedRole ? [selectedRole.slug] : undefined,
        status: updates.status ? mapDisplayToStatus(updates.status) : undefined,
      }

      const response = await userService.update(typeof id === "string" ? Number(id) : id, updateData)

      if (response.success && response.data) {
        const updatedUser = mapApiUserToFrontend(response.data)
        setUsers((prev) => prev.map((u) => (u.id === (typeof id === "string" ? Number(id) : id) ? updatedUser : u)))
      }
    } catch (err: any) {
      throw err
    }
  }

  const handleDeleteUser = async (id: number | string) => {
    try {
      const numId = typeof id === "string" ? Number(id) : id
      const response = await userService.delete(numId)

      if (response.success) {
        let becameEmpty = false

        setUsers((prev) => {
          const next = prev.filter((u) => u.id !== numId)
          becameEmpty = next.length === 0
          return next
        })

        setTotalItems((prev) => {
          const nextTotal = Math.max(0, prev - 1)
          setTotalPages(Math.max(1, Math.ceil(nextTotal / itemsPerPage)))
          return nextTotal
        })

        // If current page became empty, move back one page.
        // The `useEffect` will refetch for the new page.
        if (becameEmpty && currentPage > 1) {
          setCurrentPage(currentPage - 1)
        }
      }
    } catch (err: any) {
      throw err
    }
  }

  // Filter users by status (client-side since backend doesn't support it)
  const filteredUsers = React.useMemo(() => {
    if (statusFilter === "all") return users
    return users.filter((user) => user.status === statusFilter)
  }, [users, statusFilter])

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + filteredUsers.length

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground mt-2">
              Manage user accounts and their access
            </p>
          </div>
          <AddUserDialog onAdd={handleAddUser} roles={roles} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>All Users</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <HugeiconsIcon
                    icon={SearchIcon}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value || "all")
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={roleFilter}
                  onValueChange={(value) => {
                    setRoleFilter(value || "all")
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-12 mx-auto text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error loading users</h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchUsers} disabled={isLoading}>Retry</Button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <HugeiconsIcon icon={UserIcon} className="size-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all" || roleFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by adding your first user"}
                </p>
                {!searchQuery && statusFilter === "all" && roleFilter === "all" && (
                  <AddUserDialog onAdd={handleAddUser} roles={roles} />
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="border-b border-border">
                      <tr>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                          User
                        </th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                          Role
                        </th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                          Status
                        </th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                          Created
                        </th>
                        <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                          Last Login
                        </th>
                        <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3 w-12">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          onEdit={setEditingUser}
                          onDelete={setDeletingUser}
                          statusColors={statusColors}
                          getRoleColor={getRoleColor}
                          formatDate={formatDate}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    startIndex={startIndex + 1}
                    endIndex={Math.min(endIndex, totalItems)}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>

        <EditUserDialog
          user={editingUser}
          onUpdate={handleUpdateUser}
          onClose={() => setEditingUser(null)}
          roles={roles}
        />

        <DeleteUserDialog
          user={deletingUser}
          onDelete={handleDeleteUser}
          onClose={() => setDeletingUser(null)}
        />
      </div>
    </AdminDashboardLayout>
  )
}

export default function UsersListPage() {
  return (
    <React.Suspense fallback={
      <AdminDashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Users</h1>
              <p className="text-muted-foreground mt-2">
                Manage user accounts and their access
              </p>
            </div>
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading users...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminDashboardLayout>
    }>
      <UsersListPageContent />
    </React.Suspense>
  )
}
