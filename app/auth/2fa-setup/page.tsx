"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ShieldIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Copy01Icon,
  EyeIcon,
} from "@hugeicons/core-free-icons"
import { twoFactorService, authService } from "@/lib/api"
import { toast } from "@/lib/toast"
import { useAuth } from "@/lib/auth-context"

type SetupStep = "setup" | "verifying" | "enabled"

function TwoFactorSetupPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [step, setStep] = React.useState<SetupStep>("setup")
  const [secret, setSecret] = React.useState<string>("")
  const secretRef = React.useRef<string>("") // Persist secret across re-renders
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>("")
  const [verificationCode, setVerificationCode] = React.useState("")
  const [backupCodes, setBackupCodes] = React.useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = React.useState(false)
  const [error, setError] = React.useState<string>("")
  const [email, setEmail] = React.useState<string>("")
  const [password, setPassword] = React.useState<string>("")
  const setupLoadedRef = React.useRef(false)
  const [isInitialized, setIsInitialized] = React.useState(false)
  const emailInitializedRef = React.useRef(false)
  
  // Get email from URL once using useMemo to prevent re-renders from searchParams changes
  const emailFromUrl = React.useMemo(() => {
    return searchParams.get("email") || ""
  }, [searchParams])

  // Initialize email and password once - use ref to prevent re-runs
  React.useEffect(() => {
    if (emailInitializedRef.current) return
    emailInitializedRef.current = true
    
    // Get email from URL params or localStorage
    const emailToUse = emailFromUrl || localStorage.getItem("pending_2fa_setup_email") || ""
    if (emailToUse && !email) {
      setEmail(emailToUse)
    }

    // Get password from localStorage if available
    const storedPassword = localStorage.getItem("pending_2fa_setup_password")
    if (storedPassword && !password) {
      setPassword(storedPassword)
    }
  }, [emailFromUrl, email, password])

  // Load setup data - only once, and only if we don't already have a secret
  React.useEffect(() => {
    // Don't reload if we're already on the "enabled" step
    if (step === "enabled") {
      setLoading(false)
      setIsInitialized(true)
      return
    }
    
    // Check state, ref, and sessionStorage for secret (persists across remounts)
    const storedSecret = sessionStorage.getItem("2fa_setup_secret")
    const storedQrUrl = sessionStorage.getItem("2fa_setup_qr_url")
    
    if (secret || secretRef.current || storedSecret) {
      // Restore from sessionStorage if state/ref were lost
      if (storedSecret && !secret) {
        setSecret(storedSecret)
        secretRef.current = storedSecret
      }
      if (storedQrUrl && !qrCodeUrl) {
        setQrCodeUrl(storedQrUrl)
      }
      setLoading(false)
      setIsInitialized(true)
      return
    }
    
    // Prevent multiple calls
    if (setupLoadedRef.current || isInitialized) {
      return
    }
    
    // Check if we have a token (required for setup endpoint)
    const token = localStorage.getItem("token")
    
    if (!token) {
      const errorMsg = "Authentication token is missing. Please login again."
      setError(errorMsg)
      setLoading(false)
      setupLoadedRef.current = true
      setIsInitialized(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
      return
    }

    const emailToUse = email || emailFromUrl || localStorage.getItem("pending_2fa_setup_email") || ""
    
    // Check if user logged in via social auth or magic link (2FA not required)
    const authMethod = localStorage.getItem("auth_method")
    if (authMethod === "social_auth" || authMethod === "magic_link") {
      setLoading(false)
      setupLoadedRef.current = true
      setIsInitialized(true)
      router.push("/dashboard")
      return
    }
    
    if (!emailToUse) {
      const errorMsg = "Email is required. Please login again."
      setError(errorMsg)
      setLoading(false)
      setupLoadedRef.current = true
      setIsInitialized(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
      return
    }

    setupLoadedRef.current = true
    loadSetup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount - don't include emailFromUrl to prevent re-runs

  const loadSetup = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Double-check token exists
      const token = localStorage.getItem("token")
      
      if (!token) {
        const errorMsg = "Authentication token is missing. Please login again."
        setError(errorMsg)
        setLoading(false)
        toast.error(errorMsg)
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
        return
      }
      
      const response = await twoFactorService.setup()
      
      if (response.success && response.data) {
        // Store in state, ref, and sessionStorage (for persistence across remounts)
        const newSecret = response.data.secret
        setSecret(newSecret)
        secretRef.current = newSecret
        sessionStorage.setItem("2fa_setup_secret", newSecret)
        sessionStorage.setItem("2fa_setup_qr_url", response.data.qr_code_url)
        setQrCodeUrl(response.data.qr_code_url)
        setIsInitialized(true)
        setLoading(false)
      } else {
        const errorMsg = response.message || "Failed to load 2FA setup. Please try logging in again."
        setError(errorMsg)
        toast.error(errorMsg)
        setLoading(false)
        // Redirect to login after showing error
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      }
    } catch (err: any) {
      console.error("Failed to load 2FA setup:", err)
      let errorMessage = "Failed to load 2FA setup. Please try logging in again."
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
      
      // If it's an auth error (401/403), redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      }
      setLoading(false)
    }
  }

  const handleEnable = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code")
      return
    }

    // Check if we have a token (user is authenticated)
    const token = localStorage.getItem("token")
    if (!token) {
      setError("Authentication token is missing. Please login again.")
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
      return
    }

    try {
      setSaving(true)
      setError("")
      
      // Enable 2FA - this only needs secret and code, uses auth token
      const response = await twoFactorService.enable(secret, verificationCode)
      
      if (response.success && response.data) {
        const codes = response.data.backup_codes || []
        
        
        if (codes.length === 0) {
          setError("Backup codes were not generated. Please try again or contact support.")
          return
        }
        
        setBackupCodes(codes)
        setStep("enabled")
        toast.success("2FA enabled successfully")
        
        
        // Clear setup data from sessionStorage since 2FA is now enabled
        sessionStorage.removeItem("2fa_setup_secret")
        sessionStorage.removeItem("2fa_setup_qr_url")
        
        // Set a flag to prevent redirect loop in TwoFactorGuard
        sessionStorage.setItem("2fa_just_enabled", "true")
        
        // Don't clear credentials yet - user needs to click continue
      } else {
        setError(response.message || "Failed to enable 2FA. Please try again.")
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Invalid verification code"
      setError(errorMsg)
      // Don't reset secret or step - keep the form visible so user can try again
    } finally {
      setSaving(false)
    }
  }

  const copyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Backup code copied to clipboard")
  }

  const copyAllBackupCodes = () => {
    const codesText = backupCodes.join("\n")
    navigator.clipboard.writeText(codesText)
    toast.success("All backup codes copied to clipboard")
  }

  if (loading && !secret && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading 2FA setup...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={ShieldIcon} className="size-6" />
            Set Up Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Two-factor authentication is required for your account. Please set it up to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
            </div>
          )}

          {step === "setup" && secret && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                  {qrCodeUrl && (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCodeUrl)}`}
                      alt="QR Code"
                      className="w-[180px] h-[180px]"
                    />
                  )}
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">Or enter this code manually:</p>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="px-3 py-2 bg-muted rounded-md font-mono text-sm">
                      {secret}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(secret)
                        toast.success("Secret copied to clipboard")
                      }}
                    >
                      <HugeiconsIcon icon={Copy01Icon} className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Field>
                <FieldLabel htmlFor="verification-code">Verification Code</FieldLabel>
                <FieldContent>
                  <Input
                    id="verification-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                      setVerificationCode(value)
                      setError("")
                    }}
                    className="text-center text-2xl font-mono tracking-widest"
                    disabled={saving}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </FieldContent>
              </Field>

              <Button
                onClick={handleEnable}
                disabled={verificationCode.length !== 6 || saving}
                className="w-full"
                size="lg"
              >
                {saving ? "Verifying..." : "Verify & Enable 2FA"}
              </Button>
            </div>
          )}

          {step === "enabled" && (
            <div className="space-y-6">
              <div className="text-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">2FA Enabled Successfully!</h3>
                <p className="text-sm text-muted-foreground">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
                </p>
              </div>

              {backupCodes.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Backup Codes</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBackupCodes(!showBackupCodes)}
                      >
                        {showBackupCodes ? (
                          <svg
                            className="size-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <HugeiconsIcon icon={EyeIcon} className="size-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={copyAllBackupCodes}>
                        <HugeiconsIcon icon={Copy01Icon} className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-background rounded"
                      >
                        <code className="font-mono text-sm">
                          {showBackupCodes ? code : "••••••••"}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyBackupCode(code)}
                          className="h-6 w-6 p-0"
                        >
                          <HugeiconsIcon icon={Copy01Icon} className="size-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Each backup code can only be used once. Store them securely.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100">
                        Backup Codes Not Available
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        Backup codes were not generated. You can view them later from the settings page, or contact support if needed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={async () => {
                  // Get email and password from state or localStorage before clearing
                  const emailToUse = email || localStorage.getItem("pending_2fa_setup_email") || ""
                  const passwordToUse = password || localStorage.getItem("pending_2fa_setup_password") || ""
                  
                  // Clear stored credentials and temporary token
                  localStorage.removeItem("pending_2fa_setup_email")
                  localStorage.removeItem("pending_2fa_setup_password")
                  localStorage.removeItem("token")
                  localStorage.removeItem("user")
                  
                  // Try to login again to get full access
                  // This will detect 2FA is enabled and redirect to OTP page
                  try {
                    if (emailToUse && passwordToUse) {
                      await login(emailToUse, passwordToUse)
                      // Login will handle redirect - should go to OTP page since 2FA is now enabled
                    } else {
                      // If credentials are missing, redirect to login
                      router.push("/auth/login?2fa_enabled=true")
                    }
                  } catch (err: any) {
                    // If auto-login fails, redirect to login
                    router.push("/auth/login?2fa_enabled=true")
                  }
                }}
                className="w-full"
                size="lg"
              >
                Continue to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function TwoFactorSetupPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading 2FA setup...</div>
      </div>
    }>
      <TwoFactorSetupPageContent />
    </Suspense>
  )
}
