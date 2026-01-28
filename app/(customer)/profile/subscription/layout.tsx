import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Subscription",
  description: "Manage your subscription plan, billing, and payment methods",
}

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
