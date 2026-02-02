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
import { MailIcon, LockKeyIcon, EyeIcon, UserIcon, AlertCircleIcon } from "@hugeicons/core-free-icons"
import { authService } from "@/lib/api"
import { toast } from "@/lib/toast"
import { PasswordComplexityIndicator, type PasswordRequirements } from "@/components/password-complexity-indicator"
import { generalSettingsService } from "@/lib/api/services/general-settings.service"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})
  const [socialAuthEnabled, setSocialAuthEnabled] = React.useState(false)
  const [enabledProviders, setEnabledProviders] = React.useState<string[]>([])
  const [passwordRequirements, setPasswordRequirements] = React.useState<PasswordRequirements>({
    min_length: 8,
    require_uppercase: true,
    require_number: true,
    require_special: false,
  })
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [termsUrl, setTermsUrl] = React.useState("/terms-of-service")
  const [privacyUrl, setPrivacyUrl] = React.useState("/privacy-policy")

  // Check if social auth is enabled, fetch password requirements, and get terms/privacy URLs
  React.useEffect(() => {
    const checkAuthFeatures = async () => {
      try {
        const response = await authService.getAuthFeatures()
        if (response.success && response.data) {
          // Set social auth
          if (response.data?.social_auth?.enabled) {
            setSocialAuthEnabled(true)
            // Get enabled providers from the features endpoint
            if (response.data?.social_auth?.providers && Array.isArray(response.data.social_auth.providers)) {
              setEnabledProviders(response.data.social_auth.providers)
            }
          }
          
          // Set password requirements
          if (response.data?.password) {
            setPasswordRequirements({
              min_length: response.data.password.min_length ?? 8,
              require_uppercase: response.data.password.require_uppercase ?? true,
              require_number: response.data.password.require_number ?? true,
              require_special: response.data.password.require_special ?? false,
            })
          }
        }
      } catch (error) {
        console.error("Failed to fetch auth settings on register page:", error)
      }
    }

    const fetchGeneralSettings = async () => {
      try {
        const response = await generalSettingsService.getPublicSettings()
        if (response.success && response.data) {
          if (response.data.terms_of_service_url) {
            setTermsUrl(response.data.terms_of_service_url)
          }
          if (response.data.privacy_policy_url) {
            setPrivacyUrl(response.data.privacy_policy_url)
          }
        }
      } catch (error) {
        console.error("Failed to fetch general settings (terms/privacy URLs):", error)
      }
    }

    checkAuthFeatures()
    fetchGeneralSettings()
  }, [])

  // Check for OAuth callback errors
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("error")) {
      // Handle OAuth error
      setError(decodeURIComponent(params.get("error") || "Authentication failed"))
      router.replace("/auth/register", { scroll: false })
    }
  }, [router])

  const handleSocialAuth = (provider: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    window.location.href = `${apiUrl}/v1/auth/social/${provider}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Client-side validation
    if (!formData.acceptTerms) {
      setError("You must accept the Terms of Service and Privacy Policy")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setFieldErrors({ confirmPassword: "Passwords do not match" })
      return
    }

    // Validate password complexity
    const validationErrors: string[] = []
    if (formData.password.length < passwordRequirements.min_length) {
      validationErrors.push(`Password must be at least ${passwordRequirements.min_length} characters long`)
    }
    if (passwordRequirements.require_uppercase && !/[A-Z]/.test(formData.password)) {
      validationErrors.push("Password must contain at least one uppercase letter")
    }
    if (passwordRequirements.require_number && !/[0-9]/.test(formData.password)) {
      validationErrors.push("Password must contain at least one number")
    }
    if (passwordRequirements.require_special && !/[^a-zA-Z0-9]/.test(formData.password)) {
      validationErrors.push("Password must contain at least one special character")
    }

    if (validationErrors.length > 0) {
      setError(validationErrors[0])
      setFieldErrors({ password: validationErrors[0] })
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      })

      if (response.success) {
        // Check if email verification is enabled
        // The backend should have sent the verification email if enabled
        // We'll always redirect to verification page if email verification might be enabled
        // The backend RegisterAction handles sending the email
        try {
          const featuresResponse = await authService.getAuthFeatures()
          
          const emailVerificationEnabled = featuresResponse.success && featuresResponse.data?.email_verification?.enabled
          
          if (emailVerificationEnabled) {
            // Redirect to email verification required page
            // Store email in sessionStorage so the verification page can use it
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('pendingVerificationEmail', formData.email)
            }
            toast.success("Registration successful! Please check your email to verify your account.")
            router.push("/auth/email-verification-required")
          } else {
            // Email verification not enabled - redirect to login
            router.push("/auth/login?registered=true")
          }
        } catch (error) {
          // On error, default to login page
          router.push("/auth/login?registered=true")
        }
      }
    } catch (err: any) {
      // Handle validation errors
      if (err.errors) {
        // Map backend field names to frontend field names
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
        setError(firstError || err.message || "Registration failed. Please check your input.")
      } else {
        setError(err.message || "Registration failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && !Object.keys(fieldErrors).length && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <FieldContent>
                <div className="relative w-full">
                  <HugeiconsIcon
                    icon={UserIcon}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`pl-10 ${fieldErrors.name ? "border-destructive" : ""}`}
                    required
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-destructive">{fieldErrors.name}</p>
                )}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <FieldContent>
                <div className="relative w-full">
                  <HugeiconsIcon
                    icon={MailIcon}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`pl-10 ${fieldErrors.email ? "border-destructive" : ""}`}
                    required
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-destructive">{fieldErrors.email}</p>
                )}
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <FieldContent>
                <div className="relative w-full">
                  <HugeiconsIcon
                    icon={LockKeyIcon}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
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
                  password={formData.password}
                  requirements={passwordRequirements}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <FieldContent>
                <div className="relative w-full">
                  <HugeiconsIcon
                    icon={LockKeyIcon}
                    strokeWidth={1.5}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                  />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
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

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={formData.acceptTerms}
                onChange={(e) => handleChange("acceptTerms", e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded border-input accent-primary"
                required
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link href={termsUrl} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href={privacyUrl} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

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
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
          <div className="text-xs text-center text-muted-foreground">
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            {" · "}
            <Link href="/terms-of-service" className="hover:underline">Terms of Service</Link>
            {" · "}
            <Link href="/data-removal-request" className="hover:underline">Data Removal</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
