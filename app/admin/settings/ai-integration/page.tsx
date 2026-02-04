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
  MachineRobotIcon,
  Analytics02Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  ClockIcon,
  Database02Icon,
  PlusSignIcon,
  EditIcon,
  DeleteIcon,
  MoreVerticalCircle01Icon,
  KeyIcon,
  EyeIcon,
  SettingsIcon,
  PlayIcon,
  RefreshIcon,
  CloudIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import {
  aiIntegrationService,
  type AiUsageStatistics,
  type AiUsageLog,
  type AiProvider,
  type AiApiKey,
  type AiApiKeyScope,
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
import { Checkbox } from "@/components/ui/checkbox"

type Tab = "overview" | "api-keys"

export default function AiIntegrationPage() {
  const { hasPermission } = usePermission()
  const [activeTab, setActiveTab] = React.useState<Tab>("overview")
  const [statistics, setStatistics] = React.useState<AiUsageStatistics | null>(null)
  const [usageLogs, setUsageLogs] = React.useState<AiUsageLog[]>([])
  const [loading, setLoading] = React.useState(true)
  const [dateRange, setDateRange] = React.useState<{ from?: string; to?: string }>({})
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pagination, setPagination] = React.useState<any>(null)

  // API Keys state
  const [apiKeys, setApiKeys] = React.useState<AiApiKey[]>([])
  const [providers, setProviders] = React.useState<AiProvider[]>([])
  const [apiKeysLoading, setApiKeysLoading] = React.useState(false)
  const [apiKeysPagination, setApiKeysPagination] = React.useState<any>(null)
  const [apiKeysPage, setApiKeysPage] = React.useState(1)
  const [providerFilter, setProviderFilter] = React.useState<string>("all")
  const [activeFilter, setActiveFilter] = React.useState<string>("all")
  const [availableScopes, setAvailableScopes] = React.useState<AiApiKeyScope[]>([])

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedApiKey, setSelectedApiKey] = React.useState<AiApiKey | null>(null)
  const [formData, setFormData] = React.useState({
    provider_id: "",
    name: "",
    api_key: "",
    api_secret: "",
    endpoint_url: "",
    organization_id: "",
    project_id: "",
    is_active: true,
    priority: 0,
    rate_limit_per_minute: "",
    rate_limit_per_day: "",
    scopes: [] as string[],
  })
  const [showApiKey, setShowApiKey] = React.useState(false)
  const [selectedProvider, setSelectedProvider] = React.useState<AiProvider | null>(null)
  const [testingApiKeyId, setTestingApiKeyId] = React.useState<number | null>(null)
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string; responseTime?: number } | null>(null)

  const canViewUsage = hasPermission("view_ai_usage")
  const canManageApiKeys = hasPermission("manage_ai_api_keys")
  const canManageProviders = hasPermission("manage_ai_providers")

  React.useEffect(() => {
    if (canViewUsage && activeTab === "overview") {
      loadStatistics()
      loadUsageLogs()
    }
    if (canManageApiKeys && activeTab === "api-keys") {
      loadProviders()
      loadApiKeys()
      loadAvailableScopes()
    }
  }, [canViewUsage, canManageApiKeys, activeTab, dateRange, statusFilter, currentPage, apiKeysPage, providerFilter, activeFilter])

  // Load providers and scopes once on mount if user has permission
  React.useEffect(() => {
    if (canManageApiKeys) {
      loadProviders()
      loadAvailableScopes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageApiKeys])


  const loadStatistics = async () => {
    try {
      const response = await aiIntegrationService.getUsageStatistics({
        date_from: dateRange.from,
        date_to: dateRange.to,
      })
      if (response.success && response.data) {
        setStatistics(response.data)
      }
    } catch (error) {
      console.error("Failed to load AI usage statistics:", error)
    }
  }

  const loadUsageLogs = async () => {
    try {
      setLoading(true)
      const response = await aiIntegrationService.getUsageLogs({
        page: currentPage,
        per_page: 15,
        status: statusFilter !== "all" ? statusFilter : undefined,
        date_from: dateRange.from,
        date_to: dateRange.to,
      })
      if (response.success) {
        // Backend paginated() returns data at root level, not nested
        const items = Array.isArray(response.data) ? response.data : []
        setUsageLogs(items)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      toast.error("Failed to load usage logs")
    } finally {
      setLoading(false)
    }
  }

  const [providersInitializing, setProvidersInitializing] = React.useState(false)

  const loadProviders = async () => {
    try {
      const response = await aiIntegrationService.getProviders()
      if (response.success && response.data) {
        setProviders(response.data || [])
      } else {
      }
    } catch (error) {
      toast.error("Failed to load providers")
    }
  }

  const loadAvailableScopes = async () => {
    try {
      const response = await aiIntegrationService.getAvailableScopes()
      if (response.success && response.data) {
        setAvailableScopes(response.data || [])
      }
    } catch (error) {
      console.error("Failed to load available scopes:", error)
    }
  }

  const initializeProviders = async () => {
    if (providersInitializing) return // Prevent multiple simultaneous initializations

    try {
      setProvidersInitializing(true)
      const response = await aiIntegrationService.initializeProviders()
      if (response.success) {
        toast.success("Providers initialized successfully")
        // Reload providers after a short delay to ensure backend has finished
        setTimeout(async () => {
          await loadProviders()
        }, 300)
      } else {
        toast.error("Failed to initialize providers")
      }
    } catch (error: any) {
      toast.error("Failed to initialize providers")
    } finally {
      setProvidersInitializing(false)
    }
  }

  const loadApiKeys = async (page: number = apiKeysPage) => {
    try {
      setApiKeysLoading(true)
      const response = await aiIntegrationService.getApiKeys({
        page: page,
        per_page: 15,
        provider_id: providerFilter !== "all" ? parseInt(providerFilter) : undefined,
        is_active: activeFilter !== "all" ? activeFilter === "active" : undefined,
      })
      if (response.success) {
        // Backend paginated() returns data at root level, not nested
        const items = Array.isArray(response.data) ? response.data : []
        setApiKeys(items)
        if (response.pagination) {
          setApiKeysPagination(response.pagination)
        }
      }
    } catch (error) {
      toast.error("Failed to load API keys")
    } finally {
      setApiKeysLoading(false)
    }
  }

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await aiIntegrationService.createApiKey({
        provider_id: parseInt(formData.provider_id),
        name: formData.name,
        api_key: formData.api_key,
        api_secret: formData.api_secret || undefined,
        endpoint_url: formData.endpoint_url || undefined,
        organization_id: formData.organization_id || undefined,
        project_id: formData.project_id || undefined,
        is_active: formData.is_active,
        priority: formData.priority,
        rate_limit_per_minute: formData.rate_limit_per_minute ? parseInt(formData.rate_limit_per_minute) : undefined,
        rate_limit_per_day: formData.rate_limit_per_day ? parseInt(formData.rate_limit_per_day) : undefined,
        scopes: formData.scopes.length > 0 ? formData.scopes : undefined,
      })
      if (response.success && response.data) {
        setApiKeys((prev) => [response.data!, ...prev])
        setApiKeysPage(1)
        resetForm()
        setCreateDialogOpen(false)
      }
    } catch (error: any) {
      console.error("Failed to create API key:", error)
    }
  }

  const handleUpdateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApiKey) return
    try {
      const response = await aiIntegrationService.updateApiKey(selectedApiKey.id, {
        name: formData.name,
        api_key: formData.api_key || undefined,
        api_secret: formData.api_secret || undefined,
        endpoint_url: formData.endpoint_url || undefined,
        organization_id: formData.organization_id || undefined,
        project_id: formData.project_id || undefined,
        is_active: formData.is_active,
        priority: formData.priority,
        rate_limit_per_minute: formData.rate_limit_per_minute ? parseInt(formData.rate_limit_per_minute) : undefined,
        rate_limit_per_day: formData.rate_limit_per_day ? parseInt(formData.rate_limit_per_day) : undefined,
        scopes: formData.scopes,
      })
      if (response.success && response.data) {
        setApiKeys((prev) => prev.map((k) => k.id === selectedApiKey.id ? response.data! : k))
        resetForm()
        setEditDialogOpen(false)
      }
    } catch (error: any) {
      console.error("Failed to update API key:", error)
    }
  }

  const handleDeleteApiKey = async () => {
    if (!selectedApiKey) return
    try {
      const response = await aiIntegrationService.deleteApiKey(selectedApiKey.id)
      if (response.success) {
        setApiKeys((prev) => prev.filter((k) => k.id !== selectedApiKey.id))
        setDeleteDialogOpen(false)
        setSelectedApiKey(null)
      }
    } catch (error: any) {
      console.error("Failed to delete API key:", error)
    }
  }

  const handleToggleApiKey = async (apiKey: AiApiKey, enable: boolean) => {
    try {
      const response = enable
        ? await aiIntegrationService.enableApiKey(apiKey.id)
        : await aiIntegrationService.disableApiKey(apiKey.id)
      if (response.success && response.data) {
        setApiKeys((prev) => prev.map((k) => k.id === apiKey.id ? response.data! : k))
      }
    } catch (error: any) {
      console.error("Failed to toggle API key:", error)
    }
  }

  const handleTestApiKey = async (apiKeyId: number) => {
    setTestingApiKeyId(apiKeyId)
    setTestResult(null)
    try {
      const response = await aiIntegrationService.testApiKey(apiKeyId)
      if (response.success && response.data) {
        setTestResult({
          success: response.data.success,
          message: response.data.success
            ? `API key is working! Response time: ${response.data.response_time_ms}ms`
            : response.data.error || 'Test failed',
          responseTime: response.data.response_time_ms,
        })
        if (response.data.success) {
          toast.success(`API key test passed! (${response.data.response_time_ms}ms)`)
        } else {
          toast.error(response.data.error || 'API key test failed')
        }
      } else {
        const errorMsg = Array.isArray(response.errors) ? response.errors[0] : (response.errors || 'Test failed')
        setTestResult({
          success: false,
          message: errorMsg,
        })
        toast.error(errorMsg || 'API key test failed')
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to test API key'
      setTestResult({
        success: false,
        message: errorMessage,
      })
      toast.error(errorMessage)
    } finally {
      setTestingApiKeyId(null)
    }
  }

  const resetForm = () => {
    setSelectedApiKey(null)
    setSelectedProvider(null)
    setFormData({
      provider_id: "",
      name: "",
      api_key: "",
      api_secret: "",
      endpoint_url: "",
      organization_id: "",
      project_id: "",
      is_active: true,
      priority: 0,
      rate_limit_per_minute: "",
      rate_limit_per_day: "",
      scopes: [],
    })
    setShowApiKey(false)
  }

  const handleProviderChange = (providerId: string | null) => {
    if (!providerId) {
      setSelectedProvider(null)
      setFormData({ ...formData, provider_id: "" })
      return
    }
    const provider = providers.find(p => p.id.toString() === providerId)
    setSelectedProvider(provider || null)
    setFormData({ ...formData, provider_id: providerId })
  }

  // Get provider-specific field requirements
  const getProviderFields = (providerSlug: string) => {
    const fields: Record<string, { required: boolean; show: boolean; label: string; placeholder: string }> = {
      endpoint_url: {
        required: providerSlug === 'azure_openai',
        show: ['azure_openai', 'openai', 'ucontents'].includes(providerSlug),
        label: providerSlug === 'ucontents' ? 'API Endpoint' : 'Endpoint URL',
        placeholder: providerSlug === 'azure_openai'
          ? 'https://your-resource.openai.azure.com'
          : providerSlug === 'ucontents'
            ? 'https://gpt.ucontents.com (default)'
            : 'Custom endpoint URL (optional)'
      },
      organization_id: {
        required: false,
        show: ['openai', 'azure_openai'].includes(providerSlug),
        label: 'Organization ID',
        placeholder: 'Organization ID (optional)'
      },
      project_id: {
        required: false,
        show: ['openai', 'azure_openai'].includes(providerSlug),
        label: 'Project ID',
        placeholder: 'Project ID (optional)'
      },
      api_secret: {
        required: false,
        show: false, // Most providers don't need this
        label: 'API Secret',
        placeholder: 'API Secret (if required)'
      }
    }
    return fields
  }

  const editApiKey = (apiKey: AiApiKey) => {
    setSelectedApiKey(apiKey)
    const provider = apiKey.provider || providers.find(p => p.id === apiKey.provider_id)
    setSelectedProvider(provider || null)
    setFormData({
      provider_id: apiKey.provider_id.toString(),
      name: apiKey.name,
      api_key: "", // Don't show existing key
      api_secret: "",
      endpoint_url: apiKey.endpoint_url || "",
      organization_id: apiKey.organization_id || "",
      project_id: apiKey.project_id || "",
      is_active: apiKey.is_active,
      priority: apiKey.priority,
      rate_limit_per_minute: apiKey.rate_limit_per_minute?.toString() || "",
      rate_limit_per_day: apiKey.rate_limit_per_day?.toString() || "",
      scopes: apiKey.scopes || [],
    })
    setEditDialogOpen(true)
  }

  const openCreateDialog = () => {
    resetForm()
    // Ensure providers are loaded (but don't wait, open dialog immediately)
    if (providers.length === 0) {
      loadProviders().catch(() => { })
    }
    setCreateDialogOpen(true)
  }

  const toggleScope = (scope: string) => {
    setFormData(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope]
    }))
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: any }> = {
      success: {
        className: "bg-green-500/10 text-green-600 dark:text-green-400",
        icon: CheckmarkCircle01Icon,
      },
      error: {
        className: "bg-red-500/10 text-red-600 dark:text-red-400",
        icon: AlertCircleIcon,
      },
      rate_limited: {
        className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        icon: ClockIcon,
      },
    }

    const variant = variants[status] || variants.error

    return (
      <Badge className={cn("gap-1", variant.className)}>
        <HugeiconsIcon icon={variant.icon} className="size-3" />
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  if (!canViewUsage && !canManageApiKeys) {
    return (
      <AdminDashboardLayout>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">You don't have permission to access AI Integration.</p>
            </div>
          </CardContent>
        </Card>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HugeiconsIcon icon={MachineRobotIcon} className="size-8" />
              AI Integration
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor AI usage, manage API keys, and view analytics
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 py-2 font-medium border-b-2 transition-colors",
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Overview
          </button>
          {canManageApiKeys && (
            <button
              onClick={() => setActiveTab("api-keys")}
              className={cn(
                "px-4 py-2 font-medium border-b-2 transition-colors",
                activeTab === "api-keys"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              API Keys
            </button>
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>

            {/* Statistics Cards */}
            {statistics && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <HugeiconsIcon icon={Analytics02Icon} className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(statistics.total_requests)}</div>
                    <p className="text-xs text-muted-foreground">
                      {statistics.successful_requests} successful
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                    <HugeiconsIcon icon={Database02Icon} className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(statistics.total_tokens)}</div>
                    <p className="text-xs text-muted-foreground">
                      Across all providers
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                    <HugeiconsIcon icon={Analytics02Icon} className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(statistics.total_cost)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Estimated cost
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statistics.total_requests > 0
                        ? Math.round((statistics.successful_requests / statistics.total_requests) * 100)
                        : 0}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {statistics.failed_requests} failed requests
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Provider Statistics */}
            {statistics && statistics.by_provider.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Usage by Provider</CardTitle>
                  <CardDescription>Breakdown of usage across AI providers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statistics.by_provider.map((provider) => (
                      <div key={provider.provider_slug} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium capitalize">{provider.provider_slug.replace("_", " ")}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(provider.requests)} requests • {formatNumber(provider.tokens)} tokens
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(provider.cost)}</div>
                          <div className="text-sm text-muted-foreground">Cost</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Model Statistics */}
            {statistics && statistics.by_model.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Usage by Model</CardTitle>
                  <CardDescription>Breakdown of usage across AI models</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statistics.by_model.map((model) => (
                      <div key={model.model} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{model.model}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(model.requests)} requests • {formatNumber(model.tokens)} tokens
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(model.cost)}</div>
                          <div className="text-sm text-muted-foreground">Cost</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Usage Logs */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <CardTitle>Usage Logs</CardTitle>
                    <CardDescription>Recent AI API calls and their status</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Input
                      type="date"
                      placeholder="From"
                      value={dateRange.from || ""}
                      onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                      className="w-full sm:w-auto"
                    />
                    <Input
                      type="date"
                      placeholder="To"
                      value={dateRange.to || ""}
                      onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                      className="w-full sm:w-auto"
                    />
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="rate_limited">Rate Limited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">Loading usage logs...</div>
                  </div>
                ) : usageLogs.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <HugeiconsIcon icon={MachineRobotIcon} className="size-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No usage logs found</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Provider</TableHead>
                          <TableHead>Model</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tokens</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Response Time</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usageLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium capitalize">
                              {log.provider_slug.replace("_", " ")}
                            </TableCell>
                            <TableCell>{log.model}</TableCell>
                            <TableCell>{getStatusBadge(log.status)}</TableCell>
                            <TableCell>{formatNumber(log.total_tokens)}</TableCell>
                            <TableCell>{formatCurrency(log.cost)}</TableCell>
                            <TableCell>
                              {log.response_time_ms
                                ? `${log.response_time_ms}ms`
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(log.created_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {pagination && pagination.last_page > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                          Showing {pagination.current_page} of {pagination.last_page} pages
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current_page === 1}
                            onClick={() => setCurrentPage(pagination.current_page - 1)}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.current_page === pagination.last_page}
                            onClick={() => setCurrentPage(pagination.current_page + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* API Keys Tab */}
        {activeTab === "api-keys" && canManageApiKeys && (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage AI provider API keys</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={initializeProviders} disabled={providersInitializing}>
                      <HugeiconsIcon icon={RefreshIcon} className={cn("size-4 mr-2", providersInitializing && "animate-spin")} />
                      Sync Providers
                    </Button>
                    <Button onClick={openCreateDialog}>
                      <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                      Add API Key
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <Select value={providerFilter} onValueChange={(value) => setProviderFilter(value || "all")}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id.toString()}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value || "all")}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {apiKeysLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">Loading API keys...</div>
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <HugeiconsIcon icon={KeyIcon} className="size-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">No API keys found</p>
                      <Button onClick={openCreateDialog}>
                        <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                        Add Your First API Key
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Scopes</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Requests</TableHead>
                          <TableHead>Tokens</TableHead>
                          <TableHead>Last Used</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apiKeys.map((apiKey) => (
                          <TableRow key={apiKey.id}>
                            <TableCell className="font-medium">{apiKey.name}</TableCell>
                            <TableCell>
                              {apiKey.provider ? (
                                <Badge variant="outline">{apiKey.provider.name}</Badge>
                              ) : (
                                "N/A"
                              )}
                            </TableCell>
                            <TableCell>
                              {apiKey.scopes && apiKey.scopes.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {apiKey.scope_names?.slice(0, 2).map((name, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {name}
                                    </Badge>
                                  ))}
                                  {apiKey.scopes.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{apiKey.scopes.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">All Tasks</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  apiKey.is_active
                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                    : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                                )}
                              >
                                {apiKey.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>{apiKey.priority}</TableCell>
                            <TableCell>{formatNumber(apiKey.total_requests)}</TableCell>
                            <TableCell>{formatNumber(apiKey.total_tokens)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {apiKey.last_used_at ? formatDate(apiKey.last_used_at) : "Never"}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleToggleApiKey(apiKey, !apiKey.is_active)}
                                  >
                                    <HugeiconsIcon
                                      icon={apiKey.is_active ? SettingsIcon : CheckmarkCircle01Icon}
                                      className="size-4 mr-2"
                                    />
                                    {apiKey.is_active ? "Disable" : "Enable"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleTestApiKey(apiKey.id)}>
                                    <HugeiconsIcon icon={PlayIcon} className="size-4 mr-2" />
                                    Test Connection
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => editApiKey(apiKey)}>
                                    <HugeiconsIcon icon={EditIcon} className="size-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedApiKey(apiKey)
                                      setDeleteDialogOpen(true)
                                    }}
                                    className="text-red-600"
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
                    {apiKeysPagination && apiKeysPagination.last_page > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                          Showing {apiKeysPagination.current_page} of {apiKeysPagination.last_page} pages
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={apiKeysPagination.current_page === 1}
                            onClick={() => setApiKeysPage(apiKeysPagination.current_page - 1)}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={apiKeysPagination.current_page === apiKeysPagination.last_page}
                            onClick={() => setApiKeysPage(apiKeysPagination.current_page + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Create API Key Dialog */}
            <AlertDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <AlertDialogContent className="max-h-[90vh] overflow-y-auto" style={{ maxWidth: 585 }}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Add API Key</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter the details for your new API key.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleCreateApiKey}>
                  <div className="space-y-4">
                    <Field>
                      <FieldLabel>Provider *</FieldLabel>
                      <FieldContent>
                        {providers.length === 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              No providers found. Please initialize providers first.
                            </p>
                            <Button
                              type="button"
                              onClick={initializeProviders}
                              variant="outline"
                              disabled={providersInitializing}
                            >
                              {providersInitializing ? "Initializing..." : "Initialize Providers"}
                            </Button>
                          </div>
                        ) : (
                          <Select
                            value={formData.provider_id}
                            onValueChange={(value) => handleProviderChange(value || "")}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                              {providers.map((provider) => (
                                <SelectItem key={provider.id} value={provider.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    {provider.slug === 'openai' && <HugeiconsIcon icon={MachineRobotIcon} className="size-4" />}
                                    {provider.slug === 'anthropic' && <HugeiconsIcon icon={MachineRobotIcon} className="size-4" />}
                                    {provider.slug === 'google' && <HugeiconsIcon icon={MachineRobotIcon} className="size-4" />}
                                    {provider.slug === 'ucontents' && <HugeiconsIcon icon={CloudIcon} className="size-4 text-emerald-500" />}
                                    {provider.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </FieldContent>
                    </Field>

                    {selectedProvider && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">{selectedProvider.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Supported models: {selectedProvider.supported_models?.join(', ') || 'N/A'}
                        </p>
                        {selectedProvider.slug === 'azure_openai' && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            ⚠️ Endpoint URL is required for Azure OpenAI
                          </p>
                        )}
                        {selectedProvider.slug === 'ucontents' && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                            🏠 Self-hosted AI: Mistral (text) + Moondream (vision)
                          </p>
                        )}
                      </div>
                    )}

                    <Field>
                      <FieldLabel>Name *</FieldLabel>
                      <FieldContent>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Production OpenAI Key"
                          required
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>API Key *</FieldLabel>
                      <FieldContent>
                        <div className="relative">
                          <Input
                            type={showApiKey ? "text" : "password"}
                            value={formData.api_key}
                            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                            placeholder="Enter API key"
                            required
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <HugeiconsIcon icon={EyeIcon} className="size-4" />
                          </button>
                        </div>
                      </FieldContent>
                    </Field>

                    {selectedProvider && getProviderFields(selectedProvider.slug).endpoint_url.show && (
                      <Field>
                        <FieldLabel>
                          Endpoint URL {getProviderFields(selectedProvider.slug).endpoint_url.required && '*'}
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            value={formData.endpoint_url}
                            onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                            placeholder={getProviderFields(selectedProvider.slug).endpoint_url.placeholder}
                            required={getProviderFields(selectedProvider.slug).endpoint_url.required}
                          />
                          {selectedProvider.slug === 'azure_openai' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Format: https://your-resource.openai.azure.com
                            </p>
                          )}
                        </FieldContent>
                      </Field>
                    )}

                    {selectedProvider && getProviderFields(selectedProvider.slug).organization_id.show && (
                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel>Organization ID (Optional)</FieldLabel>
                          <FieldContent>
                            <Input
                              value={formData.organization_id}
                              onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                              placeholder="Organization ID"
                            />
                          </FieldContent>
                        </Field>

                        {getProviderFields(selectedProvider.slug).project_id.show && (
                          <Field>
                            <FieldLabel>Project ID (Optional)</FieldLabel>
                            <FieldContent>
                              <Input
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                placeholder="Project ID"
                              />
                            </FieldContent>
                          </Field>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Priority</FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                            min="0"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Higher priority keys are preferred
                          </p>
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel>Status</FieldLabel>
                        <FieldContent>
                          <Select
                            value={formData.is_active ? "active" : "inactive"}
                            onValueChange={(value) => setFormData({ ...formData, is_active: value === "active" })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </FieldContent>
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Rate Limit (Per Minute)</FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            value={formData.rate_limit_per_minute}
                            onChange={(e) => setFormData({ ...formData, rate_limit_per_minute: e.target.value })}
                            placeholder="e.g., 60"
                            min="1"
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel>Rate Limit (Per Day)</FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            value={formData.rate_limit_per_day}
                            onChange={(e) => setFormData({ ...formData, rate_limit_per_day: e.target.value })}
                            placeholder="e.g., 10000"
                            min="1"
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    {/* Scopes Section */}
                    {availableScopes.length > 0 && (
                      <Field>
                        <FieldLabel>
                          Allowed Scopes
                          <span className="font-normal text-muted-foreground ml-2">(Optional)</span>
                        </FieldLabel>
                        <FieldContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            Select which AI tasks this API key can be used for. Leave empty to allow all tasks.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
                            {availableScopes.map((scope) => {
                              // Determine compatibility
                              let isCompatible = true;
                              let warningMessage = "";

                              if (selectedProvider) {
                                // Vision checks
                                if (scope.requires_vision) {
                                  const hasVision = selectedProvider.slug === 'ucontents' ||
                                    (selectedProvider.vision_models?.length ?? 0) > 0;
                                  if (!hasVision) {
                                    isCompatible = false;
                                    warningMessage = "This provider may not support vision models";
                                  }
                                }

                                // Embedding checks
                                if (scope.requires_embedding_model) {
                                  const hasEmbeddings = selectedProvider.slug === 'openai' ||
                                    selectedProvider.slug === 'azure_openai'; // Simplified check
                                  if (!hasEmbeddings && selectedProvider.slug === 'ucontents') {
                                    isCompatible = false;
                                    warningMessage = "Ucontents does not currently support embeddings";
                                  }
                                }
                              }

                              return (
                                <label
                                  key={scope.slug}
                                  className={`flex items-start gap-3 p-2 rounded-md transition-colors cursor-pointer ${isCompatible ? 'hover:bg-background/50' : 'opacity-60 bg-red-50/5 dark:bg-red-900/10'
                                    }`}
                                  title={warningMessage}
                                >
                                  <Checkbox
                                    checked={formData.scopes.includes(scope.slug)}
                                    onCheckedChange={() => toggleScope(scope.slug)}
                                    className="mt-0.5"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div className="font-medium text-sm">{scope.name}</div>
                                      {!isCompatible && (
                                        <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                                          ⚠️ Compatibility
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground line-clamp-2">
                                      {scope.description}
                                    </div>
                                    {scope.module && (
                                      <Badge variant="outline" className="mt-1 text-xs">
                                        {scope.module}
                                      </Badge>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                          {formData.scopes.length > 0 && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              Selected: {formData.scopes.length} scope{formData.scopes.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  </div>
                  <AlertDialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create API Key</Button>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialog>

            {/* Edit API Key Dialog */}
            <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <AlertDialogContent className="max-h-[90vh] overflow-y-auto" style={{ maxWidth: 585 }}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Edit API Key</AlertDialogTitle>
                  <AlertDialogDescription>
                    Update the details for this API key.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleUpdateApiKey}>
                  <div className="grid gap-4 py-4">
                    <Field>
                      <FieldLabel>Provider</FieldLabel>
                      <FieldContent>
                        <Select
                          value={formData.provider_id}
                          onValueChange={handleProviderChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {providers.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id.toString()}>
                                <div className="flex items-center gap-2">
                                  {provider.slug === 'openai' && <HugeiconsIcon icon={MachineRobotIcon} className="size-4" />}
                                  {provider.slug === 'anthropic' && <HugeiconsIcon icon={MachineRobotIcon} className="size-4" />}
                                  {provider.slug === 'google' && <HugeiconsIcon icon={MachineRobotIcon} className="size-4" />}
                                  {provider.slug === 'ucontents' && <HugeiconsIcon icon={CloudIcon} className="size-4 text-emerald-500" />}
                                  {provider.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>Name</FieldLabel>
                      <FieldContent>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="My API Key"
                          required
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>API Key</FieldLabel>
                      <FieldContent>
                        <div className="relative">
                          <Input
                            type={showApiKey ? "text" : "password"}
                            value={formData.api_key}
                            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                            placeholder="Leave blank to keep existing key"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <HugeiconsIcon icon={EyeIcon} className="size-4" />
                          </button>
                        </div>
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel>API Secret (Optional)</FieldLabel>
                      <FieldContent>
                        <div className="relative">
                          <Input
                            type={showApiKey ? "text" : "password"}
                            value={formData.api_secret}
                            onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                            placeholder="Leave blank to keep existing secret"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <HugeiconsIcon icon={EyeIcon} className="size-4" />
                          </button>
                        </div>
                      </FieldContent>
                    </Field>

                    {selectedProvider && getProviderFields(selectedProvider.slug).endpoint_url.show && (
                      <Field>
                        <FieldLabel>
                          Endpoint URL {getProviderFields(selectedProvider.slug).endpoint_url.required && '*'}
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            value={formData.endpoint_url}
                            onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                            placeholder={getProviderFields(selectedProvider.slug).endpoint_url.placeholder}
                            required={getProviderFields(selectedProvider.slug).endpoint_url.required}
                          />
                          {selectedProvider.slug === 'azure_openai' && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Format: https://your-resource.openai.azure.com
                            </p>
                          )}
                        </FieldContent>
                      </Field>
                    )}

                    {selectedProvider && getProviderFields(selectedProvider.slug).organization_id.show && (
                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel>Organization ID (Optional)</FieldLabel>
                          <FieldContent>
                            <Input
                              value={formData.organization_id}
                              onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                              placeholder="Organization ID"
                            />
                          </FieldContent>
                        </Field>

                        {getProviderFields(selectedProvider.slug).project_id.show && (
                          <Field>
                            <FieldLabel>Project ID (Optional)</FieldLabel>
                            <FieldContent>
                              <Input
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                placeholder="Project ID"
                              />
                            </FieldContent>
                          </Field>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Priority</FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                            min="0"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Higher priority keys are preferred
                          </p>
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel>Status</FieldLabel>
                        <FieldContent>
                          <Select
                            value={formData.is_active ? "active" : "inactive"}
                            onValueChange={(value) => setFormData({ ...formData, is_active: value === "active" })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </FieldContent>
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel>Rate Limit (Per Minute)</FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            value={formData.rate_limit_per_minute}
                            onChange={(e) => setFormData({ ...formData, rate_limit_per_minute: e.target.value })}
                            placeholder="e.g., 60"
                            min="1"
                          />
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel>Rate Limit (Per Day)</FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            value={formData.rate_limit_per_day}
                            onChange={(e) => setFormData({ ...formData, rate_limit_per_day: e.target.value })}
                            placeholder="e.g., 10000"
                            min="1"
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    {/* Scopes Section */}
                    {availableScopes.length > 0 && (
                      <Field>
                        <FieldLabel>
                          Allowed Scopes
                          <span className="font-normal text-muted-foreground ml-2">(Optional)</span>
                        </FieldLabel>
                        <FieldContent>
                          <p className="text-sm text-muted-foreground mb-3">
                            Select which AI tasks this API key can be used for. Leave empty to allow all tasks.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/50 rounded-lg">
                            {availableScopes.map((scope) => (
                              <label
                                key={scope.slug}
                                className="flex items-start gap-3 p-2 rounded-md hover:bg-background/50 cursor-pointer transition-colors"
                              >
                                <Checkbox
                                  checked={formData.scopes.includes(scope.slug)}
                                  onCheckedChange={() => toggleScope(scope.slug)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm">{scope.name}</div>
                                  <div className="text-xs text-muted-foreground line-clamp-2">
                                    {scope.description}
                                  </div>
                                  {scope.module && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {scope.module}
                                    </Badge>
                                  )}
                                </div>
                              </label>
                            ))}
                          </div>
                          {formData.scopes.length > 0 && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              Selected: {formData.scopes.length} scope{formData.scopes.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  </div>
                  <AlertDialogFooter className="mt-6 flex justify-between gap-2 sm:justify-between">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => selectedApiKey && handleTestApiKey(selectedApiKey.id)}
                      disabled={testingApiKeyId === selectedApiKey?.id}
                    >
                      {testingApiKeyId === selectedApiKey?.id ? (
                        <>Testing...</>
                      ) : (
                        <>
                          <HugeiconsIcon icon={PlayIcon} className="size-4 mr-2" />
                          Test API Key
                        </>
                      )}
                    </Button>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Update API Key</Button>
                    </div>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{selectedApiKey?.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteApiKey}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </AdminDashboardLayout>
  )
}
