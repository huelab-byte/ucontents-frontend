import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for uContents - Read our terms and conditions for using our social media management platform",
}

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
