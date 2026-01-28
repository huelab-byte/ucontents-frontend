import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Usage",
  description: "View your usage statistics, credits, and consumption across all features",
}

export default function UsageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
