"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle01Icon, AlertCircleIcon, Link01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { authService } from "@/lib/api"

function MagicLinkVerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

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
    if (!token) {
      setError("Magic link token is missing. Please use the link from your email.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.verifyMagicLink(token)

      if (response.success && response.data) {
        const { user: backendUser, token: authToken } = response.data

        // Map backend user to frontend format (same as login function)
        let role: "customer" | "admin" | "super_admin" = "customer"
        const roleSlugs = backendUser.roles?.map((r: any) => r.slug.toLowerCase()) || []
        
        if (roleSlugs.includes("super_admin")) {
          role = "super_admin"
        } else if (roleSlugs.includes("admin")) {
          role = "admin"
        } else {
          role = "customer"
        }

        const frontendUser = {
          id: String(backendUser.id),
          name: backendUser.name,
          email: backendUser.email,
          role,
          roles: roleSlugs,
        }

        // Store token and user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', authToken)
          localStorage.setItem('user', JSON.stringify(frontendUser))
          // Mark that user logged in via magic link (skip 2FA)
          localStorage.setItem('auth_method', 'magic_link')
        }

        setSuccess(true)
        
        // Use window.location.href to force full page reload
        // This ensures the auth context re-initializes from localStorage
        setTimeout(() => {
          const redirectUrl = role === "admin" || role === "super_admin" 
            ? "/admin/dashboard" 
            : "/dashboard"
          
          // Force full page reload to re-initialize auth context
          window.location.href = redirectUrl
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || "Invalid or expired magic link. Please request a new one.")
    } finally {
      setIsLoading(false)
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
            <CardTitle className="text-2xl font-bold">Sign in successful</CardTitle>
            <CardDescription>
              You have been successfully signed in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Link01Icon} className="size-6 text-primary" />
            <CardTitle className="text-2xl font-bold">Verifying magic link</CardTitle>
          </div>
          <CardDescription>
            Please wait while we verify your magic link...
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
                    The magic link may have expired or already been used. Magic links expire after 15 minutes and can only be used once.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLoading && !error && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Verifying your magic link...</p>
            </div>
          )}

          {!token && !isLoading && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No magic link token found. Please use the link from your email.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/auth/login")}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-2" />
                Back to login
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link
            href="/auth/login"
            className="text-sm text-center text-primary hover:underline"
          >
            Back to login
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-center text-muted-foreground hover:underline"
          >
            Request a new magic link
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function MagicLinkVerifyPage() {
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
      <MagicLinkVerifyContent />
    </React.Suspense>
  )
}
