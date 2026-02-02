"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import { MailIcon, LockKeyIcon, EyeIcon, Link01Icon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/lib/auth-context"
import { authService } from "@/lib/api/services/auth.service"
import { toast } from "@/lib/toast"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [rememberMe, setRememberMe] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [magicLinkEnabled, setMagicLinkEnabled] = React.useState(false)
  const [passwordResetEnabled, setPasswordResetEnabled] = React.useState(false)
  const [socialAuthEnabled, setSocialAuthEnabled] = React.useState(false)
  const [enabledProviders, setEnabledProviders] = React.useState<string[]>([])
  const [isRequestingMagicLink, setIsRequestingMagicLink] = React.useState(false)

  // Check if magic-link, password reset, and social auth are enabled (optional; login works without this)
  React.useEffect(() => {
    const checkAuthFeatures = async () => {
      try {
        const response = await authService.getAuthFeatures()
        if (response.success && response.data) {
          if (response.data?.magic_link?.enabled) {
            setMagicLinkEnabled(true)
          }
          if (response.data?.password_reset?.enabled) {
            setPasswordResetEnabled(true)
          }
          if (response.data?.social_auth?.enabled) {
            setSocialAuthEnabled(true)
            // Get enabled providers from the features endpoint
            if (response.data?.social_auth?.providers && Array.isArray(response.data.social_auth.providers)) {
              setEnabledProviders(response.data.social_auth.providers)
            }
          }
        }
      } catch (err) {
        // Auth features are optional; log a readable message (API error may be { success, message })
        const msg =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
              ? String((err as { message: unknown }).message)
              : String(err)
        if (msg && msg !== "{}") {
          console.error("Failed to check auth features:", msg)
        }
      }
    }
    checkAuthFeatures()
  }, [])

  // Check for registration, password reset (social auth is now handled in dashboard)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    
    if (params.get("registered") === "true") {
      setSuccessMessage("Registration successful! Please login with your credentials.")
      // Clear the query parameter
      router.replace("/auth/login", { scroll: false })
    } else if (params.get("password_reset") === "true") {
      setSuccessMessage("Password reset successful! Please login with your new password.")
      // Clear the query parameter
      router.replace("/auth/login", { scroll: false })
    } else if (params.get("error")) {
      // Handle OAuth error
      setError(decodeURIComponent(params.get("error") || "Authentication failed"))
      router.replace("/auth/login", { scroll: false })
    }
  }, [router])

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      // Redirect is handled in auth context based on role
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLinkRequest = async () => {
    if (!email) {
      setError("Please enter your email address first")
      return
    }

    setError("")
    setIsRequestingMagicLink(true)

    try {
      const response = await authService.requestMagicLink(email)
      if (response.success) {
        toast.success("Magic link sent!", "Check your email for the login link")
        setSuccessMessage("Magic link sent to your email. Please check your inbox and click the link to sign in.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to send magic link. Please try again.")
    } finally {
      setIsRequestingMagicLink(false)
    }
  }

  const handleSocialAuth = (provider: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    window.location.href = `${apiUrl}/v1/auth/social/${provider}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <div className="mb-4 p-3 rounded-md bg-emerald-500/10 text-emerald-600 text-sm border border-emerald-500/20">
              {successMessage}
            </div>
          )}
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
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <HugeiconsIcon
                    icon={LockKeyIcon}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <span className="text-xs font-medium">Hide</span>
                    ) : (
                      <HugeiconsIcon
                        icon={EyeIcon}
                        strokeWidth={1.5}
                        className="size-4"
                      />
                    )}
                  </button>
                </div>
              </FieldContent>
            </Field>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-primary"
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
              </div>
              {passwordResetEnabled && (
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {magicLinkEnabled && (
            <>
              <div className="relative my-4">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    OR
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleMagicLinkRequest}
                disabled={isRequestingMagicLink || isLoading}
              >
                <HugeiconsIcon icon={Link01Icon} className="size-4 mr-2" />
                {isRequestingMagicLink ? "Sending..." : "Sign in with Magic Link"}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Enter your email above and click to receive a passwordless login link
              </p>
            </>
          )}

          {socialAuthEnabled && enabledProviders.length > 0 && (
            <>
              <div className="relative my-6">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-background px-2 text-xs text-muted-foreground">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {enabledProviders.includes("google") && (
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="flex-1 min-w-[120px]" 
                    disabled={isLoading}
                    onClick={() => handleSocialAuth("google")}
                  >
                    <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </Button>
                )}
                {enabledProviders.includes("facebook") && (
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="flex-1 min-w-[120px]" 
                    disabled={isLoading}
                    onClick={() => handleSocialAuth("facebook")}
                  >
                    <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                    </svg>
                    Facebook
                  </Button>
                )}
                {enabledProviders.includes("tiktok") && (
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="flex-1 min-w-[120px]" 
                    disabled={isLoading}
                    onClick={() => handleSocialAuth("tiktok")}
                  >
                    <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" fill="#000000"/>
                    </svg>
                    TikTok
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
