import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Email Settings",
  description: "Configure email providers and notification settings",
}

export default function EmailSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
