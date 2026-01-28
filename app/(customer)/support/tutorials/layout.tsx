import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tutorials",
  description: "Learn how to use uContents with step-by-step tutorials and guides",
}

export default function TutorialsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
