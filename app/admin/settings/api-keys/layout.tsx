import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "API Keys",
  description: "Manage API keys and integrations for AI services",
}

export default function APIKeysLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
