"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { authService } from "@/lib/api"

interface EmailVerificationGuardProps {
  children: React.ReactNode
}

/**
 * Component to guard routes that require email verification
 * Redirects to email verification page if user is not verified
 */
export function EmailVerificationGuard({ children }: EmailVerificationGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = React.useState(true)

  React.useEffect(() => {
    const checkEmailVerification = async () => {
      // Wait for auth to load
      if (isLoading) {
        return
      }

      // If not authenticated, let other guards handle it
      if (!user) {
        setIsChecking(false)
        return
      }

      // Check if email verification is enabled
      try {
        const response = await authService.getAuthFeatures()
        
        const emailVerificationEnabled = response.success && response.data?.email_verification?.enabled
        
        // If email verification is enabled and user is not verified
        if (emailVerificationEnabled && !user.email_verified_at) {
          // Don't redirect if already on verification page
          if (pathname !== '/auth/email-verification-required' && pathname !== '/auth/verify-email') {
            router.push('/auth/email-verification-required')
            return
          }
        }
      } catch (error) {
        // On error, allow access (fail open)
      }

      setIsChecking(false)
    }

    checkEmailVerification()
  }, [user, isLoading, router, pathname])

  // Show loading while checking
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return <>{children}</>
}
