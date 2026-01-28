"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function Page() {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    // Don't redirect if user is on auth pages (including 2FA setup)
    if (pathname?.startsWith("/auth/")) {
      return
    }

    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === "admin" || user.role === "super_admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/dashboard")
      }
    } else {
      router.push("/auth/login")
    }
  }, [isAuthenticated, user, isLoading, router, pathname])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
