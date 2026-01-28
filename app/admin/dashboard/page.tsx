"use client"

import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import Link from "next/link"
import { usePermission } from "@/lib/hooks/use-permission"

export default function AdminDashboardPage() {
  const { hasPermission } = usePermission()

  // Permission check
  if (!hasPermission("view_dashboard")) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to view the dashboard.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, system settings, and monitor platform activity
          </p>
          <Link href="/admin/users">Users</Link>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
