import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Background Music Library",
  description: "Manage background music tracks and audio assets",
}

export default function BGMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
