import type { Metadata } from "next"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { DashboardContent } from "./dashboard-content"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your social media automation, content generation, and performance metrics",
}

export default function CustomerDashboardPage() {
  return (
    <CustomerDashboardLayout>
      <DashboardContent />
    </CustomerDashboardLayout>
  )
}
