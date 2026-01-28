"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { twoFactorService } from "@/lib/api"

interface TwoFactorGuardProps {
  children: React.ReactNode
}

/**
 * Route guard that redirects users to 2FA setup if it's required but not enabled
 */
export function TwoFactorGuard({ children }: TwoFactorGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [checking, setChecking] = React.useState(true)

  React.useEffect(() => {
    const check2FA = async () => {
      // Skip check if not authenticated or on auth pages
      if (!isAuthenticated || isLoading || !user) {
        setChecking(false)
        return
      }

      // Skip check on 2FA setup page, OTP page, login page, and settings pages
      // Also skip if user is currently on 2FA setup page (they might be in the process of enabling it)
      if (
        pathname?.startsWith("/auth/") ||
        pathname?.startsWith("/settings/security/2fa") ||
        pathname === "/auth/2fa-setup"
      ) {
        setChecking(false)
        return
      }

      // Skip check if 2FA was just enabled (user needs to login again)
      // This prevents redirect loop after enabling 2FA
      const justEnabled2FA = sessionStorage.getItem("2fa_just_enabled")
      if (justEnabled2FA === "true") {
        // Clear the flag after a short delay to allow login to complete
        setTimeout(() => {
          sessionStorage.removeItem("2fa_just_enabled")
        }, 2000)
        setChecking(false)
        return
      }

      try {
        const response = await twoFactorService.getStatus()
        if (response.success && response.data) {
          const { required, enabled } = response.data

          // If 2FA is required but not enabled, redirect to public setup page
          if (required && !enabled) {
            // Get email from user or localStorage
            const userEmail = user?.email || localStorage.getItem("pending_2fa_setup_email") || ""
            if (userEmail) {
              router.push(`/auth/2fa-setup?email=${encodeURIComponent(userEmail)}`)
            } else {
              router.push("/auth/2fa-setup")
            }
            return
          }
        }
      } catch (error) {
        // On error, allow access (fail open)
      } finally {
        setChecking(false)
      }
    }

    check2FA()
  }, [isAuthenticated, isLoading, user, pathname, router])

  if (checking || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}
