"use client"

import * as React from "react"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  MoreVerticalCircle01Icon,
  DeleteIcon,
  EditIcon,
  SearchIcon,
  UserGroupIcon,
  LockKeyIcon,
} from "@hugeicons/core-free-icons"
import { roleService, permissionService, type Role, type Permission } from "@/lib/api"
import { toast } from "@/lib/toast"
import { usePermission } from "@/lib/hooks/use-permission"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

export default function RolesPage() {
  const [roles, setRoles] = React.useState<Role[]>([])
  const [permissions, setPermissions] = React.useState<Permission[]>([])
  const [groupedPermissions, setGroupedPermissions] = React.useState<Record<string, Permission[]>>({})
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    description: "",
    hierarchy: 0,
    permissions: {} as Record<string, boolean>,
  })

  const { hasPermission } = usePermission()
  const canManage = hasPermission("manage_roles")

  React.useEffect(() => {
    loadRoles()
    loadPermissions()
  }, [])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const response = await roleService.getAll({ per_page: 100 })
      
      if (response.success) {
        setRoles(response.data || [])
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load roles")
    } finally {
      setLoading(false)
    }
  }

  const loadPermissions = async () => {
    try {
      const response = await permissionService.getAll({ group_by_module: true, per_page: 1000 })
      
      if (response.success) {
        if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          setGroupedPermissions(response.data as Record<string, Permission[]>)
          const all = Object.values(response.data as Record<string, Permission[]>).flat()
          setPermissions(all)
        } else {
          setPermissions(response.data as Permission[])
          // Group manually
          const grouped: Record<string, Permission[]> = {}
          ;(response.data as Permission[]).forEach((p) => {
            const module = p.module || "Other"
            if (!grouped[module]) {
              grouped[module] = []
            }
            grouped[module].push(p)
          })
          setGroupedPermissions(grouped)
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load permissions")
    }
  }

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.slug) {
        toast.error("Name and slug are required")
        return
      }

      const selectedPermissionSlugs = Object.entries(formData.permissions)
        .filter(([_, checked]) => checked)
        .map(([slug]) => slug)

      const response = await roleService.create({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        hierarchy: formData.hierarchy,
        permissions: selectedPermissionSlugs,
      })

      if (response.success) {
        toast.success("Role created successfully")
        setCreateDialogOpen(false)
        setFormData({ name: "", slug: "", description: "", hierarchy: 0, permissions: {} })
        loadRoles()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create role")
    }
  }

  const handleEdit = async () => {
    if (!selectedRole) return

    try {
      const selectedPermissionSlugs = Object.entries(formData.permissions)
        .filter(([_, checked]) => checked)
        .map(([slug]) => slug)

      const response = await roleService.update(selectedRole.id, {
        name: formData.name,
        description: formData.description || undefined,
        hierarchy: formData.hierarchy,
        permissions: selectedPermissionSlugs,
      })

      if (response.success) {
        toast.success("Role updated successfully")
        setEditDialogOpen(false)
        setSelectedRole(null)
        setFormData({ name: "", slug: "", description: "", hierarchy: 0, permissions: {} })
        loadRoles()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update role")
    }
  }

  const handleDelete = async () => {
    if (!selectedRole) return

    try {
      const response = await roleService.delete(selectedRole.id)

      if (response.success) {
        toast.success("Role deleted successfully")
        setDeleteDialogOpen(false)
        setSelectedRole(null)
        loadRoles()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete role")
    }
  }

  const openEditDialog = (role: Role) => {
    setSelectedRole(role)
    
    // Build permissions object from role's permissions
    const permissionsObj: Record<string, boolean> = {}
    if (role.permissions) {
      role.permissions.forEach((perm) => {
        permissionsObj[perm.slug] = true
      })
    }
    
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || "",
      hierarchy: role.hierarchy,
      permissions: permissionsObj,
    })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role)
    setDeleteDialogOpen(true)
  }

  const handlePermissionToggle = (permissionSlug: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionSlug]: checked,
      },
    }))
  }

  const filteredRoles = React.useMemo(() => {
    if (!searchQuery) return roles

    const query = searchQuery.toLowerCase()
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.slug.toLowerCase().includes(query) ||
        (r.description && r.description.toLowerCase().includes(query))
    )
  }, [roles, searchQuery])

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Roles</h1>
            <p className="text-muted-foreground mt-1">
              Manage user roles and their permissions
            </p>
          </div>
          {canManage && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Role</DialogTitle>
                  <DialogDescription>
                    Create a new role and assign permissions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="create-name">Name</Label>
                      <Input
                        id="create-name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Manager"
                      />
                    </div>
                    <div>
                      <Label htmlFor="create-slug">Slug</Label>
                      <Input
                        id="create-slug"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        placeholder="manager"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="create-description">Description</Label>
                    <Input
                      id="create-description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Manager role with content management access"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-hierarchy">Hierarchy (0-100)</Label>
                    <Input
                      id="create-hierarchy"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.hierarchy}
                      onChange={(e) =>
                        setFormData({ ...formData, hierarchy: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-base font-medium mb-3 block">Permissions</Label>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {Object.entries(groupedPermissions).map(([module, perms]) => (
                        <div key={module} className="space-y-2 p-3 border rounded-lg">
                          <h4 className="font-medium text-sm">{module || "Other"}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {perms.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`perm-${permission.slug}`}
                                  checked={formData.permissions[permission.slug] || false}
                                  onCheckedChange={(checked) =>
                                    handlePermissionToggle(permission.slug, checked as boolean)
                                  }
                                />
                                <Label
                                  htmlFor={`perm-${permission.slug}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {permission.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create Role</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Roles</CardTitle>
              <div className="relative">
                <HugeiconsIcon
                  icon={SearchIcon}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No roles found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Hierarchy</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Permissions</TableHead>
                    {canManage && <TableHead className="w-12"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {role.name}
                          {role.is_system && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">
                              System
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {role.slug}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {role.description || "-"}
                      </TableCell>
                      <TableCell>{role.hierarchy}</TableCell>
                      <TableCell>{role.users_count || 0}</TableCell>
                      <TableCell>{role.permissions?.length || 0}</TableCell>
                      {canManage && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
                              <HugeiconsIcon icon={MoreVerticalCircle01Icon} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => openEditDialog(role)}
                                disabled={role.is_system}
                              >
                                <HugeiconsIcon icon={EditIcon} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(role)}
                                className="text-destructive"
                                disabled={role.is_system}
                              >
                                <HugeiconsIcon icon={DeleteIcon} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>
                Update role details and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-hierarchy">Hierarchy (0-100)</Label>
                  <Input
                    id="edit-hierarchy"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.hierarchy}
                    onChange={(e) =>
                      setFormData({ ...formData, hierarchy: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <Separator />
              <div>
                <Label className="text-base font-medium mb-3 block">Permissions</Label>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {Object.entries(groupedPermissions).map(([module, perms]) => (
                    <div key={module} className="space-y-2 p-3 border rounded-lg">
                      <h4 className="font-medium text-sm">{module || "Other"}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {perms.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-perm-${permission.slug}`}
                              checked={formData.permissions[permission.slug] || false}
                              onCheckedChange={(checked) =>
                                handlePermissionToggle(permission.slug, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={`edit-perm-${permission.slug}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Role</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedRole?.name}"? This
                action cannot be undone. Users with this role will lose their access.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminDashboardLayout>
  )
}
