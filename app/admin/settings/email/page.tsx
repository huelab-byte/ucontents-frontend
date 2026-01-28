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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  SettingsIcon,
  EyeIcon,
  PlusSignIcon,
  Edit01Icon,
  DeleteIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import {
  emailService,
  type SmtpConfiguration,
  type EmailTemplate,
  type UpdateSmtpConfigurationRequest,
} from "@/lib/api"
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

type Tab = "smtp" | "templates"

export default function EmailSettingsPage() {
  const { hasPermission } = usePermission()
  const [activeTab, setActiveTab] = React.useState<Tab>("smtp")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  // Permission check
  if (!hasPermission("manage_email_settings")) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  // SMTP Configurations
  const [smtpConfigs, setSmtpConfigs] = React.useState<SmtpConfiguration[]>([])
  const [selectedSmtpConfig, setSelectedSmtpConfig] = React.useState<SmtpConfiguration | null>(null)
  const [showSmtpForm, setShowSmtpForm] = React.useState(false)
  const [smtpFormData, setSmtpFormData] = React.useState({
    name: "",
    host: "",
    port: 587,
    encryption: "tls",
    username: "",
    password: "",
    from_address: "",
    from_name: "",
    is_active: false,
    is_default: false,
  })

  // Email Templates
  const [templates, setTemplates] = React.useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = React.useState<EmailTemplate | null>(null)
  const [showTemplateForm, setShowTemplateForm] = React.useState(false)
  const [templateFormData, setTemplateFormData] = React.useState({
    name: "",
    slug: "",
    subject: "",
    body_html: "",
    body_text: "",
    category: "general",
    is_active: true,
  })

  // Load data
  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadSmtpConfigs(), loadTemplates()])
    } catch (error) {
      console.error("Failed to load email data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSmtpConfigs = async () => {
    try {
      const response = await emailService.getSmtpConfigurations()
      if (response.success && response.data) {
        setSmtpConfigs(response.data)
      }
    } catch (error) {
      console.error("Failed to load SMTP configurations:", error)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await emailService.getEmailTemplates()
      if (response.success && response.data) {
        setTemplates(response.data)
      }
    } catch (error) {
      console.error("Failed to load email templates:", error)
    }
  }

  const handleSmtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (selectedSmtpConfig) {
        // For update, exclude password if empty
        const { password, ...updateDataWithoutPassword } = smtpFormData
        const updateData: UpdateSmtpConfigurationRequest = {
          ...updateDataWithoutPassword,
          ...(password && password.trim() !== '' ? { password } : {}),
        }
        const response = await emailService.updateSmtpConfiguration(selectedSmtpConfig.id, updateData)
        // Update state from response instead of reloading
        if (response.success && response.data) {
          const updatedConfig = response.data
          setSmtpConfigs(prev => prev.map(c => c.id === updatedConfig.id ? updatedConfig : c))
        }
      } else {
        const response = await emailService.createSmtpConfiguration(smtpFormData)
        // Update state from response instead of reloading
        if (response.success && response.data) {
          const newConfig = response.data
          setSmtpConfigs(prev => [...prev, newConfig])
        }
      }
      resetSmtpForm()
    } catch (error: any) {
      // Error toast is handled by API client interceptor
    } finally {
      setSaving(false)
    }
  }

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (selectedTemplate) {
        const response = await emailService.updateEmailTemplate(selectedTemplate.id, templateFormData)
        // Update state from response instead of reloading
        if (response.success && response.data) {
          const updatedTemplate = response.data
          setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t))
        }
      } else {
        const response = await emailService.createEmailTemplate(templateFormData)
        // Update state from response instead of reloading
        if (response.success && response.data) {
          const newTemplate = response.data
          setTemplates(prev => [...prev, newTemplate])
        }
      }
      resetTemplateForm()
    } catch (error: any) {
      // Error toast is handled by API client interceptor
    } finally {
      setSaving(false)
    }
  }

  const resetSmtpForm = () => {
    setSelectedSmtpConfig(null)
    setShowSmtpForm(false)
    setSmtpFormData({
      name: "",
      host: "",
      port: 587,
      encryption: "tls",
      username: "",
      password: "",
      from_address: "",
      from_name: "",
      is_active: false,
      is_default: false,
    })
  }

  const resetTemplateForm = () => {
    setSelectedTemplate(null)
    setShowTemplateForm(false)
    setTemplateFormData({
      name: "",
      slug: "",
      subject: "",
      body_html: "",
      body_text: "",
      category: "general",
      is_active: true,
    })
  }

  const editSmtpConfig = (config: SmtpConfiguration) => {
    setSelectedSmtpConfig(config)
    setSmtpFormData({
      name: config.name,
      host: config.host,
      port: config.port,
      encryption: config.encryption,
      username: config.username,
      password: "", // Don't show password
      from_address: config.from_address,
      from_name: config.from_name || "",
      is_active: config.is_active,
      is_default: config.is_default,
    })
    setShowSmtpForm(true)
  }

  const editTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setTemplateFormData({
      name: template.name,
      slug: template.slug,
      subject: template.subject,
      body_html: template.body_html,
      body_text: template.body_text || "",
      category: template.category,
      is_active: template.is_active,
    })
    setShowTemplateForm(true)
  }

  const deleteSmtpConfig = async (id: number) => {
    if (!confirm("Are you sure you want to delete this SMTP configuration?")) return
    try {
      const response = await emailService.deleteSmtpConfiguration(id)
      if (response.success) {
        setSmtpConfigs((prev) => prev.filter((c) => c.id !== id))
      }
    } catch (error: any) {
      console.error("Failed to delete SMTP configuration:", error)
    }
  }

  const deleteTemplate = async (id: number) => {
    if (!confirm("Are you sure you want to delete this email template?")) return
    try {
      const response = await emailService.deleteEmailTemplate(id)
      if (response.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== id))
      }
    } catch (error: any) {
      console.error("Failed to delete email template:", error)
    }
  }

  const setDefaultSmtp = async (id: number) => {
    try {
      const response = await emailService.setDefaultSmtpConfiguration(id)
      if (response.success && response.data) {
        // Update the config in state, marking it as default and others as not default
        setSmtpConfigs((prev) => prev.map((c) => ({
          ...c,
          is_default: c.id === id,
        })))
      }
    } catch (error: any) {
      console.error("Failed to set default SMTP:", error)
    }
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={Mail01Icon} className="size-8" />
            Email Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure SMTP settings and manage email templates
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("smtp")}
            className={cn(
              "px-4 py-2 font-medium border-b-2 transition-colors",
              activeTab === "smtp"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            SMTP Configuration
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={cn(
              "px-4 py-2 font-medium border-b-2 transition-colors",
              activeTab === "templates"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Email Templates
          </button>
        </div>

        {/* SMTP Configuration Tab */}
        {activeTab === "smtp" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">SMTP Configurations</h2>
              <Button onClick={() => {
                resetSmtpForm()
                setShowSmtpForm(true)
              }}>
                <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                Add SMTP Configuration
              </Button>
            </div>

            {/* SMTP Form */}
            {showSmtpForm && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedSmtpConfig ? "Edit" : "Create"} SMTP Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSmtpSubmit} className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Name</FieldLabel>
                        <FieldContent>
                          <Input
                            value={smtpFormData.name}
                            onChange={(e) =>
                              setSmtpFormData({ ...smtpFormData, name: e.target.value })
                            }
                            required
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Host</FieldLabel>
                        <FieldContent>
                          <Input
                            value={smtpFormData.host}
                            onChange={(e) =>
                              setSmtpFormData({ ...smtpFormData, host: e.target.value })
                            }
                            required
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Port</FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            value={smtpFormData.port}
                            onChange={(e) =>
                              setSmtpFormData({
                                ...smtpFormData,
                                port: parseInt(e.target.value) || 587,
                              })
                            }
                            required
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Encryption</FieldLabel>
                        <FieldContent>
                          <Select
                            value={smtpFormData.encryption}
                            onValueChange={(value) =>
                              setSmtpFormData({ ...smtpFormData, encryption: value || "tls" })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tls">TLS</SelectItem>
                              <SelectItem value="ssl">SSL</SelectItem>
                            </SelectContent>
                          </Select>
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Username</FieldLabel>
                        <FieldContent>
                          <Input
                            value={smtpFormData.username}
                            onChange={(e) =>
                              setSmtpFormData({ ...smtpFormData, username: e.target.value })
                            }
                            required
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Password</FieldLabel>
                        <FieldContent>
                          <PasswordInput
                            value={smtpFormData.password}
                            onChange={(e) =>
                              setSmtpFormData({ ...smtpFormData, password: e.target.value })
                            }
                            required={!selectedSmtpConfig}
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>From Address</FieldLabel>
                        <FieldContent>
                          <Input
                            type="email"
                            value={smtpFormData.from_address}
                            onChange={(e) =>
                              setSmtpFormData({
                                ...smtpFormData,
                                from_address: e.target.value,
                              })
                            }
                            required
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>From Name</FieldLabel>
                        <FieldContent>
                          <Input
                            value={smtpFormData.from_name}
                            onChange={(e) =>
                              setSmtpFormData({ ...smtpFormData, from_name: e.target.value })
                            }
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel className="flex items-center justify-between">
                          <span>Active</span>
                          <Toggle
                            checked={smtpFormData.is_active}
                            onCheckedChange={(checked) =>
                              setSmtpFormData({ ...smtpFormData, is_active: checked })
                            }
                          />
                        </FieldLabel>
                      </Field>
                      <Field>
                        <FieldLabel className="flex items-center justify-between">
                          <span>Default</span>
                          <Toggle
                            checked={smtpFormData.is_default}
                            onCheckedChange={(checked) =>
                              setSmtpFormData({ ...smtpFormData, is_default: checked })
                            }
                          />
                        </FieldLabel>
                      </Field>
                    </FieldGroup>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetSmtpForm}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* SMTP Configurations List */}
            <div className="space-y-4">
              {smtpConfigs.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No SMTP configurations found. Create one to get started.
                  </CardContent>
                </Card>
              ) : (
                smtpConfigs.map((config) => (
                  <Card key={config.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{config.name}</h3>
                            {config.is_default && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                            {config.is_active ? (
                              <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                                Active
                              </span>
                            ) : (
                              <span className="text-xs bg-gray-500/10 text-gray-500 px-2 py-1 rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {config.host}:{config.port} ({config.encryption.toUpperCase()})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            From: {config.from_address}
                            {config.from_name && ` (${config.from_name})`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!config.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDefaultSmtp(config.id)}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editSmtpConfig(config)}
                          >
                            <HugeiconsIcon icon={Edit01Icon} className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteSmtpConfig(config.id)}
                          >
                            <HugeiconsIcon icon={DeleteIcon} className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Email Templates Tab */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Email Templates</h2>
              <Button onClick={() => {
                resetTemplateForm()
                setShowTemplateForm(true)
              }}>
                <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                Create Template
              </Button>
            </div>

            {/* Template Form */}
            {showTemplateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedTemplate ? "Edit" : "Create"} Email Template
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTemplateSubmit} className="space-y-4">
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Name</FieldLabel>
                        <FieldContent>
                          <Input
                            value={templateFormData.name}
                            onChange={(e) =>
                              setTemplateFormData({
                                ...templateFormData,
                                name: e.target.value,
                              })
                            }
                            required
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Slug</FieldLabel>
                        <FieldContent>
                          <Input
                            value={templateFormData.slug}
                            onChange={(e) =>
                              setTemplateFormData({
                                ...templateFormData,
                                slug: e.target.value,
                              })
                            }
                            placeholder="auto-generated from name"
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Subject</FieldLabel>
                        <FieldContent>
                          <Input
                            value={templateFormData.subject}
                            onChange={(e) =>
                              setTemplateFormData({
                                ...templateFormData,
                                subject: e.target.value,
                              })
                            }
                            required
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Category</FieldLabel>
                        <FieldContent>
                          <Select
                            value={templateFormData.category}
                            onValueChange={(value) =>
                              setTemplateFormData({
                                ...templateFormData,
                                category: value || "general",
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="notification">Notification</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                            </SelectContent>
                          </Select>
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>HTML Body</FieldLabel>
                        <FieldContent>
                          <textarea
                            className="w-full min-h-[200px] p-2 border rounded-md"
                            value={templateFormData.body_html}
                            onChange={(e) =>
                              setTemplateFormData({
                                ...templateFormData,
                                body_html: e.target.value,
                              })
                            }
                            required
                            placeholder="Use {{variable}} for template variables"
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Plain Text Body (Optional)</FieldLabel>
                        <FieldContent>
                          <textarea
                            className="w-full min-h-[150px] p-2 border rounded-md"
                            value={templateFormData.body_text}
                            onChange={(e) =>
                              setTemplateFormData({
                                ...templateFormData,
                                body_text: e.target.value,
                              })
                            }
                            placeholder="Plain text version of the email"
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel className="flex items-center justify-between">
                          <span>Active</span>
                          <Toggle
                            checked={templateFormData.is_active}
                            onCheckedChange={(checked) =>
                              setTemplateFormData({
                                ...templateFormData,
                                is_active: checked,
                              })
                            }
                          />
                        </FieldLabel>
                      </Field>
                    </FieldGroup>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetTemplateForm}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Templates List */}
            <div className="space-y-4">
              {templates.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No email templates found. Create one to get started.
                  </CardContent>
                </Card>
              ) : (
                templates.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{template.name}</h3>
                            {template.is_active ? (
                              <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                                Active
                              </span>
                            ) : (
                              <span className="text-xs bg-gray-500/10 text-gray-500 px-2 py-1 rounded">
                                Inactive
                              </span>
                            )}
                            <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded">
                              {template.category}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Slug: {template.slug}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Subject: {template.subject}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editTemplate(template)}
                          >
                            <HugeiconsIcon icon={Edit01Icon} className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <HugeiconsIcon icon={DeleteIcon} className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  )
}
