import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manual Posting",
  description: "Create and schedule individual social media posts manually",
}

export default function ManualPostingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
