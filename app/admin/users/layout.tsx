import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Users",
  description: "Manage users, roles, and permissions across the platform",
}

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
