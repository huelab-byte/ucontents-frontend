import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Two-Factor Authentication",
  description: "Manage two-factor authentication settings for enhanced account security",
}

export default function TwoFactorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
