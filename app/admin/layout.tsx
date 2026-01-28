"use client"

import { RouteGuard } from "@/lib/route-guard"
import { UserRole } from "@/lib/auth-context"
import { NotificationsProvider } from "@/lib/notifications-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard allowedRoles={["admin", "super_admin"]}>
      <NotificationsProvider>
        {children}
      </NotificationsProvider>
    </RouteGuard>
  )
}
