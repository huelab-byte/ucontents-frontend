import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Image Overlay",
  description: "Manage image overlay assets for content generation",
}

export default function ImageOverlayLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
