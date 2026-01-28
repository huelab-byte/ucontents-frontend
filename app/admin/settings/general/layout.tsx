import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "General Settings",
  description: "Configure site branding, meta tags, company information, and general settings",
}

export default function GeneralSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
