"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { twoFactorService } from "@/lib/api"
import { toast } from "@/lib/toast"
import { useAuth } from "@/lib/auth-context"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
// Using external QR code API for simplicity

type SetupStep = "status" | "setup" | "verifying" | "enabled" | "disable"

export default function TwoFactorAuthPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [step, setStep] = React.useState<SetupStep>("status")
  const [status, setStatus] = React.useState<{ enabled: boolean; required: boolean } | null>(null)
  const [secret, setSecret] = React.useState<string>("")
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>("")
  const [verificationCode, setVerificationCode] = React.useState("")
  const [backupCodes, setBackupCodes] = React.useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = React.useState(false)
  const [disableCode, setDisableCode] = React.useState("")
  const [error, setError] = React.useState<string>("")
  const [viewingBackupCodes, setViewingBackupCodes] = React.useState(false)
  const [storedBackupCodes, setStoredBackupCodes] = React.useState<string[]>([])
  const [loadingBackupCodes, setLoadingBackupCodes] = React.useState(false)

  React.useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      setLoading(true)
      const response = await twoFactorService.getStatus()
      if (response.success && response.data) {
        setStatus(response.data)
        setStep(response.data.enabled ? "enabled" : "status")
      }
    } catch (err: any) {
      toast.error("Failed to load 2FA status")
    } finally {
      setLoading(false)
    }
  }

  const handleSetup = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await twoFactorService.setup()
      if (response.success && response.data) {
        setSecret(response.data.secret)
        setQrCodeUrl(response.data.qr_code_url)
        setStep("setup")
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate 2FA setup")
      toast.error("Failed to generate 2FA setup")
    } finally {
      setLoading(false)
    }
  }

  const handleEnable = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter a 6-digit code")
      return
    }

    try {
      setSaving(true)
      setError("")
      const response = await twoFactorService.enable(secret, verificationCode)
      if (response.success && response.data) {
        setBackupCodes(response.data.backup_codes)
        setStep("enabled")
        toast.success("2FA enabled successfully")
        await loadStatus()
      }
    } catch (err: any) {
      setError(err.message || "Invalid verification code")
    } finally {
      setSaving(false)
    }
  }

  const handleDisable = async () => {
    if (disableCode.length !== 6) {
      setError("Please enter a 6-digit code")
      return
    }

    try {
      setSaving(true)
      setError("")
      const response = await twoFactorService.disable(disableCode)
      if (response.success && response.data) {
        setStep("status")
        setDisableCode("")
        toast.success("2FA disabled successfully")
        await loadStatus()
      }
    } catch (err: any) {
      setError(err.message || "Invalid verification code")
    } finally {
      setSaving(false)
    }
  }

  const copyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Backup code copied to clipboard")
  }

  const copyAllBackupCodes = () => {
    const codesToCopy = backupCodes.length > 0 ? backupCodes : storedBackupCodes
    const codesText = codesToCopy.join("\n")
    navigator.clipboard.writeText(codesText)
    toast.success("All backup codes copied to clipboard")
  }

  const handleViewBackupCodes = async () => {
    try {
      setLoadingBackupCodes(true)
      setError("")
      const response = await twoFactorService.getBackupCodes()
      if (response.success && response.data) {
        setStoredBackupCodes(response.data.backup_codes)
        setViewingBackupCodes(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load backup codes")
      toast.error("Failed to load backup codes")
    } finally {
      setLoadingBackupCodes(false)
    }
  }

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const isAdmin = user?.role === "admin" || user?.role === "super_admin"
  const Layout = isAdmin ? AdminDashboardLayout : CustomerDashboardLayout

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={ShieldIcon} className="size-8" />
            Two-Factor Authentication
          </h1>
          <p className="text-muted-foreground mt-2">
            Add an extra layer of security to your account
          </p>
        </div>

      {status?.required && !status.enabled && (
        <Card className="mb-6 border-amber-500/50 bg-amber-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Two-Factor Authentication Required
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  Your account requires two-factor authentication. Please enable it to continue using the platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "status" && (
        <Card>
          <CardHeader>
            <CardTitle>2FA Status</CardTitle>
            <CardDescription>
              {status?.enabled
                ? "Two-factor authentication is enabled on your account"
                : "Two-factor authentication is not enabled"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground">
                  {status?.enabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {status?.enabled ? (
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-5 text-green-600" />
                ) : (
                  <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {!status?.enabled ? (
              <Button onClick={handleSetup} className="w-full" size="lg">
                Enable Two-Factor Authentication
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleViewBackupCodes}
                  variant="outline"
                  className="w-full"
                  size="lg"
                  disabled={loadingBackupCodes}
                >
                  {loadingBackupCodes ? "Loading..." : "View Backup Codes"}
                </Button>
                <Button
                  onClick={() => setStep("disable")}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  Disable Two-Factor Authentication
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === "setup" && (
        <Card>
          <CardHeader>
            <CardTitle>Set Up Two-Factor Authentication</CardTitle>
            <CardDescription>
              Scan the QR code with your authenticator app, then enter the verification code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-lg border">
                {qrCodeUrl && (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                    alt="QR Code"
                    className="w-[200px] h-[200px]"
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
              <FieldLabel>Verification Code</FieldLabel>
              <FieldContent>
                <Input
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
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Enter the 6-digit code from your authenticator app
                </p>
              </FieldContent>
            </Field>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("status")
                  setVerificationCode("")
                  setError("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnable}
                disabled={verificationCode.length !== 6 || saving}
                className="flex-1"
              >
                {saving ? "Verifying..." : "Verify & Enable"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "enabled" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-5 text-green-600" />
              2FA Enabled Successfully
            </CardTitle>
            <CardDescription>
              Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <Button onClick={() => setStep("status")} className="w-full">
              Done
            </Button>
          </CardContent>
        </Card>
      )}

      {viewingBackupCodes && (
        <Card>
          <CardHeader>
            <CardTitle>Backup Codes</CardTitle>
            <CardDescription>
              Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                {storedBackupCodes.map((code, index) => (
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
                      onClick={() => {
                        navigator.clipboard.writeText(code)
                        toast.success("Backup code copied to clipboard")
                      }}
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

            <Button onClick={() => setViewingBackupCodes(false)} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "disable" && (
        <Card>
          <CardHeader>
            <CardTitle>Disable Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter your 2FA code to disable two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel>Verification Code</FieldLabel>
              <FieldContent>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={disableCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setDisableCode(value)
                    setError("")
                  }}
                  className="text-center text-2xl font-mono tracking-widest"
                />
              </FieldContent>
            </Field>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("status")
                  setDisableCode("")
                  setError("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDisable}
                disabled={disableCode.length !== 6 || saving}
                variant="destructive"
                className="flex-1"
              >
                {saving ? "Disabling..." : "Disable 2FA"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </Layout>
  )
}
