"use client"

import { RouteGuard } from "@/lib/route-guard"
import { UserRole } from "@/lib/auth-context"
import { NotificationsProvider } from "@/lib/notifications-context"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RouteGuard allowedRoles={["customer"]}>
      <NotificationsProvider>
        {children}
      </NotificationsProvider>
    </RouteGuard>
  )
}
