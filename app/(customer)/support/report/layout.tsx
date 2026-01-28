import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Report Issue",
  description: "Report bugs, issues, or provide feedback to help improve the platform",
}

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
