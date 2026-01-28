import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Team Settings",
  description: "Manage team members, roles, and permissions",
}

export default function TeamSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
