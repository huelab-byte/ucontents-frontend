import type { Metadata } from "next"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"

export const metadata: Metadata = {
  title: "Content Playground",
  description: "Experiment with AI models, test prompts, and refine content generation strategies before production use",
}

export default function PlaygroundPage() {
  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Content Playground</h1>
          <p className="text-muted-foreground mt-2">
            Experiment with AI models, test prompts, and refine content generation strategies before production use
          </p>
        </div>
      </div>
    </CustomerDashboardLayout>
  )
}
