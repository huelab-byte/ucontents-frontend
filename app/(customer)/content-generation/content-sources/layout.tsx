import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Content Sources",
  description: "Manage and organize your content sources for automated video generation",
}

export default function ContentSourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
