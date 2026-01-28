import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your uContents account to manage your social media content and automation",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
