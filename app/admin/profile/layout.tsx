import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Profile",
  description: "Manage your admin profile settings and preferences",
}

export default function AdminProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
