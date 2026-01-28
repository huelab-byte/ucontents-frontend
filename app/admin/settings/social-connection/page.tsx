"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { socialConnectionService, type SocialProvider, type SocialProviderApp } from "@/lib/api"
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import { SettingsIcon, Link01Icon, Copy01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"
import { toast } from "@/lib/toast"
import { usePermission } from "@/lib/hooks/use-permission"

type ProviderConfigDraft = {
  enabled: boolean
  clientId: string
  clientSecretInput: string
  scopesText: string
  extra: Record<string, any>
}

export default function SocialConnectionSettingsPage() {
  const { hasPermission } = usePermission()
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Permission check
  if (!hasPermission("manage_social_providers")) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }
  const [apps, setApps] = React.useState<Record<string, SocialProviderApp>>({})
  const [draft, setDraft] = React.useState<Record<string, ProviderConfigDraft>>({})
  const [isSaving, setIsSaving] = React.useState<{ meta: boolean; google: boolean; tiktok: boolean }>({
    meta: false,
    google: false,
    tiktok: false,
  })
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  const load = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await socialConnectionService.adminGetProviders()
      if (res.success && res.data) {
        const map: Record<string, SocialProviderApp> = {}
        for (const app of res.data) map[app.provider] = app
        setApps(map)

        // Initialize editable draft from server response
        const nextDraft: Record<string, ProviderConfigDraft> = {}
        ;(["meta", "google", "tiktok"] as SocialProvider[]).forEach((provider) => {
          const a = map[provider]
          if (!a) return
          nextDraft[provider] = {
            enabled: a.enabled,
            clientId: a.client_id || "",
            clientSecretInput: "",
            scopesText: (a.scopes || []).join(","),
            extra: a.extra || {},
          }
        })
        setDraft(nextDraft)
      }
    } catch (e: any) {
      setError(e.message || "Failed to load providers")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const setDraftField = (provider: SocialProvider, patch: Partial<ProviderConfigDraft>) => {
    setDraft((prev) => ({
      ...prev,
      [provider]: { ...(prev[provider] || ({} as ProviderConfigDraft)), ...patch },
    }))
  }

  const saveMeta = async () => {
    setIsSaving((p) => ({ ...p, meta: true }))
    try {
      const meta = draft.meta
      if (meta) {
        const metaExtra = meta.extra || {}
        // Meta is composed of sub-features (Facebook/Instagram). If any is enabled,
        // enable the provider so customers can see it.
        const derivedEnabled = !!(
          metaExtra.facebook_page?.enabled ||
          metaExtra.facebook_profile?.enabled ||
          metaExtra.instagram_profile?.enabled
        )

        const res = await socialConnectionService.adminUpdateProvider("meta", {
          // Meta provider-level enable/disable is intentionally not shown in UI
          enabled: derivedEnabled,
          client_id: meta.clientId || null,
          client_secret: meta.clientSecretInput || null,
          scopes: meta.scopesText
            ? meta.scopesText.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          extra: meta.extra,
        })
        
        // Update state from response instead of reloading
        if (res.success && res.data) {
          const updatedData = res.data
          setApps((prev) => ({ ...prev, meta: updatedData }))
          setDraft((prev) => ({
            ...prev,
            meta: {
              enabled: updatedData.enabled,
              clientId: updatedData.client_id || "",
              clientSecretInput: "", // Clear secret input after save
              scopesText: (updatedData.scopes || []).join(","),
              extra: updatedData.extra || {},
            },
          }))
        }
      }
    } catch (e) {
      throw e
    } finally {
      setIsSaving((p) => ({ ...p, meta: false }))
    }
  }

  const saveGoogle = async () => {
    setIsSaving((p) => ({ ...p, google: true }))
    try {
      const google = draft.google
      if (google) {
        const res = await socialConnectionService.adminUpdateProvider("google", {
          enabled: google.enabled,
          client_id: google.clientId || null,
          client_secret: google.clientSecretInput || null,
          scopes: google.scopesText
            ? google.scopesText.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          extra: google.extra,
        })

        // Update state from response instead of reloading
        if (res.success && res.data) {
          const updatedData = res.data
          setApps((prev) => ({ ...prev, google: updatedData }))
          setDraft((prev) => ({
            ...prev,
            google: {
              enabled: updatedData.enabled,
              clientId: updatedData.client_id || "",
              clientSecretInput: "", // Clear secret input after save
              scopesText: (updatedData.scopes || []).join(","),
              extra: updatedData.extra || {},
            },
          }))
        }
      }
    } catch (e) {
      throw e
    } finally {
      setIsSaving((p) => ({ ...p, google: false }))
    }
  }

  const saveTikTok = async () => {
    setIsSaving((p) => ({ ...p, tiktok: true }))
    try {
      const tiktok = draft.tiktok
      if (tiktok) {
        const res = await socialConnectionService.adminUpdateProvider("tiktok", {
          enabled: tiktok.enabled,
          client_id: tiktok.clientId || null,
          client_secret: tiktok.clientSecretInput || null,
          scopes: tiktok.scopesText
            ? tiktok.scopesText.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          extra: tiktok.extra,
        })

        // Update state from response instead of reloading
        if (res.success && res.data) {
          const updatedData = res.data
          setApps((prev) => ({ ...prev, tiktok: updatedData }))
          setDraft((prev) => ({
            ...prev,
            tiktok: {
              enabled: updatedData.enabled,
              clientId: updatedData.client_id || "",
              clientSecretInput: "", // Clear secret input after save
              scopesText: (updatedData.scopes || []).join(","),
              extra: updatedData.extra || {},
            },
          }))
        }
      }
    } catch (e) {
      throw e
    } finally {
      setIsSaving((p) => ({ ...p, tiktok: false }))
    }
  }

  const backendCallbackBase = (path: string) => {
    // Callbacks must point to the backend (OAuth provider redirects here)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const apiBase = apiUrl.replace("/api", "")
    return `${apiBase}/api/v1/${path}`
  }

  const copyToClipboard = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
      toast.success("Copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={SettingsIcon} className="size-8" />
            Social Connection
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure OAuth apps and enable providers for customers.
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Loading providers...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={load}>Retry</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* META */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Link01Icon} className="size-5" />
                  Meta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>
                      <Label>App ID</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        value={draft.meta?.clientId || ""}
                        onChange={(e) => setDraftField("meta", { clientId: e.target.value })}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label>App Secret</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        type="password"
                        placeholder={apps.meta?.has_client_secret ? "******** (already set)" : ""}
                        value={draft.meta?.clientSecretInput || ""}
                        onChange={(e) => setDraftField("meta", { clientSecretInput: e.target.value })}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label>Graph version</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        value={draft.meta?.extra?.graph_version || ""}
                        onChange={(e) =>
                          setDraftField("meta", {
                            extra: { ...(draft.meta?.extra || {}), graph_version: e.target.value },
                          })
                        }
                        placeholder="v22.0"
                      />
                    </FieldContent>
                  </Field>
                </FieldGroup>

                {/* Facebook page */}
                <div className="pt-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label className="text-base font-semibold">Facebook page</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable and configure permissions for Facebook Pages
                      </p>
                    </div>
                    <Switch
                      checked={!!draft.meta?.extra?.facebook_page?.enabled}
                      onCheckedChange={(v) =>
                        setDraftField("meta", {
                          extra: {
                            ...(draft.meta?.extra || {}),
                            facebook_page: { ...(draft.meta?.extra?.facebook_page || {}), enabled: v },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="mt-3">
                    <FieldGroup className="gap-4">
                      <Field>
                        <FieldLabel>
                          <Label>Required Permissions</Label>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            readOnly
                            value="pages_read_engagement,pages_manage_posts,pages_show_list,business_management"
                          />
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  </div>
                  <div className="mt-3 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                    <span className="font-medium">Callback URL:</span>
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          readOnly
                          disabled
                          value={backendCallbackBase("customer/social-connection/meta/callback?type=facebook_page")}
                          className="bg-muted cursor-not-allowed flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={() =>
                            copyToClipboard(
                              backendCallbackBase("customer/social-connection/meta/callback?type=facebook_page"),
                              "meta_facebook_page",
                            )
                          }
                        >
                          {copiedKey === "meta_facebook_page" ? (
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
                        Use this for Facebook Page OAuth redirect in your Facebook app settings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Facebook profile */}
                <div className="pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label className="text-base font-semibold">Facebook profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable and configure permissions for Facebook Profile
                      </p>
                    </div>
                    <Switch
                      checked={!!draft.meta?.extra?.facebook_profile?.enabled}
                      onCheckedChange={(v) =>
                        setDraftField("meta", {
                          extra: {
                            ...(draft.meta?.extra || {}),
                            facebook_profile: { ...(draft.meta?.extra?.facebook_profile || {}), enabled: v },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="mt-3">
                    <FieldGroup className="gap-4">
                      <Field>
                        <FieldLabel>
                          <Label>Required Permissions</Label>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            readOnly
                            value="public_profile,publish_video"
                          />
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  </div>
                  <div className="mt-3 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                    <span className="font-medium">Callback URL:</span>
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          readOnly
                          disabled
                          value={backendCallbackBase("customer/social-connection/meta/callback?type=facebook_profile")}
                          className="bg-muted cursor-not-allowed flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={() =>
                            copyToClipboard(
                              backendCallbackBase("customer/social-connection/meta/callback?type=facebook_profile"),
                              "meta_facebook_profile",
                            )
                          }
                        >
                          {copiedKey === "meta_facebook_profile" ? (
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
                        Use this for Facebook Profile OAuth redirect in your Facebook app settings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instagram profile */}
                <div className="pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label className="text-base font-semibold">Instagram profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable and configure permissions for Instagram (Business)
                      </p>
                    </div>
                    <Switch
                      checked={!!draft.meta?.extra?.instagram_profile?.enabled}
                      onCheckedChange={(v) =>
                        setDraftField("meta", {
                          extra: {
                            ...(draft.meta?.extra || {}),
                            instagram_profile: { ...(draft.meta?.extra?.instagram_profile || {}), enabled: v },
                          },
                        })
                      }
                    />
                  </div>
                  <div className="mt-3">
                    <FieldGroup className="gap-4">
                      <Field>
                        <FieldLabel>
                          <Label>Required Permissions</Label>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            readOnly
                            value="instagram_basic,instagram_content_publish,pages_read_engagement,pages_show_list,instagram_manage_insights,business_management"
                          />
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  </div>
                  <div className="mt-3 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                    <span className="font-medium">Callback URL:</span>
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          readOnly
                          disabled
                          value={backendCallbackBase(
                            "customer/social-connection/meta/callback?type=instagram_business",
                          )}
                          className="bg-muted cursor-not-allowed flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          onClick={() =>
                            copyToClipboard(
                              backendCallbackBase("customer/social-connection/meta/callback?type=instagram_business"),
                              "meta_instagram_business",
                            )
                          }
                        >
                          {copiedKey === "meta_instagram_business" ? (
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
                        Use this for Instagram Business OAuth redirect (via Meta) in your Facebook app settings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={saveMeta} disabled={isSaving.meta}>
                    {isSaving.meta ? "Saving..." : "Save Meta"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* GOOGLE */}
            <Card>
              <CardHeader>
                <CardTitle>YouTube channel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Status</p>
                  </div>
                  <Switch
                    checked={!!draft.google?.enabled}
                    onCheckedChange={(v) => setDraftField("google", { enabled: v })}
                  />
                </div>

                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>
                      <Label>Client ID</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        value={draft.google?.clientId || ""}
                        onChange={(e) => setDraftField("google", { clientId: e.target.value })}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label>Client Secret</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        type="password"
                        placeholder={apps.google?.has_client_secret ? "******** (already set)" : ""}
                        value={draft.google?.clientSecretInput || ""}
                        onChange={(e) => setDraftField("google", { clientSecretInput: e.target.value })}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label>API Key</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        value={draft.google?.extra?.api_key || ""}
                        onChange={(e) =>
                          setDraftField("google", { extra: { ...(draft.google?.extra || {}), api_key: e.target.value } })
                        }
                      />
                    </FieldContent>
                  </Field>
                </FieldGroup>

                <div className="space-y-2">
                  <Label>Scopes (optional)</Label>
                  <Input
                    value={draft.google?.scopesText || ""}
                    onChange={(e) => setDraftField("google", { scopesText: e.target.value })}
                    placeholder="openid,email,https://www.googleapis.com/auth/youtube.readonly"
                  />
                  <p className="text-xs text-muted-foreground">No required scopes for YouTube.</p>
                </div>

                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <span className="font-medium">Callback URL:</span>
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        readOnly
                        disabled
                        value={backendCallbackBase("customer/social-connection/google/callback")}
                        className="bg-muted cursor-not-allowed flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() =>
                          copyToClipboard(
                            backendCallbackBase("customer/social-connection/google/callback"),
                            "google_callback",
                          )
                        }
                      >
                        {copiedKey === "google_callback" ? (
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
                      Use this for YouTube OAuth redirect in your Google Cloud Console.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveGoogle} disabled={isSaving.google}>
                    {isSaving.google ? "Saving..." : "Save YouTube"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* TIKTOK */}
            <Card>
              <CardHeader>
                <CardTitle>TikTok profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">Status</p>
                  <Switch checked={!!draft.tiktok?.enabled} onCheckedChange={(v) => setDraftField("tiktok", { enabled: v })} />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium">Mode</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tiktok-mode-live"
                        checked={(draft.tiktok?.extra?.mode || "live") === "live"}
                        onCheckedChange={() =>
                          setDraftField("tiktok", {
                            extra: { ...(draft.tiktok?.extra || {}), mode: "live" },
                          })
                        }
                      />
                      <Label
                        htmlFor="tiktok-mode-live"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Live
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tiktok-mode-sandbox"
                        checked={(draft.tiktok?.extra?.mode || "live") === "sandbox"}
                        onCheckedChange={() =>
                          setDraftField("tiktok", {
                            extra: { ...(draft.tiktok?.extra || {}), mode: "sandbox" },
                          })
                        }
                      />
                      <Label
                        htmlFor="tiktok-mode-sandbox"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Sandbox
                      </Label>
                    </div>
                  </div>
                </div>

                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel>
                      <Label>App ID</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        value={draft.tiktok?.clientId || ""}
                        onChange={(e) => setDraftField("tiktok", { clientId: e.target.value })}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label>App Secret</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        type="password"
                        placeholder={apps.tiktok?.has_client_secret ? "******** (already set)" : ""}
                        value={draft.tiktok?.clientSecretInput || ""}
                        onChange={(e) => setDraftField("tiktok", { clientSecretInput: e.target.value })}
                      />
                    </FieldContent>
                  </Field>
                </FieldGroup>

                <div className="space-y-2">
                  <Label>Required Scopes</Label>
                  <Input
                    readOnly
                    value="user.info.basic,user.info.profile,user.info.stats,video.list,video.publish"
                  />
                </div>

                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <span className="font-medium">Callback URL:</span>
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        readOnly
                        disabled
                        value={backendCallbackBase("customer/social-connection/tiktok/callback")}
                        className="bg-muted cursor-not-allowed flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        onClick={() =>
                          copyToClipboard(
                            backendCallbackBase("customer/social-connection/tiktok/callback"),
                            "tiktok_callback",
                          )
                        }
                      >
                        {copiedKey === "tiktok_callback" ? (
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
                      Use this for TikTok OAuth redirect in your TikTok Developer Portal.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveTikTok} disabled={isSaving.tiktok}>
                    {isSaving.tiktok ? "Saving..." : "Save TikTok"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  )
}

