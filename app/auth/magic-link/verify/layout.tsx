import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Magic Link Verification",
  description: "Verify your magic link to sign in",
}

export default function MagicLinkVerifyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
