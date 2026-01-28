"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle01Icon, AlertCircleIcon, MailIcon, ArrowLeft01Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { authService } from "@/lib/api"
import { toast } from "@/lib/toast"

function VerifyEmailPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [isResending, setIsResending] = React.useState(false)

  // Get token and email from URL params
  React.useEffect(() => {
    const tokenParam = searchParams.get("token")
    const emailParam = searchParams.get("email")
    
    if (tokenParam) {
      setToken(tokenParam)
    }
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  // Auto-verify if token and email are present
  React.useEffect(() => {
    if (token && email && !isLoading && !success && !error) {
      handleVerify()
    }
  }, [token, email])

  const handleVerify = async () => {
    if (!token || !email) {
      setError("Verification token or email is missing. Please use the link from your email.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.verifyEmail(token, email)

      if (response.success && response.data) {
        const { user: backendUser, token: authToken } = response.data

        // Map backend user to frontend format
        let role: "customer" | "admin" | "super_admin" = "customer"
        const roleSlugs = backendUser.roles?.map((r: any) => r.slug.toLowerCase()) || []
        
        if (roleSlugs.includes("super_admin")) {
          role = "super_admin"
        } else if (roleSlugs.includes("admin")) {
          role = "admin"
        } else {
          role = "customer"
        }

        // Helper to normalize email_verified_at
        const normalizeEmailVerifiedAt = (value: any): string | null => {
          if (!value) return null
          if (value === '' || value === 'null' || value === null) return null
          if (typeof value === 'string' && value.length > 0) return value
          if (value instanceof Date) return value.toISOString()
          return null
        }

        const frontendUser = {
          id: String(backendUser.id),
          name: backendUser.name,
          email: backendUser.email,
          role,
          roles: roleSlugs,
          email_verified_at: normalizeEmailVerifiedAt(backendUser.email_verified_at), // Normalize verification status
        }

        // Store token and user data - ensure it's saved before redirect
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', authToken)
          localStorage.setItem('user', JSON.stringify(frontendUser))
          
          // Verify the data was saved
          const savedUser = JSON.parse(localStorage.getItem('user') || '{}')
        }

        setSuccess(true)
        toast.success("Email verified successfully!")
        
        // Redirect to dashboard after verification
        // Use a shorter timeout and ensure localStorage is persisted
        setTimeout(() => {
          const redirectUrl = role === "admin" || role === "super_admin" 
            ? "/admin/dashboard" 
            : "/dashboard"
          
          // Force full page reload to re-initialize auth context
          // This ensures the auth context loads the updated user data from localStorage
          window.location.href = redirectUrl
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification link. Please request a new one.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast.error("Email address is required")
      return
    }

    setIsResending(true)
    try {
      const response = await authService.resendVerificationEmail(email)
      if (response.success) {
        toast.success("Verification email sent! Please check your inbox.")
      } else {
        toast.error(response.message || "Failed to resend verification email")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                className="size-6 text-emerald-600"
              />
            </div>
            <CardTitle className="text-2xl font-bold">Email verified successfully</CardTitle>
            <CardDescription>
              Your email address has been verified. Redirecting to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={MailIcon} className="size-6 text-primary" />
            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          </div>
          <CardDescription>
            {token && email 
              ? "Please wait while we verify your email address..."
              : "Enter your email to receive a verification link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
              <div className="flex items-start gap-2">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-4 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{error}</p>
                  <p className="text-xs mt-1 text-destructive/80">
                    The verification link may have expired or already been used.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLoading && !error && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Verifying your email address...</p>
            </div>
          )}

          {!token && !isLoading && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No verification token found. Please use the link from your email or request a new verification email.
              </p>
              {email && (
                <Button
                  type="button"
                  variant="outline"
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
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link
            href="/auth/login"
            className="text-sm text-center text-primary hover:underline"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 inline mr-1" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailPageContent />
    </React.Suspense>
  )
}
