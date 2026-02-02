"use client"

import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CustomerDashboardLayout>{children}</CustomerDashboardLayout>
}
