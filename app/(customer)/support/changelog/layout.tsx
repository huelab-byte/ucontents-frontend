import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Changelog",
  description: "View recent updates, new features, and improvements to the platform",
}

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
