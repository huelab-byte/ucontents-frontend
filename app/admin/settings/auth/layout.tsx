import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication Settings",
  description: "Configure authentication methods, OAuth providers, and security settings",
}

export default function AuthSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
