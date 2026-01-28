"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import { MailIcon, ArrowLeft01Icon, CheckmarkCircle01Icon, AlertCircleIcon } from "@hugeicons/core-free-icons"
import { authService } from "@/lib/api"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [tokenExpiry, setTokenExpiry] = React.useState(60) // Default to 60 minutes
  const [passwordResetEnabled, setPasswordResetEnabled] = React.useState<boolean | null>(null) // null = checking
  const [isCheckingConfig, setIsCheckingConfig] = React.useState(true)

  // Fetch password reset configuration
  React.useEffect(() => {
    const fetchPasswordResetConfig = async () => {
      try {
        const response = await authService.getAuthFeatures()
        if (response.success && response.data) {
          if (response.data?.password_reset?.enabled !== undefined) {
            setPasswordResetEnabled(response.data.password_reset.enabled)
          }
          if (response.data?.password_reset?.token_expiry) {
            setTokenExpiry(response.data.password_reset.token_expiry)
          }
        }
      } catch (error) {
        // On error, assume enabled to allow user to try
        setPasswordResetEnabled(true)
      } finally {
        setIsCheckingConfig(false)
      }
    }
    fetchPasswordResetConfig()
  }, [])

  // Redirect to login if password reset is disabled
  React.useEffect(() => {
    if (passwordResetEnabled === false) {
      router.push('/auth/login')
    }
  }, [passwordResetEnabled, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await authService.requestPasswordReset(email)
      
      if (response.success) {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to send password reset link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking configuration
  if (isCheckingConfig || passwordResetEnabled === null) {
    return (
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
    )
  }

  // Don't render if password reset is disabled (redirect will happen)
  if (passwordResetEnabled === false) {
    return null
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
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We've sent a password reset link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Please check your email inbox and click on the reset link to create a new password.
              The link will expire in {tokenExpiry} {tokenExpiry === 1 ? 'minute' : 'minutes'}.
            </p>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Didn't receive the email? Check your spam folder or
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSuccess(false)
                  setEmail("")
                }}
              >
                Try again with a different email
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Link
              href="/auth/login"
              className="text-sm text-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 inline mr-1" />
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <HugeiconsIcon
                    icon={MailIcon}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError(null)
                    }}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </FieldContent>
            </Field>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
