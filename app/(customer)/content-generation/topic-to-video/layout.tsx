import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Topic to Video",
  description: "Transform topics into engaging video content with AI-powered generation",
}

export default function TopicToVideoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
