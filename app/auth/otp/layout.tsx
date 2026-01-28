import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "OTP Verification",
  description: "Enter your one-time password to verify your identity",
}

export default function OTPLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
