import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "System Logs",
  description: "View and monitor system logs, events, and activity",
}

export default function LogsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
