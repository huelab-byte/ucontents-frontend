"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import { LockKeyIcon, EyeIcon, CheckmarkCircle01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { authService } from "@/lib/api"
import { PasswordComplexityIndicator, type PasswordRequirements } from "@/components/password-complexity-indicator"

function ResetPasswordPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = React.useState("")
  const [token, setToken] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})
  const [success, setSuccess] = React.useState(false)
  const [passwordRequirements, setPasswordRequirements] = React.useState<PasswordRequirements>({
    min_length: 8,
    require_uppercase: true,
    require_number: true,
    require_special: false,
  })

  // Get token and email from URL params and fetch password requirements
  React.useEffect(() => {
    const tokenParam = searchParams.get("token")
    const emailParam = searchParams.get("email")
    
    if (tokenParam) {
      setToken(tokenParam)
    }
    if (emailParam) {
      setEmail(emailParam)
    }

    // Fetch password requirements
    const fetchPasswordRequirements = async () => {
      try {
        const response = await authService.getAuthFeatures()
        if (response.success && response.data?.password) {
          setPasswordRequirements({
            min_length: response.data.password.min_length ?? 8,
            require_uppercase: response.data.password.require_uppercase ?? true,
            require_number: response.data.password.require_number ?? true,
            require_special: response.data.password.require_special ?? false,
          })
        }
      } catch (error) {
        console.error("Failed to fetch password requirements:", error)
      }
    }
    fetchPasswordRequirements()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setFieldErrors({ confirmPassword: "Passwords do not match" })
      return
    }

    // Validate password complexity
    const validationErrors: string[] = []
    if (password.length < passwordRequirements.min_length) {
      validationErrors.push(`Password must be at least ${passwordRequirements.min_length} characters long`)
    }
    if (passwordRequirements.require_uppercase && !/[A-Z]/.test(password)) {
      validationErrors.push("Password must contain at least one uppercase letter")
    }
    if (passwordRequirements.require_number && !/[0-9]/.test(password)) {
      validationErrors.push("Password must contain at least one number")
    }
    if (passwordRequirements.require_special && !/[^a-zA-Z0-9]/.test(password)) {
      validationErrors.push("Password must contain at least one special character")
    }

    if (validationErrors.length > 0) {
      setError(validationErrors[0])
      setFieldErrors({ password: validationErrors[0] })
      return
    }

    if (!token) {
      setError("Reset token is missing. Please use the link from your email.")
      return
    }

    if (!email) {
      setError("Email is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.resetPassword(
        token,
        email,
        password,
        confirmPassword
      )

      if (response.success) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login?password_reset=true")
        }, 3000)
      }
    } catch (err: any) {
      
      // Handle validation errors
      if (err.errors) {
        const mappedErrors: Record<string, string> = {}
        Object.keys(err.errors).forEach((key) => {
          if (key === "password_confirmation") {
            mappedErrors.confirmPassword = Array.isArray(err.errors[key]) 
              ? err.errors[key][0] 
              : err.errors[key]
          } else {
            mappedErrors[key] = Array.isArray(err.errors[key]) 
              ? err.errors[key][0] 
              : err.errors[key]
          }
        })
        setFieldErrors(mappedErrors)
        const firstErrorValue = Object.values(err.errors)[0]
        const firstError = Array.isArray(firstErrorValue) ? firstErrorValue[0] : firstErrorValue
        setError(firstError || err.message || "Failed to reset password. Please check your input.")
      } else {
        setError(err.message || "Failed to reset password. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    if (field === "password") setPassword(value)
    if (field === "confirmPassword") setConfirmPassword(value)
    if (field === "email") setEmail(value)
    if (field === "token") setToken(value)
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    // Clear general error
    if (error) {
      setError(null)
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
            <CardTitle className="text-2xl font-bold">Password reset successful</CardTitle>
            <CardDescription>
              Your password has been reset successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              You can now login with your new password. Redirecting to login page...
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href="/auth/login"
              className="w-full text-center text-primary hover:underline font-medium"
            >
              Go to login page
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
          <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && !Object.keys(fieldErrors).length && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!token && (
              <Field>
                <FieldLabel htmlFor="token">Reset Token</FieldLabel>
                <FieldContent>
                  <Input
                    id="token"
                    type="text"
                    placeholder="Enter reset token from email"
                    value={token}
                    onChange={(e) => handleChange("token", e.target.value)}
                    className={fieldErrors.token ? "border-destructive" : ""}
                    required
                    disabled={isLoading}
                  />
                  {fieldErrors.token && (
                    <p className="mt-1 text-sm text-destructive">{fieldErrors.token}</p>
                  )}
                </FieldContent>
              </Field>
            )}

            {!email && (
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <FieldContent>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={fieldErrors.email ? "border-destructive" : ""}
                    required
                    disabled={isLoading}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-sm text-destructive">{fieldErrors.email}</p>
                  )}
                </FieldContent>
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
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
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`pl-10 pr-10 ${fieldErrors.password ? "border-destructive" : ""}`}
                    required
                    minLength={8}
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
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-destructive">{fieldErrors.password}</p>
                )}
                <PasswordComplexityIndicator
                  password={password}
                  requirements={passwordRequirements}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <HugeiconsIcon
                    icon={LockKeyIcon}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className={`pl-10 pr-10 ${fieldErrors.confirmPassword || fieldErrors.password_confirmation ? "border-destructive" : ""}`}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
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
                {(fieldErrors.confirmPassword || fieldErrors.password_confirmation) && (
                  <p className="mt-1 text-sm text-destructive">
                    {fieldErrors.confirmPassword || fieldErrors.password_confirmation}
                  </p>
                )}
              </FieldContent>
            </Field>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Resetting password...
                </>
              ) : (
                "Reset password"
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

export default function ResetPasswordPage() {
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
      <ResetPasswordPageContent />
    </React.Suspense>
  )
}
