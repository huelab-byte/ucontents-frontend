import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Email Verification Required",
  description: "Please verify your email address to continue",
}

export default function EmailVerificationRequiredLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
