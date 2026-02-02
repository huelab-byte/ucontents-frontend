"use client"

import * as React from "react"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SettingsIcon,
  LockKeyIcon,
  KeyIcon,
  ShieldIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  Copy01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { authSettingsService, type AuthSettings } from "@/lib/api/services/auth-settings.service"
import { toast } from "@/lib/toast"
import { usePermission } from "@/lib/hooks/use-permission"

function PasswordInput({
  value,
  onChange,
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [showPassword, setShowPassword] = React.useState(false)
  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
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
      </button>
    </div>
  )
}

function Toggle({
  checked,
  onCheckedChange,
  className,
  ...props
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
} & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}

// Helper function to generate default callback URL
const getDefaultCallbackUrl = (provider: string): string => {
  if (typeof window === 'undefined') return ''

  // TikTok: use frontend callback (fixed URL for live app). Prefer frontend app URL; no www.
  if (provider === 'tiktok') {
    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== 'undefined' ? window.location.origin : null) ||
      ''
    if (!base) return ''
    const normalized = base.replace(/^(https?:\/\/)www\./i, '$1')
    return `${normalized.replace(/\/$/, '')}/app/tiktok/profile`
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
  const baseUrl = apiBaseUrl.replace(/\/api$/, '')
  return `${baseUrl}/api/v1/auth/social/${provider}/callback`
}

export default function AuthSettingsPage() {
  const { hasPermission } = usePermission()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [settings, setSettings] = React.useState<AuthSettings | null>(null)

  // Permission check
  if (!hasPermission("view_auth_settings") && !hasPermission("manage_auth_settings")) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  // Feature toggles
  const [magicLinkEnabled, setMagicLinkEnabled] = React.useState(false)
  const [magicLinkTokenExpiry, setMagicLinkTokenExpiry] = React.useState(15)
  const [magicLinkRateLimit, setMagicLinkRateLimit] = React.useState(3)

  const [otpEnabled, setOtpEnabled] = React.useState(false)

  const [emailVerificationEnabled, setEmailVerificationEnabled] = React.useState(false)

  const [passwordResetEnabled, setPasswordResetEnabled] = React.useState(false)
  const [passwordResetTokenExpiry, setPasswordResetTokenExpiry] = React.useState(60)
  const [passwordResetRateLimit, setPasswordResetRateLimit] = React.useState(3)

  const [socialAuthEnabled, setSocialAuthEnabled] = React.useState(false)
  const [socialAuthProviders, setSocialAuthProviders] = React.useState<string[]>([])
  
  // OAuth Provider Configurations
  const [googleClientId, setGoogleClientId] = React.useState("")
  const [googleClientSecret, setGoogleClientSecret] = React.useState("")
  
  const [facebookClientId, setFacebookClientId] = React.useState("")
  const [facebookClientSecret, setFacebookClientSecret] = React.useState("")
  
  const [tiktokClientId, setTiktokClientId] = React.useState("")
  const [tiktokClientSecret, setTiktokClientSecret] = React.useState("")
  const [tiktokMode, setTiktokMode] = React.useState<"sandbox" | "live">("sandbox")
  
  // Auto-generate callback URLs based on API base URL (non-editable)
  const googleCallbackUrl = React.useMemo(() => getDefaultCallbackUrl('google'), [])
  const facebookCallbackUrl = React.useMemo(() => getDefaultCallbackUrl('facebook'), [])
  const tiktokCallbackUrl = React.useMemo(() => getDefaultCallbackUrl('tiktok'), [])
  
  // Copy to clipboard state
  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null)
  
  const copyToClipboard = async (url: string, provider: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(provider)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
      toast.error("Failed to copy to clipboard")
    }
  }

  // Password settings
  const [passwordMinLength, setPasswordMinLength] = React.useState(8)
  const [passwordRequireUppercase, setPasswordRequireUppercase] = React.useState(true)
  const [passwordRequireNumber, setPasswordRequireNumber] = React.useState(true)
  const [passwordRequireSpecial, setPasswordRequireSpecial] = React.useState(false)

  // Token settings
  const [sanctumExpiry, setSanctumExpiry] = React.useState(1440)
  const [jwtExpiry, setJwtExpiry] = React.useState(60)
  const [refreshExpiry, setRefreshExpiry] = React.useState(43200)


  // Load settings on mount
  React.useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await authSettingsService.getSettings()
      if (response.success && response.data) {
        const data = response.data
        setSettings(data)

        // Set feature toggles
        setMagicLinkEnabled(data.features?.magic_link?.enabled ?? false)
        setMagicLinkTokenExpiry(data.features?.magic_link?.token_expiry ?? 15)
        setMagicLinkRateLimit(data.features?.magic_link?.rate_limit ?? 3)

        setOtpEnabled(data.features?.otp_2fa?.enabled ?? false)

        setEmailVerificationEnabled(data.features?.email_verification?.enabled ?? false)

        setPasswordResetEnabled(data.features?.password_reset?.enabled ?? false)
        setPasswordResetTokenExpiry(data.features?.password_reset?.token_expiry ?? 60)
        setPasswordResetRateLimit(data.features?.password_reset?.rate_limit ?? 3)

        setSocialAuthEnabled(data.features?.social_auth?.enabled ?? false)
        setSocialAuthProviders(data.features?.social_auth?.providers ?? [])
        
        // OAuth Provider Configurations
        const providerConfigs = data.features?.social_auth?.provider_configs ?? {}
        setGoogleClientId(providerConfigs.google?.client_id ?? "")
        setGoogleClientSecret(providerConfigs.google?.client_secret ?? "")
        
        setFacebookClientId(providerConfigs.facebook?.client_id ?? "")
        setFacebookClientSecret(providerConfigs.facebook?.client_secret ?? "")
        
        setTiktokClientId(providerConfigs.tiktok?.client_id ?? "")
        setTiktokClientSecret(providerConfigs.tiktok?.client_secret ?? "")
        setTiktokMode((providerConfigs.tiktok?.mode ?? "sandbox") as "sandbox" | "live")

        // Password settings
        setPasswordMinLength(data.password?.min_length ?? 8)
        setPasswordRequireUppercase(data.password?.require_uppercase ?? true)
        setPasswordRequireNumber(data.password?.require_number ?? true)
        setPasswordRequireSpecial(data.password?.require_special ?? false)

        // Token settings
        setSanctumExpiry(data.token?.sanctum_expiry ?? 1440)
        setJwtExpiry(data.token?.jwt_expiry ?? 60)
        setRefreshExpiry(data.token?.refresh_expiry ?? 43200)
      }
    } catch (error) {
      console.error("Failed to load auth settings:", error)
      toast.error("Failed to load auth settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updateData = {
        features: {
          magic_link: {
            enabled: magicLinkEnabled,
            token_expiry: magicLinkTokenExpiry,
            rate_limit: magicLinkRateLimit,
          },
          otp_2fa: {
            enabled: otpEnabled,
            required_for_admin: false,
            required_for_customer: false,
          },
          email_verification: {
            enabled: emailVerificationEnabled,
            required: emailVerificationEnabled, // When enabled, it's automatically required
          },
          password_reset: {
            enabled: passwordResetEnabled,
            token_expiry: passwordResetTokenExpiry,
            rate_limit: passwordResetRateLimit,
          },
          social_auth: {
            enabled: socialAuthEnabled,
            providers: socialAuthProviders,
            provider_configs: {
              google: {
                client_id: googleClientId,
                client_secret: googleClientSecret,
                callback_url: googleCallbackUrl, // Auto-generated, not saved to backend
              },
              facebook: {
                client_id: facebookClientId,
                client_secret: facebookClientSecret,
                callback_url: facebookCallbackUrl, // Auto-generated, not saved to backend
              },
              tiktok: {
                client_id: tiktokClientId,
                client_secret: tiktokClientSecret,
                mode: tiktokMode, // sandbox or live
                callback_url: tiktokCallbackUrl, // Auto-generated, not saved to backend
              },
            },
          },
        },
        password: {
          min_length: passwordMinLength,
          require_uppercase: passwordRequireUppercase,
          require_number: passwordRequireNumber,
          require_special: passwordRequireSpecial,
        },
        token: {
          sanctum_expiry: sanctumExpiry,
          jwt_expiry: jwtExpiry,
          refresh_expiry: refreshExpiry,
        },
      }

      const response = await authSettingsService.updateSettings(updateData)
      if (response.success && response.data) {
        // Use the response data directly instead of reloading
        const data = response.data
        setSettings(data)

        // Update state from response to ensure sync
        setMagicLinkEnabled(data.features?.magic_link?.enabled ?? false)
        setMagicLinkTokenExpiry(data.features?.magic_link?.token_expiry ?? 15)
        setMagicLinkRateLimit(data.features?.magic_link?.rate_limit ?? 3)

        setOtpEnabled(data.features?.otp_2fa?.enabled ?? false)

        setEmailVerificationEnabled(data.features?.email_verification?.enabled ?? false)

        setPasswordResetEnabled(data.features?.password_reset?.enabled ?? false)
        setPasswordResetTokenExpiry(data.features?.password_reset?.token_expiry ?? 60)
        setPasswordResetRateLimit(data.features?.password_reset?.rate_limit ?? 3)

        setSocialAuthEnabled(data.features?.social_auth?.enabled ?? false)
        setSocialAuthProviders(data.features?.social_auth?.providers ?? [])
        
        const providerConfigs = data.features?.social_auth?.provider_configs ?? {}
        setGoogleClientId(providerConfigs.google?.client_id ?? "")
        setGoogleClientSecret(providerConfigs.google?.client_secret ?? "")
        setFacebookClientId(providerConfigs.facebook?.client_id ?? "")
        setFacebookClientSecret(providerConfigs.facebook?.client_secret ?? "")
        setTiktokClientId(providerConfigs.tiktok?.client_id ?? "")
        setTiktokClientSecret(providerConfigs.tiktok?.client_secret ?? "")
        setTiktokMode((providerConfigs.tiktok?.mode ?? "sandbox") as "sandbox" | "live")

        setPasswordMinLength(data.password?.min_length ?? 8)
        setPasswordRequireUppercase(data.password?.require_uppercase ?? true)
        setPasswordRequireNumber(data.password?.require_number ?? true)
        setPasswordRequireSpecial(data.password?.require_special ?? false)

        setSanctumExpiry(data.token?.sanctum_expiry ?? 1440)
        setJwtExpiry(data.token?.jwt_expiry ?? 60)
        setRefreshExpiry(data.token?.refresh_expiry ?? 43200)

        toast.success("Auth settings saved successfully")
      } else {
        toast.error(response.message || "Failed to save auth settings")
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to save auth settings. Please try again."
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const toggleSocialProvider = (provider: string) => {
    setSocialAuthProviders((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider]
    )
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={LockKeyIcon} className="size-8" />
            Auth Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure authentication methods and security settings
          </p>
        </div>

        {/* Authentication Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ShieldIcon} className="size-5" />
              Authentication Features
            </CardTitle>
            <CardDescription>
              Enable or disable authentication methods and configure their settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-6">
              {/* Magic Link */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Magic Link</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to sign in via email magic links
                    </p>
                  </div>
                  <Toggle
                    checked={magicLinkEnabled}
                    onCheckedChange={setMagicLinkEnabled}
                  />
                </div>
                {magicLinkEnabled && (
                  <div className="pl-4 space-y-4 border-l-2">
                    <Field>
                      <FieldLabel>
                        <Label>Token Expiry (minutes)</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          type="number"
                          min="1"
                          max="1440"
                          value={magicLinkTokenExpiry}
                          onChange={(e) =>
                            setMagicLinkTokenExpiry(parseInt(e.target.value) || 15)
                          }
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>
                        <Label>Rate Limit (per hour)</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={magicLinkRateLimit}
                          onChange={(e) =>
                            setMagicLinkRateLimit(parseInt(e.target.value) || 3)
                          }
                        />
                      </FieldContent>
                    </Field>
                  </div>
                )}
              </div>

              {/* OTP / 2FA */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">OTP / Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable time-based one-time password authentication
                    </p>
                  </div>
                  <Toggle checked={otpEnabled} onCheckedChange={setOtpEnabled} />
                </div>
              </div>

              {/* Email Verification */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Require users to verify their email address before accessing the platform
                    </p>
                  </div>
                  <Toggle
                    checked={emailVerificationEnabled}
                    onCheckedChange={setEmailVerificationEnabled}
                  />
                </div>
              </div>

              {/* Password Reset */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Password Reset</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to reset their passwords via email
                    </p>
                  </div>
                  <Toggle
                    checked={passwordResetEnabled}
                    onCheckedChange={setPasswordResetEnabled}
                  />
                </div>
                {passwordResetEnabled && (
                  <div className="pl-4 space-y-4 border-l-2">
                    <Field>
                      <FieldLabel>
                        <Label>Token Expiry (minutes)</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          type="number"
                          min="1"
                          max="1440"
                          value={passwordResetTokenExpiry}
                          onChange={(e) =>
                            setPasswordResetTokenExpiry(parseInt(e.target.value) || 60)
                          }
                        />
                      </FieldContent>
                    </Field>
                    <Field>
                      <FieldLabel>
                        <Label>Rate Limit (per hour)</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={passwordResetRateLimit}
                          onChange={(e) =>
                            setPasswordResetRateLimit(parseInt(e.target.value) || 3)
                          }
                        />
                      </FieldContent>
                    </Field>
                  </div>
                )}
              </div>

              {/* Social Authentication */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">Social Authentication (OAuth)</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable OAuth login with social providers
                    </p>
                  </div>
                  <Toggle
                    checked={socialAuthEnabled}
                    onCheckedChange={setSocialAuthEnabled}
                  />
                </div>
                {socialAuthEnabled && (
                  <div className="pl-4 space-y-6 border-l-2">
                    {/* Google OAuth Configuration */}
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Google OAuth</Label>
                        <Toggle
                          checked={socialAuthProviders.includes("google")}
                          onCheckedChange={() => toggleSocialProvider("google")}
                        />
                      </div>
                      <FieldGroup className="gap-4">
                        <Field>
                          <FieldLabel>
                            <Label>Client ID</Label>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              type="text"
                              placeholder="Enter Google Client ID"
                              value={googleClientId}
                              onChange={(e) => setGoogleClientId(e.target.value)}
                            />
                          </FieldContent>
                        </Field>
                        <Field>
                          <FieldLabel>
                            <Label>Client Secret</Label>
                          </FieldLabel>
                          <FieldContent>
                            <PasswordInput
                              placeholder="Enter Google Client Secret"
                              value={googleClientSecret}
                              onChange={(e) => setGoogleClientSecret(e.target.value)}
                            />
                          </FieldContent>
                        </Field>
                        <Field>
                          <FieldLabel>
                            <Label>Callback URL (Redirect URI)</Label>
                          </FieldLabel>
                          <FieldContent>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  type="url"
                                  value={googleCallbackUrl}
                                  readOnly
                                  disabled
                                  className="bg-muted cursor-not-allowed flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(googleCallbackUrl, 'google')}
                                  className="shrink-0"
                                >
                                  {copiedUrl === 'google' ? (
                                    <>
                                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 mr-1" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <HugeiconsIcon icon={Copy01Icon} className="size-4 mr-1" />
                                      Copy
                                    </>
                                  )}
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                This is the backend API callback URL. Copy this exact URL and add it to your Google OAuth app's authorized redirect URIs in the Google Cloud Console.
                              </p>
                            </div>
                          </FieldContent>
                        </Field>
                      </FieldGroup>
                    </div>

                    {/* Facebook OAuth Configuration */}
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Facebook OAuth</Label>
                        <Toggle
                          checked={socialAuthProviders.includes("facebook")}
                          onCheckedChange={() => toggleSocialProvider("facebook")}
                        />
                      </div>
                      <FieldGroup className="gap-4">
                        <Field>
                          <FieldLabel>
                            <Label>Client ID (App ID)</Label>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              type="text"
                              placeholder="Enter Facebook App ID"
                              value={facebookClientId}
                              onChange={(e) => setFacebookClientId(e.target.value)}
                            />
                          </FieldContent>
                        </Field>
                        <Field>
                          <FieldLabel>
                            <Label>Client Secret (App Secret)</Label>
                          </FieldLabel>
                          <FieldContent>
                            <PasswordInput
                              placeholder="Enter Facebook App Secret"
                              value={facebookClientSecret}
                              onChange={(e) => setFacebookClientSecret(e.target.value)}
                            />
                          </FieldContent>
                        </Field>
                        <Field>
                          <FieldLabel>
                            <Label>Callback URL (Redirect URI)</Label>
                          </FieldLabel>
                          <FieldContent>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  type="url"
                                  value={facebookCallbackUrl}
                                  readOnly
                                  disabled
                                  className="bg-muted cursor-not-allowed flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(facebookCallbackUrl, 'facebook')}
                                  className="shrink-0"
                                >
                                  {copiedUrl === 'facebook' ? (
                                    <>
                                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 mr-1" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <HugeiconsIcon icon={Copy01Icon} className="size-4 mr-1" />
                                      Copy
                                    </>
                                  )}
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                This is the backend API callback URL. Copy this exact URL and add it to your Facebook App's Valid OAuth Redirect URIs in the Facebook Developer Console.
                              </p>
                            </div>
                          </FieldContent>
                        </Field>
                      </FieldGroup>
                    </div>

                    {/* TikTok OAuth Configuration */}
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">TikTok OAuth</Label>
                        <Toggle
                          checked={socialAuthProviders.includes("tiktok")}
                          onCheckedChange={() => toggleSocialProvider("tiktok")}
                        />
                      </div>
                      <FieldGroup className="gap-4">
                        <Field>
                          <FieldLabel>
                            <Label>Client Key (Client Key)</Label>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              type="text"
                              placeholder="Enter TikTok Client Key"
                              value={tiktokClientId}
                              onChange={(e) => setTiktokClientId(e.target.value)}
                            />
                          </FieldContent>
                        </Field>
                        <Field>
                          <FieldLabel>
                            <Label>Client Secret (Client Secret)</Label>
                          </FieldLabel>
                          <FieldContent>
                            <PasswordInput
                              placeholder="Enter TikTok Client Secret"
                              value={tiktokClientSecret}
                              onChange={(e) => setTiktokClientSecret(e.target.value)}
                            />
                          </FieldContent>
                        </Field>
                        <Field>
                          <FieldLabel>
                            <Label>Mode</Label>
                          </FieldLabel>
                          <FieldContent>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="tiktok-mode"
                                  value="sandbox"
                                  checked={tiktokMode === "sandbox"}
                                  onChange={(e) => setTiktokMode(e.target.value as "sandbox" | "live")}
                                  className="size-4"
                                />
                                <span className="text-sm">Sandbox (Testing)</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="tiktok-mode"
                                  value="live"
                                  checked={tiktokMode === "live"}
                                  onChange={(e) => setTiktokMode(e.target.value as "sandbox" | "live")}
                                  className="size-4"
                                />
                                <span className="text-sm">Live (Production)</span>
                              </label>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              <strong>Sandbox:</strong> For testing with whitelisted users (up to 10 accounts). No app review required.
                              <br />
                              <strong>Live:</strong> For production use. Requires app review and approval from TikTok.
                              <br />
                              <span className="text-amber-600 dark:text-amber-400 mt-1 block">
                                ⚠️ Ensure this mode matches your TikTok Developer Portal app mode setting.
                              </span>
                            </p>
                          </FieldContent>
                        </Field>
                        <Field>
                          <FieldLabel>
                            <Label>Callback URL (Redirect URI)</Label>
                          </FieldLabel>
                          <FieldContent>
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  type="url"
                                  value={tiktokCallbackUrl}
                                  readOnly
                                  disabled
                                  className="bg-muted cursor-not-allowed flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(tiktokCallbackUrl, 'tiktok')}
                                  className="shrink-0"
                                >
                                  {copiedUrl === 'tiktok' ? (
                                    <>
                                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 mr-1" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <HugeiconsIcon icon={Copy01Icon} className="size-4 mr-1" />
                                      Copy
                                    </>
                                  )}
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                This is the backend API callback URL. Copy this exact URL and add it to your TikTok App's Redirect URI settings in the TikTok Developer Portal.
                              </p>
                              {tiktokMode && (
                                <div className="mt-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                  <p className="text-xs text-amber-800 dark:text-amber-200">
                                    <strong>Current Mode: {tiktokMode === 'sandbox' ? 'Sandbox (Testing)' : 'Live (Production)'}</strong>
                                    <br />
                                    This setting should match your TikTok Developer Portal app mode. The OAuth endpoints are the same, but TikTok enforces different behaviors based on the app mode in their portal.
                                  </p>
                                </div>
                              )}
                            </div>
                          </FieldContent>
                        </Field>
                      </FieldGroup>
                    </div>
                  </div>
                )}
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Password Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={KeyIcon} className="size-5" />
              Password Requirements
            </CardTitle>
            <CardDescription>
              Configure password complexity requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>
                  <Label>Minimum Length</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="number"
                    min="6"
                    max="128"
                    value={passwordMinLength}
                    onChange={(e) =>
                      setPasswordMinLength(parseInt(e.target.value) || 8)
                    }
                  />
                </FieldContent>
              </Field>
              <div className="flex items-center justify-between">
                <Label>Require Uppercase Letter</Label>
                <Toggle
                  checked={passwordRequireUppercase}
                  onCheckedChange={setPasswordRequireUppercase}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Require Number</Label>
                <Toggle
                  checked={passwordRequireNumber}
                  onCheckedChange={setPasswordRequireNumber}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Require Special Character</Label>
                <Toggle
                  checked={passwordRequireSpecial}
                  onCheckedChange={setPasswordRequireSpecial}
                />
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Token Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ClockIcon} className="size-5" />
              Token Expiry Settings
            </CardTitle>
            <CardDescription>
              Configure token expiration times (in minutes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>
                  <Label>Sanctum Token Expiry (minutes)</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="number"
                    min="1"
                    max="10080"
                    value={sanctumExpiry}
                    onChange={(e) => setSanctumExpiry(parseInt(e.target.value) || 1440)}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>
                  <Label>JWT Token Expiry (minutes)</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="number"
                    min="1"
                    max="1440"
                    value={jwtExpiry}
                    onChange={(e) => setJwtExpiry(parseInt(e.target.value) || 60)}
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>
                  <Label>Refresh Token Expiry (minutes)</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="number"
                    min="1"
                    max="43200"
                    value={refreshExpiry}
                    onChange={(e) => setRefreshExpiry(parseInt(e.target.value) || 43200)}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>


        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
