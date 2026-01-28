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
} from "@hugeicons/core-free-icons"
import { permissionService, type Permission } from "@/lib/api"
import { toast } from "@/lib/toast"
import { usePermission } from "@/lib/hooks/use-permission"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Organize permissions by module and feature
interface PermissionGroup {
  module: string
  features: Record<string, Permission[]>
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = React.useState<Permission[]>([])
  const [groupedPermissions, setGroupedPermissions] = React.useState<Record<string, Permission[]>>({})
  const [organizedPermissions, setOrganizedPermissions] = React.useState<PermissionGroup[]>([])
  const [modules, setModules] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedModule, setSelectedModule] = React.useState<string>("all")
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
  }, [selectedModule])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      const params: any = {
        group_by_module: true,
        per_page: 1000,
      }
      if (selectedModule !== "all") {
        params.module = selectedModule
      }
      
      const response = await permissionService.getAll(params)
      
      if (response.success) {
        if (typeof response.data === 'object' && !Array.isArray(response.data)) {
          setGroupedPermissions(response.data as Record<string, Permission[]>)
          const all = Object.values(response.data as Record<string, Permission[]>).flat()
          setPermissions(all)
          
          // Organize by module and feature
          organizePermissions(response.data as Record<string, Permission[]>)
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
          organizePermissions(grouped)
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load permissions")
    } finally {
      setLoading(false)
    }
  }

  const organizePermissions = (grouped: Record<string, Permission[]>) => {
    const organized: PermissionGroup[] = []
    
    Object.entries(grouped).forEach(([module, perms]) => {
      // Group permissions by feature (based on permission slug prefix)
      const features: Record<string, Permission[]> = {}
      
      perms.forEach((perm) => {
        // Extract feature from slug (e.g., "view_users" -> "users", "manage_storage" -> "storage")
        const parts = perm.slug.split('_')
        let feature = "General"
        
        if (parts.length >= 2) {
          // Skip action words (view, create, update, delete, manage)
          const actionWords = ['view', 'create', 'update', 'delete', 'manage', 'enable', 'disable', 'send', 'generate', 'revoke', 'rotate', 'upload', 'bulk', 'cleanup', 'migrate']
          const featureParts = parts.filter(p => !actionWords.includes(p.toLowerCase()))
          if (featureParts.length > 0) {
            feature = featureParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
          } else {
            feature = parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1)
          }
        }
        
        if (!features[feature]) {
          features[feature] = []
        }
        features[feature].push(perm)
      })
      
      organized.push({
        module,
        features,
      })
    })
    
    // Sort by module name
    organized.sort((a, b) => a.module.localeCompare(b.module))
    
    setOrganizedPermissions(organized)
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

  const filteredOrganized = React.useMemo(() => {
    if (!searchQuery) return organizedPermissions

    const query = searchQuery.toLowerCase()
    const filtered: PermissionGroup[] = []
    
    organizedPermissions.forEach((group) => {
      const filteredFeatures: Record<string, Permission[]> = {}
      
      Object.entries(group.features).forEach(([feature, perms]) => {
        const filteredPerms = perms.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.slug.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            feature.toLowerCase().includes(query)
        )
        if (filteredPerms.length > 0) {
          filteredFeatures[feature] = filteredPerms
        }
      })
      
      if (Object.keys(filteredFeatures).length > 0 || group.module.toLowerCase().includes(query)) {
        filtered.push({
          module: group.module,
          features: filteredFeatures,
        })
      }
    })

    return filtered
  }, [organizedPermissions, searchQuery])

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Permissions</h1>
            <p className="text-muted-foreground mt-1">
              Manage system permissions organized by module and feature
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
                  className="px-3 py-2 border rounded-md bg-background"
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
            ) : (
              <div className="space-y-8">
                {filteredOrganized.map((group) => (
                  <div key={group.module} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{group.module || "Other"}</h3>
                      <Badge variant="outline" className="text-xs">
                        {Object.values(group.features).flat().length} permissions
                      </Badge>
                    </div>
                    
                    {Object.entries(group.features).map(([feature, perms]) => (
                      <div key={feature} className="ml-4 space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">{feature}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {perms.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {permission.name}
                                </div>
                                <code className="text-xs text-muted-foreground truncate block">
                                  {permission.slug}
                                </code>
                                {permission.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                    {permission.description}
                                  </p>
                                )}
                              </div>
                              {canManage && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " shrink-0"}>
                                    <HugeiconsIcon icon={MoreVerticalCircle01Icon} />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
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
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                
                {filteredOrganized.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No permissions found</p>
                  </div>
                )}
              </div>
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
