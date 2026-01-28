"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { MailIcon, RefreshIcon, ArrowLeft01Icon, AlertCircleIcon } from "@hugeicons/core-free-icons"
import { authService, profileService } from "@/lib/api"
import { toast } from "@/lib/toast"
import { useAuth } from "@/lib/auth-context"
import { userService } from "@/lib/api"

export default function EmailVerificationRequiredPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [isResending, setIsResending] = React.useState(false)
  const [emailSent, setEmailSent] = React.useState(false)

  // Get email from user context or sessionStorage (for newly registered users)
  const userEmail = React.useMemo(() => {
    if (user?.email) {
      return user.email
    }
    // Check sessionStorage for pending verification email (from registration)
    if (typeof window !== 'undefined') {
      const pendingEmail = sessionStorage.getItem('pendingVerificationEmail')
      if (pendingEmail) {
        return pendingEmail
      }
    }
    return ""
  }, [user])

  // Check if user is already verified and redirect
  React.useEffect(() => {
    if (isLoading) return

    // If user is logged in, check verification status
    if (user) {
      // Helper to check if email is verified
      const isEmailVerified = (value: any): boolean => {
        if (!value) return false
        if (value === '' || value === 'null' || value === null) return false
        if (typeof value === 'string' && value.length > 0) return true
        return false
      }

      // First check local state (faster)
      const isVerifiedLocally = isEmailVerified(user?.email_verified_at)
      
      if (isVerifiedLocally) {
        const redirectUrl = user.role === "admin" || user.role === "super_admin" 
          ? "/admin/dashboard" 
          : "/dashboard"
        window.location.href = redirectUrl
        return
      }

      // If not verified locally, sync with backend to ensure we have latest data
      const syncWithBackend = async () => {
        try {
          const response = await profileService.getProfile()
          if (response.success && response.data) {
            const backendUser = response.data
            const isVerifiedBackend = isEmailVerified(backendUser.email_verified_at)


            // Update localStorage with backend data
            const updatedUser = {
              ...user,
              email_verified_at: backendUser.email_verified_at,
            }
            localStorage.setItem('user', JSON.stringify(updatedUser))

            if (isVerifiedBackend) {
              const redirectUrl = user.role === "admin" || user.role === "super_admin" 
                ? "/admin/dashboard" 
                : "/dashboard"
              window.location.href = redirectUrl
            }
          }
        } catch (error) {
        }
      }

      // Sync with backend to get latest verification status
      syncWithBackend()
    }

    // If user is not logged in and we have email in sessionStorage, show the page for newly registered users
    // We can't check verification status without being logged in
  }, [user, isLoading, userEmail, router])

  const handleResend = async () => {
    if (!userEmail) {
      toast.error("Email address not found")
      return
    }

    setIsResending(true)
    try {
      const response = await authService.resendVerificationEmail(userEmail)
      if (response.success) {
        setEmailSent(true)
        toast.success("Verification email sent! Please check your inbox.")
      } else {
        // Check if the error is because email is already verified
        if (response.message?.toLowerCase().includes('already verified')) {
          toast.success("Your email is already verified! Redirecting to dashboard...")
          // Refresh user data and redirect
          if (user) {
            setTimeout(() => {
              const redirectUrl = user.role === "admin" || user.role === "super_admin" 
                ? "/admin/dashboard" 
                : "/dashboard"
              window.location.href = redirectUrl
            }, 1500)
          } else {
            router.push("/auth/login")
          }
        } else {
          toast.error(response.message || "Failed to resend verification email")
        }
      }
    } catch (err: any) {
      // Check if error is because email is already verified
      if (err.message?.toLowerCase().includes('already verified')) {
        toast.success("Your email is already verified! Redirecting to dashboard...")
        if (user) {
          setTimeout(() => {
            const redirectUrl = user.role === "admin" || user.role === "super_admin" 
              ? "/admin/dashboard" 
              : "/dashboard"
            window.location.href = redirectUrl
          }, 1500)
        } else {
          router.push("/auth/login")
        }
      } else {
        toast.error(err.message || "Failed to resend verification email. Please try again.")
      }
    } finally {
      setIsResending(false)
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('pendingVerificationEmail')
      window.location.href = '/auth/login'
    }
  }

  // Check if user is logged in or just registered
  const isLoggedIn = !!user

  // Show loading while checking verification status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-background">
        <div className="text-center">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Helper to check if email is verified
  const isEmailVerified = (value: any): boolean => {
    if (!value) return false
    if (value === '' || value === 'null' || value === null) return false
    if (typeof value === 'string' && value.length > 0) return true
    return false
  }

  // If user is verified, show a message and redirect (handled by useEffect)
  const isVerified = isEmailVerified(user?.email_verified_at)
  
  if (user && isVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Email already verified</CardTitle>
            <CardDescription>
              Redirecting to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-amber-500/10">
            <HugeiconsIcon
              icon={MailIcon}
              className="size-6 text-amber-600"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Email verification required</CardTitle>
          <CardDescription>
            {isLoggedIn 
              ? "Please verify your email address to access your dashboard"
              : "We've sent a verification email to your inbox. Please verify your email to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-md bg-muted border">
            <div className="flex items-start gap-3">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">
                  We've sent a verification email to:
                </p>
                <p className="text-sm font-mono text-muted-foreground break-all">
                  {userEmail || "your email address"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Click the verification link in the email to verify your account and access your dashboard.
                </p>
              </div>
            </div>
          </div>

          {emailSent && (
            <div className="p-3 rounded-md bg-emerald-500/10 text-emerald-600 text-sm border border-emerald-500/20">
              Verification email sent! Please check your inbox and spam folder.
            </div>
          )}

          <div className="space-y-2">
            <Button
              type="button"
              className="w-full"
              onClick={handleResend}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={RefreshIcon} className="size-4 mr-2" />
                  Resend verification email
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-2" />
              {isLoggedIn ? "Logout" : "Back to login"}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
