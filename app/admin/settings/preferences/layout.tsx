import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Preferences",
  description: "Configure system preferences and default settings",
}

export default function PreferencesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
