import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Footage Library",
  description: "Manage video footage, audio files, and media assets for content generation",
}

export default function FootageLibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
