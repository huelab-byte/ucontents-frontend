"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import { MailIcon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { twoFactorService } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

function OTPPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [otp, setOtp] = React.useState<string[]>(Array(6).fill(""))
  const [error, setError] = React.useState<string>("")
  const [isVerified, setIsVerified] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [email, setEmail] = React.useState<string>("")
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  React.useEffect(() => {
    // Get email from URL params or from auth context
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    } else if (user?.email) {
      setEmail(user.email)
    }
    inputRefs.current[0]?.focus()
  }, [searchParams, user])

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError("")

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.every((digit) => digit !== "") && newOtp.length === 6) {
      handleVerify(newOtp.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)
    setError("")

    const nextIndex = Math.min(pastedData.length, 5)
    inputRefs.current[nextIndex]?.focus()

    if (pastedData.length === 6) {
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (otpValue?: string) => {
    const code = otpValue || otp.join("")
    
    if (code.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    if (!email) {
      setError("Email is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await twoFactorService.verify(code, email)
      
      if (response.success && response.data) {
        const { user: backendUser, token } = response.data

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

        const frontendUser = {
          id: String(backendUser.id),
          name: backendUser.name,
          email: backendUser.email,
          role,
          roles: roleSlugs,
          email_verified_at: backendUser.email_verified_at,
        }

        // Store token and user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(frontendUser))
        }

        setIsVerified(true)
        
        // Redirect based on role
        setTimeout(() => {
          const redirectUrl = role === "admin" || role === "super_admin" 
            ? "/admin/dashboard" 
            : "/dashboard"
          
          window.location.href = redirectUrl
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || "Invalid code. Please try again.")
      setOtp(Array(6).fill(""))
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          {isVerified ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  strokeWidth={2}
                  className="size-8 text-green-600 dark:text-green-400"
                />
              </div>
              <CardTitle className="text-2xl font-bold">Verified!</CardTitle>
              <CardDescription>
                Your account has been verified successfully. Redirecting...
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl font-bold">Enter 2FA code</CardTitle>
              <CardDescription>
                Enter the 6-digit code from your authenticator app
                {email && (
                  <>
                    {" "}for{" "}
                    <span className="font-medium text-foreground">{email}</span>
                  </>
                )}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {!isVerified && (
            <>
              <Field>
                <FieldLabel className="sr-only">Enter OTP</FieldLabel>
                <FieldContent>
                  <div className="flex justify-center gap-2 mb-4">
                    {otp.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el: HTMLInputElement | null) => {
                          inputRefs.current[index] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className={cn(
                          "h-14 w-12 text-center text-xl font-semibold tabular-nums",
                          error
                            ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                            : ""
                        )}
                        aria-label={`Digit ${index + 1}`}
                      />
                    ))}
                  </div>
                  {error && (
                    <div className="text-sm text-destructive text-center mb-4">{error}</div>
                  )}
                </FieldContent>
              </Field>

              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={() => handleVerify()}
                  className="w-full"
                  size="lg"
                  disabled={otp.some((digit) => !digit) || isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify code"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
        {!isVerified && (
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Back to login
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

export default function OTPPage() {
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
      <OTPPageContent />
    </React.Suspense>
  )
}
