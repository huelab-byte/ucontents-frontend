import type { Metadata } from "next"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"

export const metadata: Metadata = {
  title: "Audio to Video",
  description: "Generate videos automatically from voice or audio files",
}

export default function AudioToVideoPage() {
  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audio to Video</h1>
          <p className="text-muted-foreground mt-2">
            Generate videos automatically from voice or audio files.
          </p>
        </div>
      </div>
    </CustomerDashboardLayout>
  )
}
