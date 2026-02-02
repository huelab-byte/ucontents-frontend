import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Data Removal Request",
  description: "Request deletion of your personal data from uContents - Exercise your data protection rights",
}

export default function DataRemovalRequestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
