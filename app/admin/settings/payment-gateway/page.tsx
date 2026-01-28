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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CreditCardIcon,
  PlusSignIcon,
  EditIcon,
  DeleteIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  File01Icon,
  MoreVerticalCircle01Icon,
  EyeIcon,
  SettingsIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import {
  paymentGatewayService,
  invoiceTemplateService,
  type PaymentGateway,
  type InvoiceTemplate,
} from "@/lib/api"
import { toast } from "@/lib/toast"
import { usePermission } from "@/lib/hooks/use-permission"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
// Toggle component
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

type Tab = "gateways" | "templates"

function PaymentGatewayPageContent() {
  const { hasPermission } = usePermission()
  const [activeTab, setActiveTab] = React.useState<Tab>("gateways")
  const [gateways, setGateways] = React.useState<PaymentGateway[]>([])
  const [templates, setTemplates] = React.useState<InvoiceTemplate[]>([])
  const [loading, setLoading] = React.useState(true)
  const [templatesLoading, setTemplatesLoading] = React.useState(false)
  const [gatewayFilter, setGatewayFilter] = React.useState<string>("all")
  const [templateFilter, setTemplateFilter] = React.useState<string>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [templatesPage, setTemplatesPage] = React.useState(1)
  const [pagination, setPagination] = React.useState<any>(null)
  const [templatesPagination, setTemplatesPagination] = React.useState<any>(null)

  // Dialog states
  const [createGatewayDialogOpen, setCreateGatewayDialogOpen] = React.useState(false)
  const [editGatewayDialogOpen, setEditGatewayDialogOpen] = React.useState(false)
  const [deleteGatewayDialogOpen, setDeleteGatewayDialogOpen] = React.useState(false)
  const [selectedGateway, setSelectedGateway] = React.useState<PaymentGateway | null>(null)
  const [gatewayFormData, setGatewayFormData] = React.useState({
    name: "",
    display_name: "",
    is_active: false,
    is_test_mode: true,
    description: "",
    credentials: {} as Record<string, any>,
  })
  const [gatewayFormErrors, setGatewayFormErrors] = React.useState<Record<string, string>>({})

  const [createTemplateDialogOpen, setCreateTemplateDialogOpen] = React.useState(false)
  const [editTemplateDialogOpen, setEditTemplateDialogOpen] = React.useState(false)
  const [deleteTemplateDialogOpen, setDeleteTemplateDialogOpen] = React.useState(false)
  const [selectedTemplate, setSelectedTemplate] = React.useState<InvoiceTemplate | null>(null)
  const [templateFormData, setTemplateFormData] = React.useState({
    name: "",
    slug: "",
    description: "",
    header_html: "",
    footer_html: "",
    settings: {} as Record<string, any>,
    is_active: true,
    is_default: false,
  })

  const canManageGateways = hasPermission("manage_payment_gateways")
  const canEditInvoices = hasPermission("edit_invoices")

  React.useEffect(() => {
    if (activeTab === "gateways" && canManageGateways) {
      loadGateways()
    }
    if (activeTab === "templates" && canEditInvoices) {
      loadTemplates()
    }
  }, [activeTab, canManageGateways, canEditInvoices, gatewayFilter, templateFilter, currentPage, templatesPage])

  const loadGateways = async () => {
    try {
      setLoading(true)
      const response = await paymentGatewayService.getGateways({
        is_active: gatewayFilter !== "all" ? gatewayFilter === "active" : undefined,
        per_page: 15,
        page: currentPage,
      })
      if (response.success) {
        const items = Array.isArray(response.data) ? response.data : []
        setGateways(items)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      toast.error("Failed to load payment gateways")
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true)
      const response = await invoiceTemplateService.getTemplates({
        is_active: templateFilter === "active" ? true : templateFilter === "inactive" ? false : undefined,
        is_default: templateFilter === "default" ? true : undefined,
        per_page: 15,
        page: templatesPage,
      })
      if (response.success) {
        const items = Array.isArray(response.data) ? response.data : []
        setTemplates(items)
        if (response.pagination) {
          setTemplatesPagination(response.pagination)
        }
      }
    } catch (error) {
      toast.error("Failed to load invoice templates")
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleCreateGateway = async (e: React.FormEvent) => {
    e.preventDefault()
    setGatewayFormErrors({})
    
    // Validate credentials are not empty
    const credentialsKeys = Object.keys(gatewayFormData.credentials).filter(
      key => gatewayFormData.credentials[key] && gatewayFormData.credentials[key].trim() !== ""
    )
    
    if (credentialsKeys.length === 0) {
      setGatewayFormErrors({ credentials: "At least one credential field is required" })
      toast.error("Please provide at least one credential")
      return
    }
    
    try {
      const response = await paymentGatewayService.createGateway({
        name: gatewayFormData.name,
        display_name: gatewayFormData.display_name,
        is_active: gatewayFormData.is_active,
        is_test_mode: gatewayFormData.is_test_mode,
        credentials: gatewayFormData.credentials,
        description: gatewayFormData.description || undefined,
      })
      if (response.success && response.data) {
        toast.success("Payment gateway configured successfully")
        // Update state from response instead of reloading
        const newGateway = response.data
        setGateways(prev => [...prev, newGateway])
        resetGatewayForm()
        setCreateGatewayDialogOpen(false)
      }
    } catch (error: any) {
      
      // Handle validation errors
      if (error.errors) {
        const fieldErrors: Record<string, string> = {}
        Object.keys(error.errors).forEach((key) => {
          const messages = error.errors[key]
          fieldErrors[key] = Array.isArray(messages) ? messages[0] : messages
        })
        setGatewayFormErrors(fieldErrors)
        
        // Show toast with first error
        const firstError = Object.values(fieldErrors)[0]
        if (firstError) {
          toast.error(firstError)
        }
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error("Failed to configure payment gateway")
      }
    }
  }

  const handleUpdateGateway = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGateway) return
    setGatewayFormErrors({})
    try {
      // Only send credentials if they have values (filter out empty strings)
      const credentialsToSend: Record<string, any> = {}
      Object.keys(gatewayFormData.credentials).forEach((key) => {
        const value = gatewayFormData.credentials[key]
        if (value && value.trim() !== "") {
          credentialsToSend[key] = value
        }
      })
      
      const updateData: any = {
        display_name: gatewayFormData.display_name,
        is_active: gatewayFormData.is_active,
        is_test_mode: gatewayFormData.is_test_mode,
        description: gatewayFormData.description || undefined,
      }
      
      // Only include credentials if there are any non-empty values
      if (Object.keys(credentialsToSend).length > 0) {
        updateData.credentials = credentialsToSend
      }
      
      const response = await paymentGatewayService.updateGateway(selectedGateway.id, updateData)
      if (response.success && response.data) {
        toast.success("Payment gateway updated successfully")
        setGateways((prev) => prev.map((g) => g.id === selectedGateway.id ? response.data! : g))
        resetGatewayForm()
        setEditGatewayDialogOpen(false)
      }
    } catch (error: any) {
      
      // Handle validation errors
      if (error.errors) {
        const fieldErrors: Record<string, string> = {}
        Object.keys(error.errors).forEach((key) => {
          const messages = error.errors[key]
          fieldErrors[key] = Array.isArray(messages) ? messages[0] : messages
        })
        setGatewayFormErrors(fieldErrors)
        
        // Show toast with first error
        const firstError = Object.values(fieldErrors)[0]
        if (firstError) {
          toast.error(firstError)
        }
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error("Failed to update payment gateway")
      }
    }
  }

  const handleDeleteGateway = async () => {
    if (!selectedGateway) return
    try {
      const response = await paymentGatewayService.deleteGateway(selectedGateway.id)
      if (response.success) {
        toast.success("Payment gateway deleted successfully")
        setGateways((prev) => prev.filter((g) => g.id !== selectedGateway.id))
        setDeleteGatewayDialogOpen(false)
        setSelectedGateway(null)
      }
    } catch (error: any) {
      console.error("Failed to delete gateway:", error)
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await invoiceTemplateService.createTemplate({
        name: templateFormData.name,
        slug: templateFormData.slug,
        description: templateFormData.description || undefined,
        header_html: templateFormData.header_html || undefined,
        footer_html: templateFormData.footer_html || undefined,
        settings: templateFormData.settings || undefined,
        is_active: templateFormData.is_active,
        is_default: templateFormData.is_default,
      })
      if (response.success && response.data) {
        toast.success("Invoice template created successfully")
        setTemplates((prev) => [response.data!, ...prev])
        resetTemplateForm()
        setCreateTemplateDialogOpen(false)
      }
    } catch (error: any) {
      console.error("Failed to create template:", error)
    }
  }

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTemplate) return
    try {
      const response = await invoiceTemplateService.updateTemplate(selectedTemplate.id, {
        name: templateFormData.name,
        slug: templateFormData.slug,
        description: templateFormData.description || undefined,
        header_html: templateFormData.header_html || undefined,
        footer_html: templateFormData.footer_html || undefined,
        settings: templateFormData.settings || undefined,
        is_active: templateFormData.is_active,
        is_default: templateFormData.is_default,
      })
      if (response.success && response.data) {
        toast.success("Invoice template updated successfully")
        setTemplates((prev) => prev.map((t) => t.id === selectedTemplate.id ? response.data! : t))
        resetTemplateForm()
        setEditTemplateDialogOpen(false)
      }
    } catch (error: any) {
      console.error("Failed to update template:", error)
    }
  }

  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return
    try {
      const response = await invoiceTemplateService.deleteTemplate(selectedTemplate.id)
      if (response.success) {
        toast.success("Invoice template deleted successfully")
        setTemplates((prev) => prev.filter((t) => t.id !== selectedTemplate.id))
        setDeleteTemplateDialogOpen(false)
        setSelectedTemplate(null)
      }
    } catch (error: any) {
      console.error("Failed to delete template:", error)
    }
  }

  const resetGatewayForm = () => {
    setGatewayFormData({
      name: "",
      display_name: "",
      is_active: false,
      is_test_mode: true,
      description: "",
      credentials: {},
    })
    setGatewayFormErrors({})
    setSelectedGateway(null)
  }

  const resetTemplateForm = () => {
    setTemplateFormData({
      name: "",
      slug: "",
      description: "",
      header_html: "",
      footer_html: "",
      settings: {},
      is_active: true,
      is_default: false,
    })
    setSelectedTemplate(null)
  }

  const openEditGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway)
    
    // Ensure mutual exclusivity: if both are true, disable test mode (safer)
    let isActive = gateway.is_active
    let isTestMode = gateway.is_test_mode
    
    if (isActive && isTestMode) {
      isTestMode = false // Disable test mode if active
    }
    
    setGatewayFormData({
      name: gateway.name,
      display_name: gateway.display_name,
      is_active: isActive,
      is_test_mode: isTestMode,
      description: gateway.description || "",
      credentials: {}, // Don't show credentials for security
    })
    setEditGatewayDialogOpen(true)
  }

  const openEditTemplate = (template: InvoiceTemplate) => {
    setSelectedTemplate(template)
    setTemplateFormData({
      name: template.name,
      slug: template.slug,
      description: template.description || "",
      header_html: template.header_html || "",
      footer_html: template.footer_html || "",
      settings: template.settings || {},
      is_active: template.is_active,
      is_default: template.is_default,
    })
    setEditTemplateDialogOpen(true)
  }

  const toggleTemplateActive = async (template: InvoiceTemplate) => {
    try {
      const response = await invoiceTemplateService.updateTemplate(template.id, {
        is_active: !template.is_active,
      })
      if (response.success) {
        toast.success(`Template ${template.is_active ? "disabled" : "enabled"} successfully`)
        await loadTemplates()
      }
    } catch (error) {
      toast.error("Failed to update template")
    }
  }

  const setDefaultTemplate = async (template: InvoiceTemplate) => {
    try {
      const response = await invoiceTemplateService.updateTemplate(template.id, {
        is_default: true,
      })
      if (response.success) {
        toast.success("Default template updated")
        await loadTemplates()
      }
    } catch (error) {
      toast.error("Failed to set default template")
    }
  }

  const getCredentialsForGateway = (gatewayName: string) => {
    if (gatewayName === "stripe") {
      return {
        test_secret_key: "",
        live_secret_key: "",
      }
    } else if (gatewayName === "paypal") {
      return {
        test_client_id: "",
        test_client_secret: "",
        live_client_id: "",
        live_client_secret: "",
      }
    }
    return {}
  }

  const updateGatewayCredentials = (key: string, value: string) => {
    setGatewayFormData(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [key]: value,
      },
    }))
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Gateway</h1>
            <p className="text-muted-foreground">
              Manage payment gateways and invoice templates
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("gateways")}
            className={cn(
              "px-4 py-2 font-medium border-b-2 transition-colors",
              activeTab === "gateways"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Payment Gateways
          </button>
          {canEditInvoices && (
            <button
              onClick={() => setActiveTab("templates")}
              className={cn(
                "px-4 py-2 font-medium border-b-2 transition-colors",
                activeTab === "templates"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Invoice Templates
            </button>
          )}
        </div>

        {/* Payment Gateways Tab */}
        {activeTab === "gateways" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Gateways</CardTitle>
                    <CardDescription>
                      Configure and manage payment gateway integrations
                    </CardDescription>
                  </div>
                  {canManageGateways && (
                    <Dialog open={createGatewayDialogOpen} onOpenChange={setCreateGatewayDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => resetGatewayForm()}>
                          <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                          Configure Gateway
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Configure Payment Gateway</DialogTitle>
                          <DialogDescription>
                            Set up a new payment gateway integration
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateGateway}>
                          <div className="space-y-4 py-4">
                            <FieldGroup>
                              <FieldLabel>Gateway</FieldLabel>
                              <FieldContent>
                                <Select
                                  value={gatewayFormData.name}
                                  onValueChange={(value) => {
                                    if (value) {
                                      setGatewayFormData(prev => ({
                                        ...prev,
                                        name: value,
                                        display_name: value === "stripe" ? "Stripe" : value === "paypal" ? "PayPal" : "",
                                        credentials: getCredentialsForGateway(value),
                                      }))
                                      // Clear error when field changes
                                      if (gatewayFormErrors.name) {
                                        setGatewayFormErrors(prev => {
                                          const newErrors = { ...prev }
                                          delete newErrors.name
                                          return newErrors
                                        })
                                      }
                                    }
                                  }}
                                >
                                  <SelectTrigger className={cn(gatewayFormErrors.name && "border-destructive")}>
                                    <SelectValue placeholder="Select gateway" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="stripe">Stripe</SelectItem>
                                    <SelectItem value="paypal">PayPal</SelectItem>
                                  </SelectContent>
                                </Select>
                                {gatewayFormErrors.name && (
                                  <p className="text-sm text-destructive mt-1">{gatewayFormErrors.name}</p>
                                )}
                              </FieldContent>
                            </FieldGroup>

                            <FieldGroup>
                              <FieldLabel>Display Name</FieldLabel>
                              <FieldContent>
                                <Input
                                  value={gatewayFormData.display_name}
                                  onChange={(e) => {
                                    setGatewayFormData(prev => ({ ...prev, display_name: e.target.value }))
                                    // Clear error when field changes
                                    if (gatewayFormErrors.display_name) {
                                      setGatewayFormErrors(prev => {
                                        const newErrors = { ...prev }
                                        delete newErrors.display_name
                                        return newErrors
                                      })
                                    }
                                  }}
                                  placeholder="Stripe"
                                  required
                                  className={cn(gatewayFormErrors.display_name && "border-destructive")}
                                />
                                {gatewayFormErrors.display_name && (
                                  <p className="text-sm text-destructive mt-1">{gatewayFormErrors.display_name}</p>
                                )}
                              </FieldContent>
                            </FieldGroup>

                            {gatewayFormData.name === "stripe" && (
                              <>
                                <FieldGroup>
                                  <FieldLabel>Test Secret Key</FieldLabel>
                                  <FieldContent>
                                    <Input
                                      type="password"
                                      value={gatewayFormData.credentials.test_secret_key || ""}
                                      onChange={(e) => {
                                        updateGatewayCredentials("test_secret_key", e.target.value)
                                        // Clear credentials error when field changes
                                        if (gatewayFormErrors.credentials) {
                                          setGatewayFormErrors(prev => {
                                            const newErrors = { ...prev }
                                            delete newErrors.credentials
                                            return newErrors
                                          })
                                        }
                                      }}
                                      placeholder="sk_test_..."
                                      className={cn(gatewayFormErrors.credentials && "border-destructive")}
                                    />
                                    {gatewayFormErrors.credentials && (
                                      <p className="text-sm text-destructive mt-1">{gatewayFormErrors.credentials}</p>
                                    )}
                                  </FieldContent>
                                </FieldGroup>
                                <FieldGroup>
                                  <FieldLabel>Live Secret Key</FieldLabel>
                                  <FieldContent>
                                    <Input
                                      type="password"
                                      value={gatewayFormData.credentials.live_secret_key || ""}
                                      onChange={(e) => {
                                        updateGatewayCredentials("live_secret_key", e.target.value)
                                        // Clear credentials error when field changes
                                        if (gatewayFormErrors.credentials) {
                                          setGatewayFormErrors(prev => {
                                            const newErrors = { ...prev }
                                            delete newErrors.credentials
                                            return newErrors
                                          })
                                        }
                                      }}
                                      placeholder="sk_live_..."
                                      className={cn(gatewayFormErrors.credentials && "border-destructive")}
                                    />
                                  </FieldContent>
                                </FieldGroup>
                              </>
                            )}

                            {gatewayFormData.name === "paypal" && (
                              <>
                                <FieldGroup>
                                  <FieldLabel>Test Client ID</FieldLabel>
                                  <FieldContent>
                                    <Input
                                      value={gatewayFormData.credentials.test_client_id || ""}
                                      onChange={(e) => {
                                        updateGatewayCredentials("test_client_id", e.target.value)
                                        // Clear credentials error when field changes
                                        if (gatewayFormErrors.credentials) {
                                          setGatewayFormErrors(prev => {
                                            const newErrors = { ...prev }
                                            delete newErrors.credentials
                                            return newErrors
                                          })
                                        }
                                      }}
                                      placeholder="Test Client ID"
                                      className={cn(gatewayFormErrors.credentials && "border-destructive")}
                                    />
                                    {gatewayFormErrors.credentials && (
                                      <p className="text-sm text-destructive mt-1">{gatewayFormErrors.credentials}</p>
                                    )}
                                  </FieldContent>
                                </FieldGroup>
                                <FieldGroup>
                                  <FieldLabel>Test Client Secret</FieldLabel>
                                  <FieldContent>
                                    <Input
                                      type="password"
                                      value={gatewayFormData.credentials.test_client_secret || ""}
                                      onChange={(e) => {
                                        updateGatewayCredentials("test_client_secret", e.target.value)
                                        // Clear credentials error when field changes
                                        if (gatewayFormErrors.credentials) {
                                          setGatewayFormErrors(prev => {
                                            const newErrors = { ...prev }
                                            delete newErrors.credentials
                                            return newErrors
                                          })
                                        }
                                      }}
                                      placeholder="Test Client Secret"
                                      className={cn(gatewayFormErrors.credentials && "border-destructive")}
                                    />
                                  </FieldContent>
                                </FieldGroup>
                                <FieldGroup>
                                  <FieldLabel>Live Client ID</FieldLabel>
                                  <FieldContent>
                                    <Input
                                      value={gatewayFormData.credentials.live_client_id || ""}
                                      onChange={(e) => {
                                        updateGatewayCredentials("live_client_id", e.target.value)
                                        // Clear credentials error when field changes
                                        if (gatewayFormErrors.credentials) {
                                          setGatewayFormErrors(prev => {
                                            const newErrors = { ...prev }
                                            delete newErrors.credentials
                                            return newErrors
                                          })
                                        }
                                      }}
                                      placeholder="Live Client ID"
                                      className={cn(gatewayFormErrors.credentials && "border-destructive")}
                                    />
                                  </FieldContent>
                                </FieldGroup>
                                <FieldGroup>
                                  <FieldLabel>Live Client Secret</FieldLabel>
                                  <FieldContent>
                                    <Input
                                      type="password"
                                      value={gatewayFormData.credentials.live_client_secret || ""}
                                      onChange={(e) => {
                                        updateGatewayCredentials("live_client_secret", e.target.value)
                                        // Clear credentials error when field changes
                                        if (gatewayFormErrors.credentials) {
                                          setGatewayFormErrors(prev => {
                                            const newErrors = { ...prev }
                                            delete newErrors.credentials
                                            return newErrors
                                          })
                                        }
                                      }}
                                      placeholder="Live Client Secret"
                                      className={cn(gatewayFormErrors.credentials && "border-destructive")}
                                    />
                                  </FieldContent>
                                </FieldGroup>
                              </>
                            )}

                            <FieldGroup>
                              <div className="flex items-center justify-between">
                                <div>
                                  <FieldLabel>Active</FieldLabel>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Cannot be active while in test mode
                                  </p>
                                </div>
                                <Toggle
                                  checked={gatewayFormData.is_active}
                                  disabled={gatewayFormData.is_test_mode}
                                  onCheckedChange={(checked) => {
                                    if (checked && gatewayFormData.is_test_mode) {
                                      toast.error("Cannot activate gateway while in test mode. Please disable test mode first.")
                                      return
                                    }
                                    setGatewayFormData(prev => ({ ...prev, is_active: checked }))
                                  }}
                                />
                              </div>
                            </FieldGroup>

                            <FieldGroup>
                              <div className="flex items-center justify-between">
                                <div>
                                  <FieldLabel>Test Mode</FieldLabel>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Cannot be in test mode when active
                                  </p>
                                </div>
                                <Toggle
                                  checked={gatewayFormData.is_test_mode}
                                  disabled={gatewayFormData.is_active}
                                  onCheckedChange={(checked) => {
                                    if (checked && gatewayFormData.is_active) {
                                      toast.error("Cannot enable test mode while gateway is active. Please deactivate first.")
                                      return
                                    }
                                    setGatewayFormData(prev => ({ ...prev, is_test_mode: checked }))
                                  }}
                                />
                              </div>
                            </FieldGroup>

                            <FieldGroup>
                              <FieldLabel>Description</FieldLabel>
                              <FieldContent>
                                <Textarea
                                  value={gatewayFormData.description}
                                  onChange={(e) => setGatewayFormData(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Gateway description"
                                  rows={3}
                                />
                              </FieldContent>
                            </FieldGroup>
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateGatewayDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Configure Gateway</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <Select value={gatewayFilter} onValueChange={(value) => setGatewayFilter(value || "all")}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : gateways.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No payment gateways configured
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Gateway</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Ready</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gateways.map((gateway) => (
                        <TableRow key={gateway.id}>
                          <TableCell>
                            <div className="font-medium">{gateway.display_name}</div>
                            <div className="text-sm text-muted-foreground">{gateway.name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={gateway.is_active ? "default" : "secondary"}>
                              {gateway.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={gateway.is_test_mode ? "outline" : "default"}>
                              {gateway.is_test_mode ? "Test" : "Live"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {gateway.is_ready ? (
                              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-5 text-green-500" />
                            ) : (
                              <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-yellow-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditGateway(gateway)}>
                                  <HugeiconsIcon icon={EditIcon} className="size-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedGateway(gateway)
                                    setDeleteGatewayDialogOpen(true)
                                  }}
                                  className="text-destructive"
                                >
                                  <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {pagination && pagination.last_page > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {pagination.current_page} of {pagination.last_page}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => {
                          setCurrentPage(prev => prev - 1)
                        }}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === pagination.last_page}
                        onClick={() => {
                          setCurrentPage(prev => prev + 1)
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Invoice Templates</CardTitle>
                    <CardDescription>
                      Edit templates and enable/disable them
                    </CardDescription>
                  </div>
                  {canEditInvoices && (
                    <Dialog open={createTemplateDialogOpen} onOpenChange={setCreateTemplateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => resetTemplateForm()}>
                          <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                          Create Template
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create Invoice Template</DialogTitle>
                          <DialogDescription>
                            Create a new invoice template (HTML header/footer)
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateTemplate}>
                          <div className="space-y-4 py-4">
                            <FieldGroup>
                              <FieldLabel>Name</FieldLabel>
                              <FieldContent>
                                <Input
                                  value={templateFormData.name}
                                  onChange={(e) => setTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="Default Template"
                                  required
                                />
                              </FieldContent>
                            </FieldGroup>

                            <FieldGroup>
                              <FieldLabel>Slug</FieldLabel>
                              <FieldContent>
                                <Input
                                  value={templateFormData.slug}
                                  onChange={(e) => setTemplateFormData(prev => ({ ...prev, slug: e.target.value }))}
                                  placeholder="default-template"
                                  required
                                />
                              </FieldContent>
                            </FieldGroup>

                            <FieldGroup>
                              <FieldLabel>Description</FieldLabel>
                              <FieldContent>
                                <Textarea
                                  value={templateFormData.description}
                                  onChange={(e) => setTemplateFormData(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Short description"
                                  rows={2}
                                />
                              </FieldContent>
                            </FieldGroup>

                            <FieldGroup>
                              <FieldLabel>Header HTML</FieldLabel>
                              <FieldContent>
                                <Textarea
                                  value={templateFormData.header_html}
                                  onChange={(e) => setTemplateFormData(prev => ({ ...prev, header_html: e.target.value }))}
                                  placeholder="<div>...</div>"
                                  rows={5}
                                />
                              </FieldContent>
                            </FieldGroup>

                            <FieldGroup>
                              <FieldLabel>Footer HTML</FieldLabel>
                              <FieldContent>
                                <Textarea
                                  value={templateFormData.footer_html}
                                  onChange={(e) => setTemplateFormData(prev => ({ ...prev, footer_html: e.target.value }))}
                                  placeholder="<div>...</div>"
                                  rows={5}
                                />
                              </FieldContent>
                            </FieldGroup>

                            <FieldGroup>
                              <div className="flex items-center justify-between">
                                <FieldLabel>Active</FieldLabel>
                                <Toggle
                                  checked={templateFormData.is_active}
                                  onCheckedChange={(checked) => setTemplateFormData(prev => ({ ...prev, is_active: checked }))}
                                />
                              </div>
                            </FieldGroup>

                            <FieldGroup>
                              <div className="flex items-center justify-between">
                                <FieldLabel>Default</FieldLabel>
                                <Toggle
                                  checked={templateFormData.is_default}
                                  onCheckedChange={(checked) => setTemplateFormData(prev => ({ ...prev, is_default: checked }))}
                                />
                              </div>
                            </FieldGroup>
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateTemplateDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Create Template</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-center gap-2">
                  <Select value={templateFilter} onValueChange={(value) => setTemplateFilter(value || "all")}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter templates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="default">Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {templatesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Default</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{template.slug}</TableCell>
                          <TableCell>
                            <Badge variant={template.is_active ? "default" : "secondary"}>
                              {template.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={template.is_default ? "default" : "outline"}>
                              {template.is_default ? "Default" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                template.is_active
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {template.is_active ? "Enabled" : "Disabled"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditTemplate(template)}>
                                  <HugeiconsIcon icon={EditIcon} className="size-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                {!template.is_default && (
                                  <DropdownMenuItem onClick={() => setDefaultTemplate(template)}>
                                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 mr-2" />
                                    Set Default
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => toggleTemplateActive(template)}>
                                  <HugeiconsIcon icon={SettingsIcon} className="size-4 mr-2" />
                                  {template.is_active ? "Disable" : "Enable"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTemplate(template)
                                    setDeleteTemplateDialogOpen(true)
                                  }}
                                  className="text-destructive"
                                  disabled={template.is_default}
                                >
                                  <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {templatesPagination && templatesPagination.last_page > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {templatesPagination.current_page} of {templatesPagination.last_page}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={templatesPage === 1}
                        onClick={() => {
                          setTemplatesPage(prev => prev - 1)
                        }}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={templatesPage === templatesPagination.last_page}
                        onClick={() => {
                          setTemplatesPage(prev => prev + 1)
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
        )}

        {/* Edit Gateway Dialog */}
        <Dialog open={editGatewayDialogOpen} onOpenChange={setEditGatewayDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Payment Gateway</DialogTitle>
              <DialogDescription>
                Update payment gateway configuration
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateGateway}>
              <div className="space-y-4 py-4">
                <FieldGroup>
                  <FieldLabel>Display Name</FieldLabel>
                  <FieldContent>
                    <Input
                      value={gatewayFormData.display_name}
                      onChange={(e) => {
                        setGatewayFormData(prev => ({ ...prev, display_name: e.target.value }))
                        // Clear error when field changes
                        if (gatewayFormErrors.display_name) {
                          setGatewayFormErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.display_name
                            return newErrors
                          })
                        }
                      }}
                      required
                      className={cn(gatewayFormErrors.display_name && "border-destructive")}
                    />
                    {gatewayFormErrors.display_name && (
                      <p className="text-sm text-destructive mt-1">{gatewayFormErrors.display_name}</p>
                    )}
                  </FieldContent>
                </FieldGroup>

                {selectedGateway?.name === "stripe" && (
                  <>
                    <FieldGroup>
                      <FieldLabel>Test Secret Key</FieldLabel>
                      <FieldContent>
                        <Input
                          type="password"
                          value={gatewayFormData.credentials.test_secret_key || ""}
                          onChange={(e) => {
                            updateGatewayCredentials("test_secret_key", e.target.value)
                            // Clear credentials error when field changes
                            if (gatewayFormErrors.credentials) {
                              setGatewayFormErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.credentials
                                return newErrors
                              })
                            }
                          }}
                          placeholder="Leave empty to keep current"
                          className={cn(gatewayFormErrors.credentials && "border-destructive")}
                        />
                        {gatewayFormErrors.credentials && (
                          <p className="text-sm text-destructive mt-1">{gatewayFormErrors.credentials}</p>
                        )}
                      </FieldContent>
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel>Live Secret Key</FieldLabel>
                      <FieldContent>
                        <Input
                          type="password"
                          value={gatewayFormData.credentials.live_secret_key || ""}
                          onChange={(e) => {
                            updateGatewayCredentials("live_secret_key", e.target.value)
                            // Clear credentials error when field changes
                            if (gatewayFormErrors.credentials) {
                              setGatewayFormErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.credentials
                                return newErrors
                              })
                            }
                          }}
                          placeholder="Leave empty to keep current"
                          className={cn(gatewayFormErrors.credentials && "border-destructive")}
                        />
                      </FieldContent>
                    </FieldGroup>
                  </>
                )}

                {selectedGateway?.name === "paypal" && (
                  <>
                    <FieldGroup>
                      <FieldLabel>Test Client ID</FieldLabel>
                      <FieldContent>
                        <Input
                          value={gatewayFormData.credentials.test_client_id || ""}
                          onChange={(e) => {
                            updateGatewayCredentials("test_client_id", e.target.value)
                            // Clear credentials error when field changes
                            if (gatewayFormErrors.credentials) {
                              setGatewayFormErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.credentials
                                return newErrors
                              })
                            }
                          }}
                          placeholder="Leave empty to keep current"
                          className={cn(gatewayFormErrors.credentials && "border-destructive")}
                        />
                        {gatewayFormErrors.credentials && (
                          <p className="text-sm text-destructive mt-1">{gatewayFormErrors.credentials}</p>
                        )}
                      </FieldContent>
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel>Test Client Secret</FieldLabel>
                      <FieldContent>
                        <Input
                          type="password"
                          value={gatewayFormData.credentials.test_client_secret || ""}
                          onChange={(e) => {
                            updateGatewayCredentials("test_client_secret", e.target.value)
                            // Clear credentials error when field changes
                            if (gatewayFormErrors.credentials) {
                              setGatewayFormErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.credentials
                                return newErrors
                              })
                            }
                          }}
                          placeholder="Leave empty to keep current"
                          className={cn(gatewayFormErrors.credentials && "border-destructive")}
                        />
                      </FieldContent>
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel>Live Client ID</FieldLabel>
                      <FieldContent>
                        <Input
                          value={gatewayFormData.credentials.live_client_id || ""}
                          onChange={(e) => {
                            updateGatewayCredentials("live_client_id", e.target.value)
                            // Clear credentials error when field changes
                            if (gatewayFormErrors.credentials) {
                              setGatewayFormErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.credentials
                                return newErrors
                              })
                            }
                          }}
                          placeholder="Leave empty to keep current"
                          className={cn(gatewayFormErrors.credentials && "border-destructive")}
                        />
                      </FieldContent>
                    </FieldGroup>
                    <FieldGroup>
                      <FieldLabel>Live Client Secret</FieldLabel>
                      <FieldContent>
                        <Input
                          type="password"
                          value={gatewayFormData.credentials.live_client_secret || ""}
                          onChange={(e) => {
                            updateGatewayCredentials("live_client_secret", e.target.value)
                            // Clear credentials error when field changes
                            if (gatewayFormErrors.credentials) {
                              setGatewayFormErrors(prev => {
                                const newErrors = { ...prev }
                                delete newErrors.credentials
                                return newErrors
                              })
                            }
                          }}
                          placeholder="Leave empty to keep current"
                          className={cn(gatewayFormErrors.credentials && "border-destructive")}
                        />
                      </FieldContent>
                    </FieldGroup>
                  </>
                )}

                <FieldGroup>
                  <div className="flex items-center justify-between">
                    <div>
                      <FieldLabel>Active</FieldLabel>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Cannot be active while in test mode
                      </p>
                    </div>
                    <Toggle
                      checked={gatewayFormData.is_active}
                      disabled={gatewayFormData.is_test_mode}
                      onCheckedChange={(checked) => {
                        if (checked && gatewayFormData.is_test_mode) {
                          toast.error("Cannot activate gateway while in test mode. Please disable test mode first.")
                          return
                        }
                        setGatewayFormData(prev => ({ ...prev, is_active: checked }))
                      }}
                    />
                  </div>
                </FieldGroup>

                <FieldGroup>
                  <div className="flex items-center justify-between">
                    <div>
                      <FieldLabel>Test Mode</FieldLabel>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Cannot be in test mode when active
                      </p>
                    </div>
                    <Toggle
                      checked={gatewayFormData.is_test_mode}
                      disabled={gatewayFormData.is_active}
                      onCheckedChange={(checked) => {
                        if (checked && gatewayFormData.is_active) {
                          toast.error("Cannot enable test mode while gateway is active. Please deactivate first.")
                          return
                        }
                        setGatewayFormData(prev => ({ ...prev, is_test_mode: checked }))
                      }}
                    />
                  </div>
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Description</FieldLabel>
                  <FieldContent>
                    <Textarea
                      value={gatewayFormData.description}
                      onChange={(e) => setGatewayFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </FieldContent>
                </FieldGroup>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditGatewayDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Gateway</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Gateway Dialog */}
        <AlertDialog open={deleteGatewayDialogOpen} onOpenChange={setDeleteGatewayDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Payment Gateway</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedGateway?.display_name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteGateway} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Template Dialog */}
        <Dialog open={editTemplateDialogOpen} onOpenChange={setEditTemplateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Invoice Template</DialogTitle>
              <DialogDescription>
                Update template content and settings
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateTemplate}>
              <div className="space-y-4 py-4">
                <FieldGroup>
                  <FieldLabel>Name</FieldLabel>
                  <FieldContent>
                    <Input
                      value={templateFormData.name}
                      onChange={(e) => setTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </FieldContent>
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Slug</FieldLabel>
                  <FieldContent>
                    <Input
                      value={templateFormData.slug}
                      onChange={(e) => setTemplateFormData(prev => ({ ...prev, slug: e.target.value }))}
                      required
                    />
                  </FieldContent>
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Description</FieldLabel>
                  <FieldContent>
                    <Textarea
                      value={templateFormData.description}
                      onChange={(e) => setTemplateFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                  </FieldContent>
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Header HTML</FieldLabel>
                  <FieldContent>
                    <Textarea
                      value={templateFormData.header_html}
                      onChange={(e) => setTemplateFormData(prev => ({ ...prev, header_html: e.target.value }))}
                      rows={5}
                    />
                  </FieldContent>
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>Footer HTML</FieldLabel>
                  <FieldContent>
                    <Textarea
                      value={templateFormData.footer_html}
                      onChange={(e) => setTemplateFormData(prev => ({ ...prev, footer_html: e.target.value }))}
                      rows={5}
                    />
                  </FieldContent>
                </FieldGroup>

                <FieldGroup>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Active</FieldLabel>
                    <Toggle
                      checked={templateFormData.is_active}
                      onCheckedChange={(checked) => setTemplateFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                  </div>
                </FieldGroup>

                <FieldGroup>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Default</FieldLabel>
                    <Toggle
                      checked={templateFormData.is_default}
                      onCheckedChange={(checked) => setTemplateFormData(prev => ({ ...prev, is_default: checked }))}
                    />
                  </div>
                </FieldGroup>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditTemplateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Template</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Template Dialog */}
        <AlertDialog open={deleteTemplateDialogOpen} onOpenChange={setDeleteTemplateDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Invoice Template</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete template {selectedTemplate?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminDashboardLayout>
  )
}

export default function PaymentGatewayPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <PaymentGatewayPageContent />
    </React.Suspense>
  )
}
