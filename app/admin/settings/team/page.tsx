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
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  UserGroupIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  MoreVerticalCircle01Icon,
  DeleteIcon,
  SettingsIcon,
  DashboardSpeed01Icon,
  File01Icon,
  MachineRobotIcon,
  Video01Icon,
  CodeIcon,
  Analytics02Icon,
  EditIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

interface Permission {
  id: string
  label: string
  checked: boolean
}

interface PermissionSection {
  id: string
  title: string
  icon?: any
  permissions: Permission[]
}

interface Role {
  id: string
  name: string
  isDefault: boolean
  permissions?: Record<string, boolean>
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: "Active" | "Pending" | "Inactive"
}

const demoTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Owner",
    status: "Active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "Member",
    status: "Pending",
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice.williams@example.com",
    role: "Member",
    status: "Active",
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    role: "Viewer",
    status: "Active",
  },
]

const defaultRoles: Role[] = [
  { id: "1", name: "Owner", isDefault: true },
  { id: "2", name: "Admin", isDefault: true },
  { id: "3", name: "Member", isDefault: true },
  { id: "4", name: "Viewer", isDefault: true },
]

const getRoleColor = (roleName: string): string => {
  const roleColors: Record<string, string> = {
    Owner: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    Admin: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    Member: "bg-green-500/10 text-green-600 border-green-500/20",
    Viewer: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  }
  return roleColors[roleName] || "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
}

const statusColors: Record<string, { className: string; icon: any }> = {
  Active: {
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckmarkCircle01Icon,
  },
  Pending: {
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: AlertCircleIcon,
  },
  Inactive: {
    className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    icon: AlertCircleIcon,
  },
}

function InviteMemberDialog({
  onInvite,
  roles,
}: {
  onInvite: (email: string, role: string) => void
  roles: Role[]
}) {
  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState("Member")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onInvite(email, role)
    setEmail("")
    setRole("Member")
    setOpen(false)
  }

  const handleCancel = () => {
    setEmail("")
    setRole("Member")
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
            Invite Member
          </Button>
        }
      >
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
        Invite Member
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Invite Team Member</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Email</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Role</Label>
              </FieldLabel>
              <FieldContent>
                <Select value={role} onValueChange={(value) => setRole(value || "Member")} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((roleOption) => (
                      <SelectItem key={roleOption.id} value={roleOption.name}>
                        {roleOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </FieldGroup>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit">Send Invitation</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function Checkbox({
  checked,
  onCheckedChange,
  label,
  className,
  ...props
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  className?: string
} & React.ComponentProps<"input">) {
  return (
    <label className={cn("flex items-center gap-2 cursor-pointer", className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
        {...props}
      />
      <span className="text-sm leading-none">{label}</span>
    </label>
  )
}

function EditRoleDialog({
  role,
  onUpdate,
  onClose,
}: {
  role: Role | null
  onUpdate: (id: string, name: string, permissions: Record<string, boolean>) => void
  onClose: () => void
}) {
  const [name, setName] = React.useState("")
  const [permissionSections, setPermissionSections] = React.useState<PermissionSection[]>([])

  React.useEffect(() => {
    if (role) {
      setName(role.name)
      const defaultSections: PermissionSection[] = [
        {
          id: "dashboard",
          title: "Dashboard",
          icon: DashboardSpeed01Icon,
          permissions: [
            { id: "dashboard.view", label: "View Dashboard", checked: role.permissions?.["dashboard.view"] ?? true },
            { id: "dashboard.analytics", label: "View Analytics", checked: role.permissions?.["dashboard.analytics"] ?? false },
          ],
        },
        {
          id: "content",
          title: "Content Generation",
          icon: File01Icon,
          permissions: [
            { id: "content.view", label: "View Content", checked: role.permissions?.["content.view"] ?? true },
            { id: "content.create", label: "Create Content", checked: role.permissions?.["content.create"] ?? false },
            { id: "content.edit", label: "Edit Content", checked: role.permissions?.["content.edit"] ?? false },
            { id: "content.delete", label: "Delete Content", checked: role.permissions?.["content.delete"] ?? false },
            { id: "content.playground", label: "Access Playground", checked: role.permissions?.["content.playground"] ?? false },
          ],
        },
        {
          id: "automation",
          title: "Social Automation",
          icon: MachineRobotIcon,
          permissions: [
            { id: "automation.view", label: "View Automations", checked: role.permissions?.["automation.view"] ?? true },
            { id: "automation.create", label: "Create Automation", checked: role.permissions?.["automation.create"] ?? false },
            { id: "automation.edit", label: "Edit Automation", checked: role.permissions?.["automation.edit"] ?? false },
            { id: "automation.delete", label: "Delete Automation", checked: role.permissions?.["automation.delete"] ?? false },
            { id: "automation.run", label: "Run Automation", checked: role.permissions?.["automation.run"] ?? false },
          ],
        },
        {
          id: "footage",
          title: "Footage Library",
          icon: Video01Icon,
          permissions: [
            { id: "footage.view", label: "View Footage", checked: role.permissions?.["footage.view"] ?? true },
            { id: "footage.upload", label: "Upload Footage", checked: role.permissions?.["footage.upload"] ?? false },
            { id: "footage.delete", label: "Delete Footage", checked: role.permissions?.["footage.delete"] ?? false },
          ],
        },
        {
          id: "templates",
          title: "Templates",
          icon: CodeIcon,
          permissions: [
            { id: "templates.view", label: "View Templates", checked: role.permissions?.["templates.view"] ?? true },
            { id: "templates.create", label: "Create Template", checked: role.permissions?.["templates.create"] ?? false },
            { id: "templates.edit", label: "Edit Template", checked: role.permissions?.["templates.edit"] ?? false },
            { id: "templates.delete", label: "Delete Template", checked: role.permissions?.["templates.delete"] ?? false },
          ],
        },
        {
          id: "analytics",
          title: "Analytics",
          icon: Analytics02Icon,
          permissions: [
            { id: "analytics.view", label: "View Analytics", checked: role.permissions?.["analytics.view"] ?? true },
            { id: "analytics.export", label: "Export Reports", checked: role.permissions?.["analytics.export"] ?? false },
          ],
        },
        {
          id: "team",
          title: "Team Management",
          icon: UserGroupIcon,
          permissions: [
            { id: "team.view", label: "View Team", checked: role.permissions?.["team.view"] ?? true },
            { id: "team.invite", label: "Invite Members", checked: role.permissions?.["team.invite"] ?? false },
            { id: "team.edit", label: "Edit Members", checked: role.permissions?.["team.edit"] ?? false },
            { id: "team.remove", label: "Remove Members", checked: role.permissions?.["team.remove"] ?? false },
            { id: "team.roles", label: "Manage Roles", checked: role.permissions?.["team.roles"] ?? false },
          ],
        },
        {
          id: "settings",
          title: "Settings",
          icon: SettingsIcon,
          permissions: [
            { id: "settings.view", label: "View Settings", checked: role.permissions?.["settings.view"] ?? true },
            { id: "settings.edit", label: "Edit Settings", checked: role.permissions?.["settings.edit"] ?? false },
            { id: "settings.api", label: "Manage API Keys", checked: role.permissions?.["settings.api"] ?? false },
          ],
        },
      ]
      setPermissionSections(defaultSections)
    }
  }, [role])

  if (!role) return null

  const handlePermissionChange = (
    sectionId: string,
    permissionId: string,
    checked: boolean
  ) => {
    setPermissionSections(
      permissionSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              permissions: section.permissions.map((perm) =>
                perm.id === permissionId ? { ...perm, checked } : perm
              ),
            }
          : section
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      const permissions: Record<string, boolean> = {}
      permissionSections.forEach((section) => {
        section.permissions.forEach((perm) => {
          permissions[perm.id] = perm.checked
        })
      })
      onUpdate(role.id, name.trim(), permissions)
      onClose()
    }
  }

  return (
    <AlertDialog open={!!role} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent
        className="w-[90vw] max-w-6xl mx-auto max-h-[90vh] overflow-y-auto p-6 data-[size=default]:!max-w-6xl"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Role</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Role Name</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="e.g., Editor, Moderator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-2 block">Permissions</Label>
                <p className="text-sm text-muted-foreground">
                  Configure what this role can access and manage
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {permissionSections.map((section) => {
                  const SectionIcon = section.icon
                  return (
                    <div
                      key={section.id}
                      className="space-y-3 p-4 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {SectionIcon && (
                          <HugeiconsIcon
                            icon={SectionIcon}
                            className="size-4 text-muted-foreground"
                          />
                        )}
                        <Label className="text-sm font-medium">{section.title}</Label>
                      </div>
                      <div className="space-y-2">
                        {section.permissions.map((permission) => (
                          <Checkbox
                            key={permission.id}
                            checked={permission.checked}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(section.id, permission.id, checked)
                            }
                            label={permission.label}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </FieldGroup>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
            <Button type="submit">Update Role</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function RoleEditModal({
  role,
  onSave,
  onDelete,
  onClose,
}: {
  role: Role | null
  onSave: (id: string, name: string, permissions: Record<string, boolean>) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [name, setName] = React.useState("")
  const [permissionSections, setPermissionSections] = React.useState<PermissionSection[]>([])

  React.useEffect(() => {
    if (role) {
      setName(role.name)
    const defaultSections: PermissionSection[] = [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: DashboardSpeed01Icon,
        permissions: [
          { id: "dashboard.view", label: "View Dashboard", checked: role.permissions?.["dashboard.view"] ?? true },
          { id: "dashboard.analytics", label: "View Analytics", checked: role.permissions?.["dashboard.analytics"] ?? false },
        ],
      },
      {
        id: "content",
        title: "Content Generation",
        icon: File01Icon,
        permissions: [
          { id: "content.view", label: "View Content", checked: role.permissions?.["content.view"] ?? true },
          { id: "content.create", label: "Create Content", checked: role.permissions?.["content.create"] ?? false },
          { id: "content.edit", label: "Edit Content", checked: role.permissions?.["content.edit"] ?? false },
          { id: "content.delete", label: "Delete Content", checked: role.permissions?.["content.delete"] ?? false },
          { id: "content.playground", label: "Access Playground", checked: role.permissions?.["content.playground"] ?? false },
        ],
      },
      {
        id: "automation",
        title: "Social Automation",
        icon: MachineRobotIcon,
        permissions: [
          { id: "automation.view", label: "View Automations", checked: role.permissions?.["automation.view"] ?? true },
          { id: "automation.create", label: "Create Automation", checked: role.permissions?.["automation.create"] ?? false },
          { id: "automation.edit", label: "Edit Automation", checked: role.permissions?.["automation.edit"] ?? false },
          { id: "automation.delete", label: "Delete Automation", checked: role.permissions?.["automation.delete"] ?? false },
          { id: "automation.run", label: "Run Automation", checked: role.permissions?.["automation.run"] ?? false },
        ],
      },
      {
        id: "footage",
        title: "Footage Library",
        icon: Video01Icon,
        permissions: [
          { id: "footage.view", label: "View Footage", checked: role.permissions?.["footage.view"] ?? true },
          { id: "footage.upload", label: "Upload Footage", checked: role.permissions?.["footage.upload"] ?? false },
          { id: "footage.delete", label: "Delete Footage", checked: role.permissions?.["footage.delete"] ?? false },
        ],
      },
      {
        id: "templates",
        title: "Templates",
        icon: CodeIcon,
        permissions: [
          { id: "templates.view", label: "View Templates", checked: role.permissions?.["templates.view"] ?? true },
          { id: "templates.create", label: "Create Template", checked: role.permissions?.["templates.create"] ?? false },
          { id: "templates.edit", label: "Edit Template", checked: role.permissions?.["templates.edit"] ?? false },
          { id: "templates.delete", label: "Delete Template", checked: role.permissions?.["templates.delete"] ?? false },
        ],
      },
      {
        id: "analytics",
        title: "Analytics",
        icon: Analytics02Icon,
        permissions: [
          { id: "analytics.view", label: "View Analytics", checked: role.permissions?.["analytics.view"] ?? true },
          { id: "analytics.export", label: "Export Reports", checked: role.permissions?.["analytics.export"] ?? false },
        ],
      },
      {
        id: "team",
        title: "Team Management",
        icon: UserGroupIcon,
        permissions: [
          { id: "team.view", label: "View Team", checked: role.permissions?.["team.view"] ?? true },
          { id: "team.invite", label: "Invite Members", checked: role.permissions?.["team.invite"] ?? false },
          { id: "team.edit", label: "Edit Members", checked: role.permissions?.["team.edit"] ?? false },
          { id: "team.remove", label: "Remove Members", checked: role.permissions?.["team.remove"] ?? false },
          { id: "team.roles", label: "Manage Roles", checked: role.permissions?.["team.roles"] ?? false },
        ],
      },
      {
        id: "settings",
        title: "Settings",
        icon: SettingsIcon,
        permissions: [
          { id: "settings.view", label: "View Settings", checked: role.permissions?.["settings.view"] ?? true },
          { id: "settings.edit", label: "Edit Settings", checked: role.permissions?.["settings.edit"] ?? false },
          { id: "settings.api", label: "Manage API Keys", checked: role.permissions?.["settings.api"] ?? false },
        ],
      },
    ]
    setPermissionSections(defaultSections)
    } else {
      setName("")
      setPermissionSections([])
    }
  }, [role])

  const handlePermissionChange = (
    sectionId: string,
    permissionId: string,
    checked: boolean
  ) => {
    setPermissionSections(
      permissionSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              permissions: section.permissions.map((perm) =>
                perm.id === permissionId ? { ...perm, checked } : perm
              ),
            }
          : section
      )
    )
  }

  const handleSave = () => {
    if (role && name.trim()) {
      const permissions: Record<string, boolean> = {}
      permissionSections.forEach((section) => {
        section.permissions.forEach((perm) => {
          permissions[perm.id] = perm.checked
        })
      })
      onSave(role.id, name.trim(), permissions)
      onClose()
    }
  }

  if (!role) return null

  return (
    <AlertDialog open={!!role} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent
        className="w-[90vw] max-w-6xl mx-auto max-h-[90vh] overflow-y-auto p-6 data-[size=default]:!max-w-6xl"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Role</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4">
      <Field>
        <FieldLabel>
          <Label>Role Name</Label>
        </FieldLabel>
        <FieldContent>
          <Input
            placeholder="e.g., Editor, Moderator"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </FieldContent>
      </Field>

      <Separator />

      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium mb-2 block">Permissions</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Configure what this role can access and manage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {permissionSections.map((section) => {
            const SectionIcon = section.icon
            return (
              <div
                key={section.id}
                className="space-y-3 p-4 border border-border rounded-lg bg-background"
              >
                <div className="flex items-center gap-2 mb-3">
                  {SectionIcon && (
                    <HugeiconsIcon
                      icon={SectionIcon}
                      className="size-4 text-muted-foreground"
                    />
                  )}
                  <Label className="text-sm font-medium">{section.title}</Label>
                </div>
                <div className="space-y-2">
                  {section.permissions.map((permission) => (
                    <Checkbox
                      key={permission.id}
                      checked={permission.checked}
                      onCheckedChange={(checked) =>
                        handlePermissionChange(section.id, permission.id, checked)
                      }
                      label={permission.label}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        </div>

        <Separator />

        <AlertDialogFooter className="flex items-center gap-2">
          <Button onClick={handleSave}>
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 mr-2" />
            Save
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onDelete(role.id)
              onClose()
            }}
            className="text-destructive hover:text-destructive"
          >
            <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
            Delete
          </Button>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function EditMemberDialog({
  member,
  onUpdate,
  onClose,
  roles,
}: {
  member: TeamMember | null
  onUpdate: (id: string, email: string, role: string) => void
  onClose: () => void
  roles: Role[]
}) {
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState("")

  React.useEffect(() => {
    if (member) {
      setEmail(member.email)
      setRole(member.role)
    }
  }, [member])

  if (!member) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim() && role) {
      onUpdate(member.id, email.trim(), role)
      onClose()
    }
  }

  return (
    <AlertDialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Team Member</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Email</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Role</Label>
              </FieldLabel>
              <FieldContent>
                <Select value={role} onValueChange={(value) => setRole(value || "Member")} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((roleOption) => (
                      <SelectItem key={roleOption.id} value={roleOption.name}>
                        {roleOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </FieldGroup>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
            <Button type="submit">Update Member</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function CreateRoleDialog({
  onCreate,
}: {
  onCreate: (name: string, permissions: Record<string, boolean>) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")

  // Permission sections
  const [permissionSections, setPermissionSections] = React.useState<PermissionSection[]>([
    {
      id: "dashboard",
      title: "Dashboard",
      icon: DashboardSpeed01Icon,
      permissions: [
        { id: "dashboard.view", label: "View Dashboard", checked: true },
        { id: "dashboard.analytics", label: "View Analytics", checked: false },
      ],
    },
    {
      id: "content",
      title: "Content Generation",
      icon: File01Icon,
      permissions: [
        { id: "content.view", label: "View Content", checked: true },
        { id: "content.create", label: "Create Content", checked: false },
        { id: "content.edit", label: "Edit Content", checked: false },
        { id: "content.delete", label: "Delete Content", checked: false },
        { id: "content.playground", label: "Access Playground", checked: false },
      ],
    },
    {
      id: "automation",
      title: "Social Automation",
      icon: MachineRobotIcon,
      permissions: [
        { id: "automation.view", label: "View Automations", checked: true },
        { id: "automation.create", label: "Create Automation", checked: false },
        { id: "automation.edit", label: "Edit Automation", checked: false },
        { id: "automation.delete", label: "Delete Automation", checked: false },
        { id: "automation.run", label: "Run Automation", checked: false },
      ],
    },
    {
      id: "footage",
      title: "Footage Library",
      icon: Video01Icon,
      permissions: [
        { id: "footage.view", label: "View Footage", checked: true },
        { id: "footage.upload", label: "Upload Footage", checked: false },
        { id: "footage.delete", label: "Delete Footage", checked: false },
      ],
    },
    {
      id: "templates",
      title: "Templates",
      icon: CodeIcon,
      permissions: [
        { id: "templates.view", label: "View Templates", checked: true },
        { id: "templates.create", label: "Create Template", checked: false },
        { id: "templates.edit", label: "Edit Template", checked: false },
        { id: "templates.delete", label: "Delete Template", checked: false },
      ],
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: Analytics02Icon,
      permissions: [
        { id: "analytics.view", label: "View Analytics", checked: true },
        { id: "analytics.export", label: "Export Reports", checked: false },
      ],
    },
    {
      id: "team",
      title: "Team Management",
      icon: UserGroupIcon,
      permissions: [
        { id: "team.view", label: "View Team", checked: true },
        { id: "team.invite", label: "Invite Members", checked: false },
        { id: "team.edit", label: "Edit Members", checked: false },
        { id: "team.remove", label: "Remove Members", checked: false },
        { id: "team.roles", label: "Manage Roles", checked: false },
      ],
    },
    {
      id: "settings",
      title: "Settings",
      icon: SettingsIcon,
      permissions: [
        { id: "settings.view", label: "View Settings", checked: true },
        { id: "settings.edit", label: "Edit Settings", checked: false },
        { id: "settings.api", label: "Manage API Keys", checked: false },
      ],
    },
  ])

  const handlePermissionChange = (
    sectionId: string,
    permissionId: string,
    checked: boolean
  ) => {
    setPermissionSections(
      permissionSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              permissions: section.permissions.map((perm) =>
                perm.id === permissionId ? { ...perm, checked } : perm
              ),
            }
          : section
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      // Convert permissions to a flat object
      const permissions: Record<string, boolean> = {}
      permissionSections.forEach((section) => {
        section.permissions.forEach((perm) => {
          permissions[perm.id] = perm.checked
        })
      })
      onCreate(name.trim(), permissions)
      // Reset form
      setName("")
      setPermissionSections(
        permissionSections.map((section) => ({
          ...section,
          permissions: section.permissions.map((perm) => ({
            ...perm,
            checked: perm.id.includes(".view"),
          })),
        }))
      )
      setOpen(false)
    }
  }

  const handleCancel = () => {
    setName("")
    setPermissionSections(
      permissionSections.map((section) => ({
        ...section,
        permissions: section.permissions.map((perm) => ({
          ...perm,
          checked: perm.id.includes(".view"),
        })),
      }))
    )
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline">
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
            Create Role
          </Button>
        }
      >
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
        Create Role
      </AlertDialogTrigger>
      <AlertDialogContent
        className="w-[90vw] max-w-6xl mx-auto max-h-[90vh] overflow-y-auto p-6 data-[size=default]:!max-w-6xl"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Role</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Role Name</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="e.g., Editor, Moderator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-2 block">Permissions</Label>
                <p className="text-sm text-muted-foreground">
                  Configure what this role can access and manage
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {permissionSections.map((section) => {
                  const SectionIcon = section.icon
                  return (
                    <div key={section.id} className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-3">
                        {SectionIcon && (
                          <HugeiconsIcon
                            icon={SectionIcon}
                            className="size-4 text-muted-foreground"
                          />
                        )}
                        <Label className="text-sm font-medium">{section.title}</Label>
                      </div>
                      <div className="space-y-2">
                        {section.permissions.map((permission) => (
                          <Checkbox
                            key={permission.id}
                            checked={permission.checked}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(section.id, permission.id, checked)
                            }
                            label={permission.label}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </FieldGroup>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit">Create Role</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>(demoTeamMembers)
  const [roles, setRoles] = React.useState<Role[]>(defaultRoles)
  const [removingId, setRemovingId] = React.useState<string | null>(null)
  const [removingRoleId, setRemovingRoleId] = React.useState<string | null>(null)
  const [editingRole, setEditingRole] = React.useState<Role | null>(null)
  const [editingMember, setEditingMember] = React.useState<TeamMember | null>(null)
  const [expandedRoleId, setExpandedRoleId] = React.useState<string | null>(null)

  const handleInvite = (email: string, role: string) => {
    // Handle invitation logic here
    // For demo purposes, add a pending member
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: email.split("@")[0],
      email,
      role: role as TeamMember["role"],
      status: "Pending",
    }
    setTeamMembers([...teamMembers, newMember])
  }

  const handleRemove = (id: string) => {
    setRemovingId(id)
    // Simulate removal
    setTimeout(() => {
      setTeamMembers(teamMembers.filter((member) => member.id !== id))
      setRemovingId(null)
    }, 500)
  }

  const handleCreateRole = (name: string, permissions: Record<string, boolean>) => {
    // Check if role already exists
    if (roles.some((role) => role.name.toLowerCase() === name.toLowerCase())) {
      return
    }
    const newRole: Role = {
      id: Date.now().toString(),
      name,
      isDefault: false,
      permissions,
    }
    setRoles([...roles, newRole])
  }

  const handleUpdateRole = (id: string, name: string, permissions: Record<string, boolean>) => {
    setRoles(
      roles.map((role) =>
        role.id === id ? { ...role, name, permissions } : role
      )
    )
    setEditingRole(null)
    setExpandedRoleId(null)
  }

  const handleSaveRole = (id: string, name: string, permissions: Record<string, boolean>) => {
    setRoles(
      roles.map((role) =>
        role.id === id ? { ...role, name, permissions } : role
      )
    )
    setExpandedRoleId(null)
  }

  const handleUpdateMember = (id: string, email: string, role: string) => {
    setTeamMembers(
      teamMembers.map((member) =>
        member.id === id
          ? { ...member, email, role: role as TeamMember["role"] }
          : member
      )
    )
    setEditingMember(null)
  }

  const handleRemoveRole = (id: string) => {
    const role = roles.find((r) => r.id === id)
    if (!role || role.isDefault) {
      return
    }
    setRemovingRoleId(id)
    const membersWithRole = teamMembers.filter((member) => member.role === role.name)
    if (membersWithRole.length > 0) {
      setRemovingRoleId(null)
      return
    }
    setTimeout(() => {
      setRoles(roles.filter((role) => role.id !== id))
      setRemovingRoleId(null)
    }, 500)
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HugeiconsIcon icon={UserGroupIcon} className="size-8" />
              Team Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage team members, roles, permissions, and shared credits for collaborative
              workflows
            </p>
          </div>
          <div className="flex gap-2">
            <CreateRoleDialog onCreate={handleCreateRole} />
            <InviteMemberDialog onInvite={handleInvite} roles={roles} />
          </div>
        </div>

        {/* Roles Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={SettingsIcon} className="size-5" />
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {roles.length > 0 ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setExpandedRoleId(role.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all hover:scale-105 ${getRoleColor(role.name)} ${
                        removingRoleId === role.id ? "opacity-50" : ""
                      }`}
                    >
                      <span className="font-medium">{role.name}</span>
                    </button>
                  ))}
                </div>

                {/* Edit Role Modal */}
                <RoleEditModal
                  role={roles.find((r) => r.id === expandedRoleId) || null}
                  onSave={handleSaveRole}
                  onDelete={handleRemoveRole}
                  onClose={() => setExpandedRoleId(null)}
                />
              </>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No roles found. Create a role to get started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Team Members Section */}
        {teamMembers.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                      Name
                    </th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                      Email
                    </th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                      Role
                    </th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                      Status
                    </th>
                    <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3 w-12">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => {
                    const statusConfig = statusColors[member.status]
                    const StatusIcon = statusConfig.icon
                    return (
                      <tr
                        key={member.id}
                        className={`border-b border-border hover:bg-muted/50 transition-colors ${
                          removingId === member.id ? "opacity-50" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium">{member.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={getRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={statusConfig.className}>
                            <HugeiconsIcon icon={StatusIcon} className="size-3 mr-1" />
                            {member.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <HugeiconsIcon
                                    icon={MoreVerticalCircle01Icon}
                                    className="size-4"
                                  />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingMember(member)} className="text-xs">
                                <HugeiconsIcon icon={EditIcon} className="size-3 mr-2" />
                                Edit Member
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRemove(member.id)}
                                className="text-destructive focus:text-destructive text-xs"
                              >
                                <HugeiconsIcon icon={DeleteIcon} className="size-3 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <CardContent className="pt-6">
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="size-12 mx-auto text-muted-foreground mb-4"
              />
              <CardTitle className="mb-2">No team members yet</CardTitle>
              <p className="text-muted-foreground mb-4">
                Invite your first team member to get started with collaboration.
              </p>
              <InviteMemberDialog onInvite={handleInvite} roles={roles} />
            </CardContent>
          </Card>
        )}

        {/* Edit Role Dialog */}
        <EditRoleDialog
          role={editingRole}
          onUpdate={handleUpdateRole}
          onClose={() => setEditingRole(null)}
        />

        {/* Edit Member Dialog */}
        <EditMemberDialog
          member={editingMember}
          onUpdate={handleUpdateMember}
          onClose={() => setEditingMember(null)}
          roles={roles}
        />
      </div>
    </AdminDashboardLayout>
  )
}
