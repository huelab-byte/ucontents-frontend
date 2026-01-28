import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Social Authentication",
  description: "Completing social authentication",
}

export default function SocialCallbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
