import type { Metadata } from "next"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"

export const metadata: Metadata = {
  title: "Text Contents",
  description: "Generate captions, scripts, and written content at scale",
}

export default function TextContentsPage() {
  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Text Contents</h1>
          <p className="text-muted-foreground mt-2">
            Generate captions, scripts, and written content at scale.
          </p>
        </div>
      </div>
    </CustomerDashboardLayout>
  )
}
