import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Video Overlay",
  description: "Manage video overlay assets for content generation",
}

export default function VideoOverlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
