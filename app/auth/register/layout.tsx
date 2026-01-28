import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new uContents account to start managing your social media content and automation",
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
