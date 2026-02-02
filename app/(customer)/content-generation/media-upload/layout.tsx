import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Media Upload",
  description: "Manage and organize your media uploads for automated video generation",
}

export default function ContentSourcesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
