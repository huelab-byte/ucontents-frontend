import type { Metadata } from "next"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"

export const metadata: Metadata = {
  title: "Image Contents",
  description: "Create, manage, and automate image-based content",
}

export default function ImageContentsPage() {
  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Image Contents</h1>
          <p className="text-muted-foreground mt-2">
            Create, manage, and automate image-based content.
          </p>
        </div>
      </div>
    </CustomerDashboardLayout>
  )
}
