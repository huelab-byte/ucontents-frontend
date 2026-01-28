"use client"

import * as React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface UserWithUploadCount {
  user_id: number
  user: {
    id: number
    name: string
    email: string
  } | null
  upload_count: number
}

interface UserFilterProps {
  users: UserWithUploadCount[]
  selectedUserId: number | null
  onUserChange: (userId: number | null) => void
  placeholder?: string
  className?: string
}

export function UserFilter({
  users,
  selectedUserId,
  onUserChange,
  placeholder = "All Users",
  className,
}: UserFilterProps) {
  const handleValueChange = (value: string | null) => {
    if (value === null || value === "all") {
      onUserChange(null)
    } else {
      const userId = Number(value)
      if (Number.isFinite(userId)) {
        onUserChange(userId)
      }
    }
  }

  return (
    <Select
      value={selectedUserId === null ? "all" : String(selectedUserId)}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Users</SelectItem>
        {users.map((item) => (
          <SelectItem key={item.user_id} value={String(item.user_id)}>
            {item.user ? (
              <span>
                {item.user.name} ({item.upload_count} {item.upload_count === 1 ? "file" : "files"})
              </span>
            ) : (
              <span>User #{item.user_id} ({item.upload_count} {item.upload_count === 1 ? "file" : "files"})</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
