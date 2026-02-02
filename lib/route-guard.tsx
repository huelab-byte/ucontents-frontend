"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth, UserRole } from "./auth-context"
import { twoFactorService } from "@/lib/api"

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function RouteGuard({ 
  children, 
  allowedRoles, 
  redirectTo 
}: RouteGuardProps) {
  const { user, isLoading, isAuthenticated, getAuthFeatures } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isCheckingEmailVerification, setIsCheckingEmailVerification] = React.useState(true)
  const [isChecking2FA, setIsChecking2FA] = React.useState(true)
  const [twoFARequired, setTwoFARequired] = React.useState(false)

  React.useEffect(() => {
    if (isLoading) return

    // Skip all checks on auth pages (including 2FA setup)
    if (pathname?.startsWith("/auth/")) {
      setIsCheckingEmailVerification(false)
      setIsChecking2FA(false)
      return
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push(redirectTo || "/auth/login")
      return
    }

    // 2FA middleware is disabled - no blocking checks

    // Check email verification if user is authenticated
    if (user && isAuthenticated) {
      const checkEmailVerification = async () => {
        try {
          const features = await getAuthFeatures()
          const emailVerificationEnabled = features?.email_verification?.enabled ?? false
          
          // If email verification is enabled, check if user is verified
          if (emailVerificationEnabled) {
            // Helper to check if email is verified
            const isEmailVerified = (value: any): boolean => {
              if (!value) return false
              if (value === '' || value === 'null' || value === null) return false
              if (typeof value === 'string' && value.length > 0) return true
              return false
            }

            // Check if user is verified using normalized check
            const isVerified = isEmailVerified(user.email_verified_at)
            
            
            if (!isVerified) {
              // Don't redirect if already on verification pages
              if (
                pathname !== '/auth/email-verification-required' && 
                pathname !== '/auth/verify-email' &&
                pathname !== '/auth/login' &&
                pathname !== '/auth/register'
              ) {
                router.push('/auth/email-verification-required')
                return
              }
            } else {
              // User is verified - if they're on the verification required page, redirect to dashboard
              if (pathname === '/auth/email-verification-required') {
                const redirectUrl = user.role === "admin" || user.role === "super_admin" 
                  ? "/admin/dashboard" 
                  : "/dashboard"
                router.push(redirectUrl)
                return
              }
            }
          }
        } catch (error: any) {
          // On error, allow access (fail open) - don't block user if API is unavailable
          // This prevents the app from breaking if backend is down
        } finally {
          setIsCheckingEmailVerification(false)
        }
      }

      checkEmailVerification()
    } else {
      setIsCheckingEmailVerification(false)
    }

    // 2FA middleware disabled - users can access without 2FA setup
    // 2FA verification is still enforced after login if user has 2FA enabled (handled in login flow)
    setIsChecking2FA(false)
    setTwoFARequired(false)

    // Check role-based access
    if (allowedRoles && user) {
      const hasAccess = allowedRoles.includes(user.role)
      if (!hasAccess) {
        // Redirect to appropriate dashboard based on role
        if (user.role === "admin" || user.role === "super_admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/dashboard")
        }
        return
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, redirectTo, pathname, getAuthFeatures])

  // Block access if 2FA is required but not enabled
  if (twoFARequired) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Redirecting to 2FA setup...</p>
        </div>
      </div>
    )
  }

  // Social Connection OAuth callback: /app/facebook/page, /app/youtube/channel, etc.
  // Render immediately when user has token so the callback can exchange code without waiting for full auth init.
  const isSocialConnectionCallback =
    typeof pathname === "string" &&
    pathname.startsWith("/app/") &&
    pathname.length > 5
  const hasToken =
    typeof window !== "undefined" && Boolean(localStorage.getItem("token"))
  if (
    isSocialConnectionCallback &&
    hasToken &&
    (isLoading || isCheckingEmailVerification || isChecking2FA)
  ) {
    return <>{children}</>
  }

  if (isLoading || isCheckingEmailVerification || isChecking2FA) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (isSocialConnectionCallback && hasToken) {
      return <>{children}</>
    }
    return null
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
