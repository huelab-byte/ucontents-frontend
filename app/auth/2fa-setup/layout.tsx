import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Two-Factor Authentication Setup",
  description: "Set up two-factor authentication to secure your account",
}

export default function TwoFactorSetupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
