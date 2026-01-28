"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/components/users/types"
import { UserRow } from "./user-row"
import { Pagination } from "./pagination"

interface UserTableProps {
  users: User[]
  currentPage: number
  itemsPerPage: number
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onPageChange: (page: number) => void
  statusColors: Record<string, { className: string; icon: any }>
  getRoleColor: (roleName: string) => string
  formatDate: (dateString: string) => string
}

export function UserTable({
  users,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
  onPageChange,
  statusColors,
  getRoleColor,
  formatDate,
}: UserTableProps) {
  const totalPages = Math.ceil(users.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = users.slice(startIndex, endIndex)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
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
              {currentUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={onEdit}
                  onDelete={onDelete}
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
            totalItems={users.length}
            itemsPerPage={itemsPerPage}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={onPageChange}
          />
        )}
      </CardContent>
    </Card>
  )
}
