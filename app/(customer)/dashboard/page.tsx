import type { Metadata } from "next"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your social media automation, content generation, and performance metrics",
}

export default function CustomerDashboardPage() {
  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your social media automation, content generation, and performance metrics
          </p>
        </div>
      </div>
    </CustomerDashboardLayout>
  )
}
