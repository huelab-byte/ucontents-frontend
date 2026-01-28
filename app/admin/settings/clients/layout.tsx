import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Client Settings",
  description: "Manage OAuth clients and API credentials",
}

export default function ClientSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
