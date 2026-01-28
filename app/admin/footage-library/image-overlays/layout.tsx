import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Image Overlays",
  description: "Manage image overlays and graphics for video content",
}

export default function ImageOverlaysLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
