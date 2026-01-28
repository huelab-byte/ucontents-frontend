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
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SettingsIcon,
  ImageIcon,
  GlobeIcon,
  Mail01Icon,
  Link01Icon,
  Upload01Icon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { generalSettingsService, type GeneralSettings } from "@/lib/api/services/general-settings.service"
import { storageManagementService } from "@/lib/api/services/storage-management.service"
import { clearGeneralSettingsCache } from "@/lib/hooks/use-general-settings"
import { toast } from "@/lib/toast"
import { usePermission } from "@/lib/hooks/use-permission"

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

// Get timezone list
const getTimezones = () => {
  const timezones = Intl.supportedValuesOf('timeZone')
  return timezones.map(tz => ({
    value: tz,
    label: tz.replace(/_/g, ' '),
  }))
}

export default function GeneralSettingsPage() {
  const { hasPermission } = usePermission()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [uploadingLogo, setUploadingLogo] = React.useState(false)
  const [uploadingFavicon, setUploadingFavicon] = React.useState(false)
  const [settings, setSettings] = React.useState<GeneralSettings | null>(null)

  // Core Branding
  const [siteName, setSiteName] = React.useState("")
  const [siteDescription, setSiteDescription] = React.useState("")
  const [logo, setLogo] = React.useState("")
  const [favicon, setFavicon] = React.useState("")
  const [siteIcon, setSiteIcon] = React.useState("")
  const [primaryColorLight, setPrimaryColorLight] = React.useState("#000000")
  const [primaryColorDark, setPrimaryColorDark] = React.useState("#ffffff")
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = React.useState<string | null>(null)
  const [siteIconPreview, setSiteIconPreview] = React.useState<string | null>(null)
  const [uploadingSiteIcon, setUploadingSiteIcon] = React.useState(false)

  // Meta Tags (SEO)
  const [metaTitle, setMetaTitle] = React.useState("")
  const [metaDescription, setMetaDescription] = React.useState("")
  const [metaKeywords, setMetaKeywords] = React.useState("")

  // Additional Configurations
  const [timezone, setTimezone] = React.useState("UTC")
  const [contactEmail, setContactEmail] = React.useState("")
  const [supportEmail, setSupportEmail] = React.useState("")
  const [companyName, setCompanyName] = React.useState("")
  const [companyAddress, setCompanyAddress] = React.useState("")

  // Social Media Links
  const [facebookLink, setFacebookLink] = React.useState("")
  const [twitterLink, setTwitterLink] = React.useState("")
  const [instagramLink, setInstagramLink] = React.useState("")
  const [linkedinLink, setLinkedinLink] = React.useState("")
  const [youtubeLink, setYoutubeLink] = React.useState("")
  const [tiktokLink, setTiktokLink] = React.useState("")

  // Maintenance & Legal
  const [maintenanceMode, setMaintenanceMode] = React.useState(false)
  const [termsOfServiceUrl, setTermsOfServiceUrl] = React.useState("")
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = React.useState("")

  const timezones = React.useMemo(() => getTimezones(), [])

  // Load settings on mount
  React.useEffect(() => {
    loadSettings()
  }, [])

  // Helper function to convert path to preview URL
  const getPreviewUrl = React.useCallback((path: string | undefined): string | null => {
    if (!path) return null
    // If already a full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    // Convert relative path to absolute URL
    // Storage URLs like /storage/... need the base URL
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
    // Ensure path starts with / if it doesn't already
    const normalizedPath = path.startsWith('/') ? path : '/' + path
    return `${apiBase}${normalizedPath}`
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await generalSettingsService.getSettings()
      if (response.success && response.data) {
        const data = response.data
        setSettings(data)

        // Core Branding
        setSiteName(data.branding?.site_name || "")
        setSiteDescription(data.branding?.site_description || "")

        setLogo(data.branding?.logo || "")
        setFavicon(data.branding?.favicon || "")
        setSiteIcon(data.branding?.site_icon || "")
        setPrimaryColorLight(data.branding?.primary_color_light || "#000000")
        setPrimaryColorDark(data.branding?.primary_color_dark || "#ffffff")
        setLogoPreview(getPreviewUrl(data.branding?.logo))
        setFaviconPreview(getPreviewUrl(data.branding?.favicon))
        setSiteIconPreview(getPreviewUrl(data.branding?.site_icon))

        // Meta Tags
        setMetaTitle(data.meta?.title || "")
        setMetaDescription(data.meta?.description || "")
        setMetaKeywords(data.meta?.keywords || "")

        // Additional Configurations
        setTimezone(data.timezone || "UTC")
        setContactEmail(data.contact_email || "")
        setSupportEmail(data.support_email || "")
        setCompanyName(data.company_name || "")
        setCompanyAddress(data.company_address || "")

        // Social Links
        setFacebookLink(data.social_links?.facebook || "")
        setTwitterLink(data.social_links?.twitter || "")
        setInstagramLink(data.social_links?.instagram || "")
        setLinkedinLink(data.social_links?.linkedin || "")
        setYoutubeLink(data.social_links?.youtube || "")
        setTiktokLink(data.social_links?.tiktok || "")

        // Maintenance & Legal
        setMaintenanceMode(data.maintenance_mode || false)
        setTermsOfServiceUrl(data.terms_of_service_url || "")
        setPrivacyPolicyUrl(data.privacy_policy_url || "")
      }
    } catch (error) {
      toast.error("Failed to load general settings")
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo file size must be less than 5MB")
      return
    }

    try {
      setUploadingLogo(true)
      const response = await storageManagementService.uploadFile(file, 'settings/logo')
      if (response.success && response.data) {
        const fileUrl = response.data.url || response.data.path
        // Convert to preview URL - use url if available and it's a full URL, otherwise construct from path
        let previewUrl = fileUrl
        if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
          // Construct full URL from relative path
          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
          const normalizedPath = fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl
          previewUrl = `${apiBase}${normalizedPath}`
        }
        setLogo(fileUrl)
        setLogoPreview(previewUrl)
        toast.success("Logo uploaded successfully")
      } else {
        toast.error(response.message || "Failed to upload logo")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload logo")
    } finally {
      setUploadingLogo(false)
      // Reset input
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size (max 1MB for favicon)
    if (file.size > 1 * 1024 * 1024) {
      toast.error("Favicon file size must be less than 1MB")
      return
    }

    try {
      setUploadingFavicon(true)
      const response = await storageManagementService.uploadFile(file, 'settings/favicon')
      if (response.success && response.data) {
        const fileUrl = response.data.url || response.data.path
        // Convert to preview URL - use url if available and it's a full URL, otherwise construct from path
        let previewUrl = fileUrl
        if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
          // Construct full URL from relative path
          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
          const normalizedPath = fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl
          previewUrl = `${apiBase}${normalizedPath}`
        }
        setFavicon(fileUrl)
        setFaviconPreview(previewUrl)
        toast.success("Favicon uploaded successfully")
      } else {
        toast.error(response.message || "Failed to upload favicon")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload favicon")
    } finally {
      setUploadingFavicon(false)
      // Reset input
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  const handleSiteIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size (max 2MB for site icon)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Site icon file size must be less than 2MB")
      return
    }

    try {
      setUploadingSiteIcon(true)
      const response = await storageManagementService.uploadFile(file, 'settings/site-icon')
      if (response.success && response.data) {
        const fileUrl = response.data.url || response.data.path
        // Convert to preview URL - use url if available and it's a full URL, otherwise construct from path
        let previewUrl = fileUrl
        if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
          // Construct full URL from relative path
          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
          const normalizedPath = fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl
          previewUrl = `${apiBase}${normalizedPath}`
        }
        setSiteIcon(fileUrl)
        setSiteIconPreview(previewUrl)
        toast.success("Site icon uploaded successfully")
      } else {
        toast.error(response.message || "Failed to upload site icon")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload site icon")
    } finally {
      setUploadingSiteIcon(false)
      // Reset input
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const updateData = {
        branding: {
          site_name: siteName,
          site_description: siteDescription,
          logo: logo,
          favicon: favicon,
          site_icon: siteIcon,
          primary_color_light: primaryColorLight,
          primary_color_dark: primaryColorDark,
        },
        meta: {
          title: metaTitle,
          description: metaDescription,
          keywords: metaKeywords,
        },
        timezone: timezone,
        contact_email: contactEmail,
        support_email: supportEmail,
        company_name: companyName,
        company_address: companyAddress,
        social_links: {
          facebook: facebookLink,
          twitter: twitterLink,
          instagram: instagramLink,
          linkedin: linkedinLink,
          youtube: youtubeLink,
          tiktok: tiktokLink,
        },
        maintenance_mode: maintenanceMode,
        terms_of_service_url: termsOfServiceUrl,
        privacy_policy_url: privacyPolicyUrl,
      }

      const response = await generalSettingsService.updateSettings(updateData)
      if (response.success && response.data) {
        setSettings(response.data)
        // Clear cache so new settings are reflected immediately
        clearGeneralSettingsCache()
        toast.success("General settings saved successfully")
      } else {
        toast.error(response.message || "Failed to save general settings")
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to save general settings. Please try again."
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  // Permission check - after all hooks
  if (!hasPermission("view_general_settings") && !hasPermission("manage_general_settings")) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading general settings...</div>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={SettingsIcon} className="size-8" />
            General Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure site branding, meta tags, company information, and general settings
          </p>
        </div>

        {/* Core Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ImageIcon} className="size-5" />
              Core Branding (Required)
            </CardTitle>
            <CardDescription>
              Configure your site's core branding elements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>
                  <Label>Site Name *</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Enter site name"
                    required
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Site Description *</Label>
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    placeholder="Enter site description"
                    required
                    rows={3}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Logo *</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="space-y-3">
                    {logoPreview && (
                      <div className="relative inline-block">
                        <div className="border rounded-md p-2 bg-muted/50">
                          <img
                            key={logoPreview} // Force re-render when URL changes
                            src={logoPreview || undefined}
                            alt="Logo preview"
                            className="h-20 w-auto object-contain"
                            onError={(e) => {
                              // If image fails to load, try constructing URL from the stored path
                              const target = e.target as HTMLImageElement
                              if (logo && !logo.startsWith('http')) {
                                const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
                                const path = logo.startsWith('/') ? logo : '/' + logo
                                const newUrl = `${apiBase}${path}`
                                // Only update if different to avoid infinite loop
                                if (target.src !== newUrl) {
                                  target.src = newUrl
                                }
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setLogo("")
                            setLogoPreview(null)
                          }}
                          className="absolute -top-2 -right-2 size-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                        >
                          <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="cursor-pointer"
                      />
                      {uploadingLogo && (
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      )}
                    </div>
                    {logo && (
                      <p className="text-xs text-muted-foreground">
                        Current logo URL: {logo}
                      </p>
                    )}
                  </div>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Favicon *</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="space-y-3">
                    {faviconPreview && (
                      <div className="relative inline-block">
                        <div className="border rounded-md p-2 bg-muted/50">
                          <img
                            key={faviconPreview} // Force re-render when URL changes
                            src={faviconPreview || undefined}
                            alt="Favicon preview"
                            className="h-16 w-16 object-contain"
                            onError={(e) => {
                              // If image fails to load, try constructing URL from the stored path
                              const target = e.target as HTMLImageElement
                              if (favicon && !favicon.startsWith('http')) {
                                const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
                                const path = favicon.startsWith('/') ? favicon : '/' + favicon
                                const newUrl = `${apiBase}${path}`
                                // Only update if different to avoid infinite loop
                                if (target.src !== newUrl) {
                                  target.src = newUrl
                                }
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFavicon("")
                            setFaviconPreview(null)
                          }}
                          className="absolute -top-2 -right-2 size-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                        >
                          <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFaviconUpload}
                        disabled={uploadingFavicon}
                        className="cursor-pointer"
                      />
                      {uploadingFavicon && (
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      )}
                    </div>
                    {favicon && (
                      <p className="text-xs text-muted-foreground">
                        Current favicon URL: {favicon}
                      </p>
                    )}
                  </div>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Site Icon</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="space-y-3">
                    {siteIconPreview && (
                      <div className="relative inline-block">
                        <div className="border rounded-md p-2 bg-muted/50">
                          <img
                            key={siteIconPreview} // Force re-render when URL changes
                            src={siteIconPreview || undefined}
                            alt="Site icon preview"
                            className="h-20 w-20 object-contain"
                            onError={(e) => {
                              // If image fails to load, try constructing URL from the stored path
                              const target = e.target as HTMLImageElement
                              if (siteIcon && !siteIcon.startsWith('http')) {
                                const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
                                const path = siteIcon.startsWith('/') ? siteIcon : '/' + siteIcon
                                const newUrl = `${apiBase}${path}`
                                // Only update if different to avoid infinite loop
                                if (target.src !== newUrl) {
                                  target.src = newUrl
                                }
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSiteIcon("")
                            setSiteIconPreview(null)
                          }}
                          className="absolute -top-2 -right-2 size-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90"
                        >
                          <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleSiteIconUpload}
                        disabled={uploadingSiteIcon}
                        className="cursor-pointer"
                      />
                      {uploadingSiteIcon && (
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      )}
                    </div>
                    {siteIcon && (
                      <p className="text-xs text-muted-foreground">
                        Current site icon URL: {siteIcon}
                      </p>
                    )}
                  </div>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Primary Theme Color - Light Mode (Hex) *</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={primaryColorLight}
                      onChange={(e) => setPrimaryColorLight(e.target.value)}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={primaryColorLight}
                      onChange={(e) => setPrimaryColorLight(e.target.value)}
                      placeholder="#000000"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      className="flex-1"
                    />
                  </div>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Primary Theme Color - Dark Mode (Hex) *</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      value={primaryColorDark}
                      onChange={(e) => setPrimaryColorDark(e.target.value)}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={primaryColorDark}
                      onChange={(e) => setPrimaryColorDark(e.target.value)}
                      placeholder="#ffffff"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      className="flex-1"
                    />
                  </div>
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Meta Tags (SEO) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={GlobeIcon} className="size-5" />
              Meta Tags (SEO)
            </CardTitle>
            <CardDescription>
              Configure SEO meta tags for better search engine visibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>
                  <Label>Meta Title</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Enter meta title"
                    maxLength={255}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Meta Description</Label>
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Enter meta description"
                    maxLength={500}
                    rows={3}
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Meta Keywords</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="Enter keywords (comma-separated)"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate keywords with commas
                  </p>
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Additional Configurations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Mail01Icon} className="size-5" />
              Additional Configurations
            </CardTitle>
            <CardDescription>
              Configure timezone, contact information, and company details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>
                  <Label>Timezone</Label>
                </FieldLabel>
                <FieldContent>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Contact Email</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@example.com"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Support Email</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@example.com"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Company Name</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Company Address</Label>
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Enter company address"
                    rows={3}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Link01Icon} className="size-5" />
              Social Media Links (Optional)
            </CardTitle>
            <CardDescription>
              Add links to your social media profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>
                  <Label>Facebook</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="url"
                    value={facebookLink}
                    onChange={(e) => setFacebookLink(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Twitter</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="url"
                    value={twitterLink}
                    onChange={(e) => setTwitterLink(e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Instagram</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="url"
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>LinkedIn</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="url"
                    value={linkedinLink}
                    onChange={(e) => setLinkedinLink(e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>YouTube</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="url"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    placeholder="https://youtube.com/@yourchannel"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>TikTok</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="url"
                    value={tiktokLink}
                    onChange={(e) => setTiktokLink(e.target.value)}
                    placeholder="https://tiktok.com/@yourhandle"
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Maintenance & Legal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={SettingsIcon} className="size-5" />
              Maintenance & Legal
            </CardTitle>
            <CardDescription>
              Configure maintenance mode and legal page URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to restrict site access
                  </p>
                </div>
                <Toggle
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              <Field>
                <FieldLabel>
                  <Label>Terms of Service URL</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="url"
                    value={termsOfServiceUrl}
                    onChange={(e) => setTermsOfServiceUrl(e.target.value)}
                    placeholder="https://example.com/terms"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Privacy Policy URL</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="url"
                    value={privacyPolicyUrl}
                    onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
                    placeholder="https://example.com/privacy"
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
