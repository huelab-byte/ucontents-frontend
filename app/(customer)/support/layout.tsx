import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Support",
  description: "Get help, submit tickets, and access support resources",
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
