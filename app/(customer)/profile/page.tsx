"use client"

import * as React from "react"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, SettingsIcon, LockKeyIcon, MailIcon, EyeIcon, CheckmarkCircle01Icon, AlertCircleIcon, ShieldIcon } from "@hugeicons/core-free-icons"
import { profileService, twoFactorService } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function ProfilePage() {
  const { user: authUser } = useAuth()
  const [userData, setUserData] = React.useState({
    name: authUser?.name || "",
    email: authUser?.email || ""
  })
  const [isLoading, setIsLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [editName, setEditName] = React.useState(userData.name)
  const [editEmail, setEditEmail] = React.useState(userData.email)
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)

  // Password Change State
  const [showPasswordChange, setShowPasswordChange] = React.useState(false)
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isChanging, setIsChanging] = React.useState(false)
  const [error, setError] = React.useState("")

  // 2FA State
  const [twoFactorStatus, setTwoFactorStatus] = React.useState<{ enabled: boolean; required: boolean } | null>(null)
  const [loading2FA, setLoading2FA] = React.useState(true)

  const fetchProfile = React.useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const response = await profileService.getProfile()
      if (response.success && response.data) {
        setUserData({
          name: response.data.name,
          email: response.data.email
        })
      }
    } catch (err: any) {
      setLoadError(err.message || "Failed to load profile")
      // Fallback to auth user data
      if (authUser) {
        setUserData({
          name: authUser.name,
          email: authUser.email
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [authUser])

  // Track if initial loads have run (prevents double execution in StrictMode)
  const hasLoadedProfileRef = React.useRef(false)
  const hasLoaded2FARef = React.useRef(false)

  // Fetch profile on mount
  React.useEffect(() => {
    if (hasLoadedProfileRef.current) return
    hasLoadedProfileRef.current = true
    fetchProfile()
  }, [fetchProfile])

  // Fetch 2FA status
  React.useEffect(() => {
    if (!authUser || hasLoaded2FARef.current) return
    hasLoaded2FARef.current = true
    
    const fetch2FAStatus = async () => {
      try {
        setLoading2FA(true)
        const response = await twoFactorService.getStatus()
        if (response.success && response.data) {
          setTwoFactorStatus(response.data)
        }
      } catch (err) {
        console.error("Failed to fetch 2FA status:", err)
      } finally {
        setLoading2FA(false)
      }
    }

    fetch2FAStatus()
  }, [authUser])

  // Sync edit form with userData when modal opens
  React.useEffect(() => {
    if (isEditModalOpen) {
      setEditName(userData.name)
      setEditEmail(userData.email)
      setSaveError(null)
    }
  }, [isEditModalOpen, userData])

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError(null)
    
    try {
      const response = await profileService.updateProfile({
        name: editName,
        email: editEmail
      })
      
      if (response.success && response.data) {
        // Update local state
        setUserData({
          name: response.data.name,
          email: response.data.email
        })
        
        // Update auth context user if available
        if (authUser) {
          const updatedUser = { ...authUser, name: response.data.name, email: response.data.email }
          localStorage.setItem("user", JSON.stringify(updatedUser))
        }
        
        setIsEditModalOpen(false)
      }
    } catch (err: any) {
      setSaveError(err.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required")
      return
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password")
      return
    }

    setIsChanging(true)
    
    try {
      // Note: Backend API accepts password in updateProfile, but doesn't verify current password
      // In production, you'd want a separate endpoint that verifies current password
      await profileService.updateProfile({
        password: newPassword
      })
      
      // Reset form on success
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordChange(false)
      setError("")
    } catch (err: any) {
      setError(err.message || "Failed to change password. Please try again.")
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HugeiconsIcon icon={UserIcon} className="size-8" />
              Profile
            </h1>
            <p className="text-muted-foreground mt-2">
              View and manage your account information
            </p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsEditModalOpen(true)}
          >
            <HugeiconsIcon icon={SettingsIcon} className="size-4" />
            Edit Profile
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading profile...</p>
              </div>
            ) : loadError ? (
              <div className="py-8 text-center">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-12 mx-auto text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error loading profile</h3>
                <p className="text-sm text-muted-foreground mb-4">{loadError}</p>
                <Button onClick={fetchProfile} disabled={isLoading}>Retry</Button>
              </div>
            ) : (
              <FieldGroup className="space-y-6">
                <Field>
                  <FieldLabel>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <HugeiconsIcon icon={UserIcon} className="size-4" />
                      Name
                    </div>
                  </FieldLabel>
                  <FieldContent>
                    <Input 
                      type="text" 
                      value={userData.name} 
                      readOnly 
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <HugeiconsIcon icon={MailIcon} className="size-4" />
                      Email
                    </div>
                  </FieldLabel>
                  <FieldContent>
                    <Input 
                      type="email" 
                      value={userData.email} 
                      readOnly 
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={LockKeyIcon} className="size-5" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showPasswordChange ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Keep your account secure by changing your password regularly.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordChange(true)}
                  className="flex items-center gap-2"
                >
                  <HugeiconsIcon icon={LockKeyIcon} className="size-4" />
                  Change Password
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange}>
                <FieldGroup className="space-y-6">
                  <Field>
                    <FieldLabel>
                      <Label htmlFor="current-password">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <HugeiconsIcon icon={LockKeyIcon} className="size-4" />
                          Current Password
                        </div>
                      </Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          placeholder="Enter current password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          <HugeiconsIcon icon={EyeIcon} className="size-4" />
                        </button>
                      </div>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label htmlFor="new-password">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <HugeiconsIcon icon={LockKeyIcon} className="size-4" />
                          New Password
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Must be at least 8 characters long
                        </p>
                      </Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={8}
                          placeholder="Enter new password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          <HugeiconsIcon icon={EyeIcon} className="size-4" />
                        </button>
                      </div>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label htmlFor="confirm-password">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <HugeiconsIcon icon={LockKeyIcon} className="size-4" />
                          Confirm New Password
                        </div>
                      </Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Confirm new password"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          <HugeiconsIcon icon={EyeIcon} className="size-4" />
                        </button>
                      </div>
                    </FieldContent>
                  </Field>

                  {error && (
                    <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordChange(false)
                        setCurrentPassword("")
                        setNewPassword("")
                        setConfirmPassword("")
                        setError("")
                      }}
                      disabled={isChanging}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isChanging} className="flex items-center gap-2">
                      {isChanging ? (
                        <>
                          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ShieldIcon} className="size-5" />
              Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading2FA ? (
              <div className="py-4 text-center">
                <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Loading 2FA status...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorStatus?.enabled ? "Enabled" : "Disabled"}
                      {twoFactorStatus?.required && !twoFactorStatus?.enabled && (
                        <span className="text-amber-600 ml-2">(Required)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {twoFactorStatus?.enabled ? (
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-5 text-green-600" />
                    ) : (
                      <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {twoFactorStatus?.enabled
                    ? "Two-factor authentication is enabled on your account. This adds an extra layer of security."
                    : "Enable two-factor authentication to add an extra layer of security to your account."}
                </p>
                <Link href="/settings/security/2fa">
                  <Button variant="outline" className="w-full">
                    {twoFactorStatus?.enabled ? "Manage 2FA" : "Enable 2FA"}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Profile Modal */}
        <Sheet open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <SheetContent 
            side="right" 
            className="overflow-y-auto"
            style={{ 
              maxWidth: '420px',
              width: 'min(420px, 95vw)'
            }}
          >
            <form onSubmit={handleEditSubmit}>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={SettingsIcon} className="size-5" />
                  Edit Profile
                </SheetTitle>
                <SheetDescription>
                  Update your account information. Changes will be saved immediately.
                </SheetDescription>
              </SheetHeader>

              <div className="px-4 pt-0 pb-4 space-y-6">
                {saveError && (
                  <div className="rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3">
                    {saveError}
                  </div>
                )}
                <FieldGroup className="space-y-6">
                  <Field>
                    <FieldLabel>
                      <Label htmlFor="edit-name">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={UserIcon} className="size-4" />
                          Name
                        </div>
                      </Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="edit-name"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        placeholder="Enter your name"
                        disabled={isSaving}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label htmlFor="edit-email">
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={MailIcon} className="size-4" />
                          Email
                        </div>
                      </Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                        disabled={isSaving}
                      />
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </div>

              <SheetFooter>
                <SheetClose asChild>
                  <Button type="button" variant="outline" disabled={isSaving}>
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
                  {isSaving ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </CustomerDashboardLayout>
  )
}
