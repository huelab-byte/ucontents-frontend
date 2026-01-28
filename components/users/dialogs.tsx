"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
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
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, UserIcon, MailIcon } from "@hugeicons/core-free-icons"
import type { User } from "@/components/users/types"

export interface RoleOption {
  id: number
  name: string
  slug: string
}

export function AddUserDialog({
  onAdd,
  roles = [],
}: {
  onAdd: (user: Omit<User, "id" | "createdAt">) => void
  roles?: RoleOption[]
}) {
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    role: "",
    status: "Active" as User["status"],
    isSystem: false,
  })

  // Update default role when roles are loaded
  React.useEffect(() => {
    if (roles.length > 0 && !formData.role) {
      setFormData(prev => ({ ...prev, role: roles[0].name }))
    }
  }, [roles, formData.role])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    setFormData({
      name: "",
      email: "",
      role: roles.length > 0 ? roles[0].name : "",
      status: "Active",
      isSystem: false,
    })
    setOpen(false)
  }

  const handleCancel = () => {
    setFormData({
      name: "",
      email: "",
      role: roles.length > 0 ? roles[0].name : "",
      status: "Active",
      isSystem: false,
    })
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
            Add User
          </Button>
        }
      >
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
        Add User
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Add New User</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Name</Label>
              </FieldLabel>
              <FieldContent>
                <div className="relative w-full">
                  <HugeiconsIcon
                    icon={UserIcon}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Email</Label>
              </FieldLabel>
              <FieldContent>
                <div className="relative w-full">
                  <HugeiconsIcon
                    icon={MailIcon}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Role</Label>
              </FieldLabel>
              <FieldContent>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Status</Label>
              </FieldLabel>
              <FieldContent>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as User["status"] })}
                  required
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </FieldContent>
            </Field>
          </FieldGroup>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit">Add User</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function EditUserDialog({
  user,
  onUpdate,
  onClose,
  roles = [],
}: {
  user: User | null
  onUpdate: (id: number | string, user: Partial<User>) => void
  onClose: () => void
  roles?: RoleOption[]
}) {
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    role: "",
    status: "Active" as User["status"],
  })

  // Update form data when user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      })
      setOpen(true)
    }
  }, [user])

  // Also update role when roles array is loaded (in case it loads after user)
  React.useEffect(() => {
    if (user && roles.length > 0 && !formData.role) {
      // If role wasn't set but now roles are available, check if user's role exists
      const userRole = roles.find(r => r.name === user.role)
      if (userRole) {
        setFormData(prev => ({ ...prev, role: userRole.name }))
      }
    }
  }, [roles, user, formData.role])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      onUpdate(user.id, formData)
      setOpen(false)
      onClose()
    }
  }

  const handleCancel = () => {
    setOpen(false)
    onClose()
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      onClose()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit User</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Name</Label>
              </FieldLabel>
              <FieldContent>
                <div className="relative w-full">
                  <HugeiconsIcon
                    icon={UserIcon}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Email</Label>
              </FieldLabel>
              <FieldContent>
                <div className="relative w-full">
                  <HugeiconsIcon
                    icon={MailIcon}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Role</Label>
              </FieldLabel>
              <FieldContent>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Status</Label>
              </FieldLabel>
              <FieldContent>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as User["status"] })}
                  required
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-sm transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </FieldContent>
            </Field>
          </FieldGroup>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit">Update User</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function DeleteUserDialog({
  user,
  onDelete,
  onClose,
}: {
  user: User | null
  onDelete: (id: number | string) => void
  onClose: () => void
}) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      setOpen(true)
    }
  }, [user])

  const handleDelete = () => {
    if (user) {
      onDelete(user.id)
      setOpen(false)
      onClose()
    }
  }

  const handleCancel = () => {
    setOpen(false)
    onClose()
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{user?.name}</strong>? This action cannot be undone.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
