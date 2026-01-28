import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Video Overlays",
  description: "Manage video overlays and motion graphics for content",
}

export default function VideoOverlaysLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
