import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BGM Library",
  description: "Manage background music assets for content generation",
}

export default function BgmLibraryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
