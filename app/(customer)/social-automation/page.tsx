import type { Metadata } from "next"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"

export const metadata: Metadata = {
  title: "Social Automation",
  description: "Create and manage automated workflows for social media scheduling, posting, and engagement across platforms",
}

export default function SocialAutomationPage() {
  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Social Automation</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage automated workflows for social media scheduling, posting, and engagement across platforms
          </p>
        </div>
      </div>
    </CustomerDashboardLayout>
  )
}
