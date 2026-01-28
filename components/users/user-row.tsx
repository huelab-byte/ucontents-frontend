"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalCircle01Icon,
  EditIcon,
  DeleteIcon,
  UserIcon,
  MailIcon,
  ClockIcon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons"
import type { User } from "@/components/users/types"

interface UserRowProps {
  user: User
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  statusColors: Record<string, { className: string; icon: any }>
  getRoleColor: (roleName: string) => string
  formatDate: (dateString: string) => string
}

export function UserRow({
  user,
  onEdit,
  onDelete,
  statusColors,
  getRoleColor,
  formatDate,
}: UserRowProps) {
  const statusConfig = statusColors[user.status] || statusColors.Active
  const StatusIcon = statusConfig.icon

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
            <HugeiconsIcon icon={UserIcon} className="size-5 text-primary" />
          </div>
          <div>
            <div className="font-medium flex items-center gap-2">
              {user.name}
              {user.isSystem && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
                  <HugeiconsIcon icon={ShieldKeyIcon} className="size-3 mr-1" />
                  System
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <HugeiconsIcon icon={MailIcon} className="size-3" />
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={getRoleColor(user.role)}>
          {user.role}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={statusConfig.className}>
          <HugeiconsIcon icon={StatusIcon} className="size-3 mr-1" />
          {user.status}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HugeiconsIcon icon={ClockIcon} className="size-4" />
          <span>{formatDate(user.createdAt)}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        {user.lastLogin ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HugeiconsIcon icon={ClockIcon} className="size-4" />
            <span>{formatDate(user.lastLogin)}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Never</span>
        )}
      </td>
      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
          >
            <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
            <span className="sr-only">Options</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <HugeiconsIcon icon={EditIcon} className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {!user.isSystem && (
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                className="text-destructive focus:text-destructive"
              >
                <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}
