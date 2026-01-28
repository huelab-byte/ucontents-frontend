"use client"

import * as React from "react"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@/components/ui/button"
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
} from "@hugeicons/core-free-icons"
import { permissionService, type Permission } from "@/lib/api"
import { toast } from "@/lib/toast"
import { usePermission } from "@/lib/hooks/use-permission"

export default function PermissionsPage() {
  const [permissions, setPermissions] = React.useState<Permission[]>([])
  const [groupedPermissions, setGroupedPermissions] = React.useState<Record<string, Permission[]>>({})
  const [modules, setModules] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedModule, setSelectedModule] = React.useState<string>("all")
  const [groupByModule, setGroupByModule] = React.useState(true)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedPermission, setSelectedPermission] = React.useState<Permission | null>(null)
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    description: "",
    module: "",
  })

  const { hasPermission } = usePermission()

  const canManage = hasPermission("manage_permissions")

  React.useEffect(() => {
    loadPermissions()
    loadModules()
  }, [selectedModule, groupByModule])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      const params: any = {
        group_by_module: groupByModule,
      }
      if (selectedModule !== "all") {
        params.module = selectedModule
      }
      
      const response = await permissionService.getAll(params)
      
      if (response.success) {
        if (groupByModule && typeof response.data === 'object' && !Array.isArray(response.data)) {
          setGroupedPermissions(response.data as Record<string, Permission[]>)
          // Flatten for search
          const all = Object.values(response.data as Record<string, Permission[]>).flat()
          setPermissions(all)
        } else {
          setPermissions(response.data as Permission[])
          // Group manually if needed
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
    } finally {
      setLoading(false)
    }
  }

  const loadModules = async () => {
    try {
      const response = await permissionService.getModules()
      if (response.success) {
        setModules(response.data || [])
      }
    } catch (error) {
      // Ignore errors
    }
  }

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.slug) {
        toast.error("Name and slug are required")
        return
      }

      const response = await permissionService.create({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        module: formData.module || undefined,
      })

      if (response.success) {
        toast.success("Permission created successfully")
        setCreateDialogOpen(false)
        setFormData({ name: "", slug: "", description: "", module: "" })
        loadPermissions()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create permission")
    }
  }

  const handleEdit = async () => {
    if (!selectedPermission) return

    try {
      const response = await permissionService.update(selectedPermission.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        module: formData.module || undefined,
      })

      if (response.success) {
        toast.success("Permission updated successfully")
        setEditDialogOpen(false)
        setSelectedPermission(null)
        setFormData({ name: "", slug: "", description: "", module: "" })
        loadPermissions()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update permission")
    }
  }

  const handleDelete = async () => {
    if (!selectedPermission) return

    try {
      const response = await permissionService.delete(selectedPermission.id)

      if (response.success) {
        toast.success("Permission deleted successfully")
        setDeleteDialogOpen(false)
        setSelectedPermission(null)
        loadPermissions()
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete permission")
    }
  }

  const openEditDialog = (permission: Permission) => {
    setSelectedPermission(permission)
    setFormData({
      name: permission.name,
      slug: permission.slug,
      description: permission.description || "",
      module: permission.module || "",
    })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (permission: Permission) => {
    setSelectedPermission(permission)
    setDeleteDialogOpen(true)
  }

  const filteredPermissions = React.useMemo(() => {
    if (!searchQuery) return permissions

    const query = searchQuery.toLowerCase()
    return permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    )
  }, [permissions, searchQuery])

  const filteredGrouped = React.useMemo(() => {
    if (!searchQuery) return groupedPermissions

    const query = searchQuery.toLowerCase()
    const filtered: Record<string, Permission[]> = {}
    
    Object.entries(groupedPermissions).forEach(([module, perms]) => {
      const filteredPerms = perms.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      )
      if (filteredPerms.length > 0) {
        filtered[module] = filteredPerms
      }
    })

    return filtered
  }, [groupedPermissions, searchQuery])

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Permissions</h1>
            <p className="text-muted-foreground mt-1">
              Manage system permissions and access controls
            </p>
          </div>
          {canManage && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <HugeiconsIcon icon={PlusSignIcon} className="mr-2" />
                  Create Permission
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Permission</DialogTitle>
                  <DialogDescription>
                    Create a new permission that can be assigned to roles
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="View Users"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      placeholder="view_users"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Allows viewing the list of users"
                    />
                  </div>
                  <div>
                    <Label htmlFor="module">Module</Label>
                    <Input
                      id="module"
                      value={formData.module}
                      onChange={(e) =>
                        setFormData({ ...formData, module: e.target.value })
                      }
                      placeholder="UserManagement"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Permissions</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <HugeiconsIcon
                    icon={SearchIcon}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search permissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Modules</option>
                  {modules.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : groupByModule ? (
              <div className="space-y-6">
                {Object.entries(filteredGrouped).map(([module, perms]) => (
                  <div key={module}>
                    <h3 className="font-semibold mb-3">{module || "Other"}</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Roles</TableHead>
                          {canManage && <TableHead className="w-12"></TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {perms.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell className="font-medium">
                              {permission.name}
                            </TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {permission.slug}
                              </code>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {permission.description || "-"}
                            </TableCell>
                            <TableCell>{permission.roles_count || 0}</TableCell>
                            {canManage && (
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <HugeiconsIcon icon={MoreVerticalCircle01Icon} />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem
                                      onClick={() => openEditDialog(permission)}
                                    >
                                      <HugeiconsIcon icon={EditIcon} className="mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => openDeleteDialog(permission)}
                                      className="text-destructive"
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
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Roles</TableHead>
                    {canManage && <TableHead className="w-12"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        {permission.name}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {permission.slug}
                        </code>
                      </TableCell>
                      <TableCell>{permission.module || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {permission.description || "-"}
                      </TableCell>
                      <TableCell>{permission.roles_count || 0}</TableCell>
                      {canManage && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <HugeiconsIcon icon={MoreVerticalCircle01Icon} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => openEditDialog(permission)}
                              >
                                <HugeiconsIcon icon={EditIcon} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(permission)}
                                className="text-destructive"
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Permission</DialogTitle>
              <DialogDescription>
                Update permission details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                />
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
              <div>
                <Label htmlFor="edit-module">Module</Label>
                <Input
                  id="edit-module"
                  value={formData.module}
                  onChange={(e) =>
                    setFormData({ ...formData, module: e.target.value })
                  }
                />
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
              <DialogTitle>Delete Permission</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedPermission?.name}"? This
                action cannot be undone. If this permission is assigned to any roles,
                you must remove it from those roles first.
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
