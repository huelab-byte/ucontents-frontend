import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Storage Settings",
  description: "Configure storage drivers, manage storage settings, and monitor storage usage",
}

export default function StorageSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
