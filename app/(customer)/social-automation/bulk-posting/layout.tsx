import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bulk Posting",
  description: "Schedule and manage multiple social media posts in bulk",
}

export default function BulkPostingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
