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
  NotificationIcon,
  SettingsIcon,
  EyeIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons"
import {
  notificationSettingsService,
  type NotificationSettings,
} from "@/lib/api"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
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
        <HugeiconsIcon icon={EyeIcon} className="size-4" />
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

export default function NotificationSettingsPage() {
  const { hasPermission } = usePermission()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [settings, setSettings] = React.useState<NotificationSettings | null>(null)

  // Permission check
  if (!hasPermission("manage_notifications")) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  // Pusher Settings
  const [pusherAppId, setPusherAppId] = React.useState("")
  const [pusherKey, setPusherKey] = React.useState("")
  const [pusherSecret, setPusherSecret] = React.useState("")
  const [pusherCluster, setPusherCluster] = React.useState("mt1")
  const [pusherEnabled, setPusherEnabled] = React.useState(false)

  React.useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await notificationSettingsService.getSettings()
      if (response.success && response.data) {
        const data = response.data
        setSettings(data)
        setPusherAppId(data.pusher_app_id || "")
        setPusherKey(data.pusher_key || "")
        setPusherSecret(data.pusher_secret || "")
        setPusherCluster(data.pusher_cluster || "mt1")
        setPusherEnabled(data.pusher_enabled || false)
      }
    } catch (error) {
      toast.error("Failed to load notification settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updateData = {
        pusher_app_id: pusherAppId || undefined,
        pusher_key: pusherKey || undefined,
        pusher_secret: pusherSecret || undefined,
        pusher_cluster: pusherCluster || undefined,
        pusher_enabled: pusherEnabled,
      }

      const response = await notificationSettingsService.updateSettings(updateData)
      if (response.success && response.data) {
        setSettings(response.data)
        toast.success("Notification settings saved successfully")
      } else {
        toast.error(response.message || "Failed to save notification settings")
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to save notification settings. Please try again."
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading notification settings...</div>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={NotificationIcon} className="size-8" />
            Notification Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure Pusher credentials for real-time notifications
          </p>
        </div>

        {/* Pusher Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={SettingsIcon} className="size-5" />
              Pusher Configuration
            </CardTitle>
            <CardDescription>
              Configure Pusher credentials for real-time notification delivery. Get your credentials from{" "}
              <a
                href="https://pusher.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                pusher.com
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Enable Pusher</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable real-time notifications via Pusher
                  </p>
                </div>
                <Toggle
                  checked={pusherEnabled}
                  onCheckedChange={setPusherEnabled}
                />
              </div>

              <Field>
                <FieldLabel>
                  <Label>Pusher App ID</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="text"
                    value={pusherAppId}
                    onChange={(e) => setPusherAppId(e.target.value)}
                    placeholder="Enter Pusher App ID"
                    disabled={!pusherEnabled}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Pusher Key</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="text"
                    value={pusherKey}
                    onChange={(e) => setPusherKey(e.target.value)}
                    placeholder="Enter Pusher Key"
                    disabled={!pusherEnabled}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Pusher Secret</Label>
                </FieldLabel>
                <FieldContent>
                  <PasswordInput
                    value={pusherSecret}
                    onChange={(e) => setPusherSecret(e.target.value)}
                    placeholder="Enter Pusher Secret"
                    disabled={!pusherEnabled}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your Pusher secret is stored securely and will be masked when viewing
                  </p>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Pusher Cluster</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="text"
                    value={pusherCluster}
                    onChange={(e) => setPusherCluster(e.target.value)}
                    placeholder="mt1"
                    disabled={!pusherEnabled}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Common clusters: mt1 (US), eu (Europe), ap1 (Asia Pacific), ap2 (Asia Pacific 2), ap3 (Asia Pacific 3), ap4 (Asia Pacific 4), us2 (US 2), us3 (US 3)
                  </p>
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">About Pusher Integration</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Pusher enables real-time notifications without polling. When enabled, users will receive instant notifications
                  when announcements are created or system events occur. If Pusher is disabled, the system will fall back to
                  polling every 60 seconds.
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Credentials are stored in the database and will override environment variables if set.
                </p>
              </div>
            </div>
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
