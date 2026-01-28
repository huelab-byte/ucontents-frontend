import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Prompt Templates",
  description: "Create and manage reusable prompt templates for content generation",
}

export default function PromptTemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
