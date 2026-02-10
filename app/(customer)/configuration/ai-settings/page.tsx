"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
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
    CheckmarkCircle01Icon,
    AlertCircleIcon,
    ClockIcon,
    PlusSignIcon,
    EditIcon,
    DeleteIcon,
    MoreVerticalCircle01Icon,
    KeyIcon,
    EyeIcon,
    SettingsIcon,
    PlayIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import {
    customerAiKeyService,
    AiApiKey,
} from "@/lib/api/services/customer-ai-key.service"
import { toast } from "@/lib/toast"
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
import { Checkbox } from "@/components/ui/checkbox"
import { NavUser } from "@/components/nav-user"

// Reusing types from Admin logic usually, but defined loose here for Customer service compatibility
interface AiProvider {
    id: number
    name: string
    slug: string
    logo_url: string
}

interface AiApiKeyScope {
    slug: string
    name: string
    description?: string
}

export default function CustomerAiSettingsPage() {
    const [apiKeys, setApiKeys] = React.useState<AiApiKey[]>([])
    const [providers, setProviders] = React.useState<AiProvider[]>([])
    const [loading, setLoading] = React.useState(true)
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
        deployment_name: "",
        organization_id: "",
        project_id: "",
        is_active: true,
        priority: 0,
        scopes: [] as string[],
        model: "",
    })

    const selectedProvider = React.useMemo(
        () => (formData.provider_id ? providers.find((p) => p.id.toString() === formData.provider_id) : null),
        [formData.provider_id, providers]
    )

    // Testing
    const [testingApiKeyId, setTestingApiKeyId] = React.useState<number | null>(null)
    const [testResult, setTestResult] = React.useState<{ success: boolean; message: string; response_time_ms?: number } | null>(null)

    React.useEffect(() => {
        loadProviders()
        loadScopes()
        loadApiKeys()
    }, [])

    const loadProviders = async () => {
        try {
            const res = await customerAiKeyService.getProviders()
            if (res.success && res.data) {
                setProviders(res.data)
            }
        } catch (error) {
            console.error("Failed to load providers", error)
        }
    }

    const loadScopes = async () => {
        try {
            const res = await customerAiKeyService.getScopes()
            if (res.success && res.data) {
                setAvailableScopes(res.data)
            }
        } catch (error) {
            console.error("Failed to load scopes", error)
        }
    }

    const loadApiKeys = async () => {
        setLoading(true)
        try {
            const res = await customerAiKeyService.list()
            if (res.success && res.data) {
                setApiKeys(res.data)
            }
        } catch (error) {
            toast.error("Failed to load API keys")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setFormData({
            provider_id: "",
            name: "",
            api_key: "",
            api_secret: "",
            endpoint_url: "",
            deployment_name: "",
            organization_id: "",
            project_id: "",
            is_active: true,
            priority: 0,
            scopes: [],
            model: "",
        })
        setTestResult(null)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const isAzure = selectedProvider?.slug === "azure_openai"
            const res = await customerAiKeyService.create({
                provider_id: parseInt(formData.provider_id),
                name: formData.name,
                api_key: formData.api_key,
                api_secret: formData.api_secret || undefined,
                endpoint_url: formData.endpoint_url || undefined,
                organization_id: formData.organization_id || undefined,
                project_id: formData.project_id || undefined,
                is_active: formData.is_active,
                priority: formData.priority,
                scopes: formData.scopes.length > 0 ? formData.scopes : undefined,
                metadata: {
                    ...(isAzure && formData.deployment_name ? { deployment_name: formData.deployment_name } : {}),
                    ...(selectedProvider?.slug === "google" && formData.model ? { model: formData.model } : {})
                },
            })
            if (res.success) {
                toast.success("API Key added successfully")
                setCreateDialogOpen(false)
                loadApiKeys()
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to create API key")
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedApiKey) return
        try {
            const isAzure = selectedApiKey.provider?.slug === "azure_openai"
            const existingMeta = selectedApiKey.metadata || {}
            const res = await customerAiKeyService.update(selectedApiKey.id, {
                name: formData.name,
                api_key: formData.api_key || undefined,
                api_secret: formData.api_secret || undefined,
                endpoint_url: formData.endpoint_url || undefined,
                organization_id: formData.organization_id || undefined,
                project_id: formData.project_id || undefined,
                is_active: formData.is_active,
                priority: formData.priority,
                scopes: formData.scopes.length > 0 ? formData.scopes : undefined,
                metadata: {
                    ...existingMeta,
                    ...(isAzure && formData.deployment_name ? { deployment_name: formData.deployment_name } : {}),
                    ...(selectedApiKey.provider?.slug === "google" && formData.model ? { model: formData.model } : {})
                },
            })
            if (res.success) {
                toast.success("API Key updated successfully")
                setEditDialogOpen(false)
                loadApiKeys()
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update API key")
        }
    }

    const handleDelete = async () => {
        if (!selectedApiKey) return
        try {
            const res = await customerAiKeyService.delete(selectedApiKey.id)
            if (res.success) {
                toast.success("API Key deleted")
                setDeleteDialogOpen(false)
                loadApiKeys()
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete API key")
        }
    }

    const handleTest = async (apiKey: AiApiKey) => {
        setTestingApiKeyId(apiKey.id)
        setTestResult(null)
        try {
            const res = await customerAiKeyService.test(apiKey.id)
            if (res.success) {
                toast.success("Connection successful!")
                setTestResult({
                    success: true,
                    message: res.message,
                    response_time_ms: (res as any).data?.response_time_ms // Response usually in data
                })
            } else {
                toast.error("Connection failed")
                setTestResult({
                    success: false,
                    message: res.message
                })
            }
        } catch (error: any) {
            toast.error("Test failed")
            setTestResult({
                success: false,
                message: error.message || "Unknown error"
            })
        } finally {
            setTestingApiKeyId(null)
        }
    }

    const openCreateDialog = () => {
        resetForm()
        setCreateDialogOpen(true)
    }

    const openEditDialog = (key: AiApiKey) => {
        setSelectedApiKey(key)
        setFormData({
            provider_id: key.provider_id.toString(),
            name: key.name,
            api_key: "",
            api_secret: "",
            endpoint_url: key.endpoint_url || "",
            deployment_name: key.metadata?.deployment_name || "",
            organization_id: "",
            project_id: "",
            is_active: key.is_active,
            priority: key.priority,
            scopes: [],
            model: "",
        })
        customerAiKeyService.get(key.id).then((res) => {
            if (res.success && res.data) {
                const d = res.data
                setFormData((prev) => ({
                    ...prev,
                    endpoint_url: d.endpoint_url ?? prev.endpoint_url,
                    organization_id: d.organization_id ?? prev.organization_id,
                    project_id: d.project_id ?? prev.project_id,
                    scopes: d.scopes ?? prev.scopes,
                    deployment_name: d.metadata?.deployment_name ?? prev.deployment_name,
                    model: (d.metadata as any)?.model ?? prev.model,
                }))
            }
        })
        setEditDialogOpen(true)
    }

    return (
        <CustomerDashboardLayout>
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">AI Settings</h1>
                        <p className="text-muted-foreground">
                            Manage your personal API keys. These keys will take precedence over system keys.
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="gap-2">
                        <HugeiconsIcon icon={PlusSignIcon} size={16} />
                        Add API Key
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>My API Keys</CardTitle>
                        <CardDescription>
                            Configure your own keys for OpenAI, Anthropic, etc.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Provider</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : apiKeys.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No API keys found. Add one to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        apiKeys.map((key) => (
                                            <TableRow key={key.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {key.provider?.logo_url && (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={key.provider.logo_url} alt={key.provider.name} className="h-6 w-6 object-contain" />
                                                        )}
                                                        <span className="font-medium">{key.provider?.name || "Unknown"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{key.name}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={key.is_active ? "default" : "secondary"}
                                                        className={cn(key.is_active && "bg-green-500 hover:bg-green-600")}
                                                    >
                                                        {key.is_active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-xs text-muted-foreground">
                                                        <div>{key.total_requests} requests</div>
                                                        {key.last_used_at && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <HugeiconsIcon icon={ClockIcon} size={10} />
                                                                <span>{new Date(key.last_used_at).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleTest(key)}
                                                            disabled={testingApiKeyId === key.id}
                                                            title="Test Connection"
                                                        >
                                                            <HugeiconsIcon icon={PlayIcon} size={16} className={cn(testingApiKeyId === key.id && "animate-pulse request-spin")} />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <HugeiconsIcon icon={MoreVerticalCircle01Icon} size={16} />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => openEditDialog(key)}>
                                                                    <HugeiconsIcon icon={EditIcon} size={14} className="mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive"
                                                                    onClick={() => {
                                                                        setSelectedApiKey(key)
                                                                        setDeleteDialogOpen(true)
                                                                    }}
                                                                >
                                                                    <HugeiconsIcon icon={DeleteIcon} size={14} className="mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Create Dialog */}
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add API Key</DialogTitle>
                            <DialogDescription>
                                Add your own AI provider API key.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="provider">Provider</Label>
                                <Select
                                    value={formData.provider_id || undefined}
                                    onValueChange={(val) => setFormData({ ...formData, provider_id: val ?? "" })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select provider">
                                            {formData.provider_id && selectedProvider ? selectedProvider.name : undefined}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {providers.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    {p.logo_url && <img src={p.logo_url || ""} className="w-4 h-4" alt="" />}
                                                    {p.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedProvider?.slug === "azure_openai" && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="endpoint_url">Endpoint URL *</Label>
                                        <Input
                                            id="endpoint_url"
                                            value={formData.endpoint_url}
                                            onChange={e => setFormData({ ...formData, endpoint_url: e.target.value })}
                                            placeholder="https://your-resource.openai.azure.com"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            From Azure Portal → your resource → Keys and Endpoint
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deployment_name">Deployment name *</Label>
                                        <Input
                                            id="deployment_name"
                                            value={formData.deployment_name}
                                            onChange={e => setFormData({ ...formData, deployment_name: e.target.value })}
                                            placeholder="e.g. gpt-35-turbo"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            The deployment name from Azure OpenAI Studio (Model deployments)
                                        </p>
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">Friendly Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={selectedProvider?.slug === "azure_openai" ? "e.g. My Azure OpenAI" : "e.g. My OpenAI Key"}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="api_key">{selectedProvider?.slug === "azure_openai" ? "API Key (Key 1) *" : "API Key *"}</Label>
                                <div className="relative">
                                    <Input
                                        id="api_key"
                                        type="password"
                                        value={formData.api_key}
                                        onChange={e => setFormData({ ...formData, api_key: e.target.value })}
                                        placeholder={selectedProvider?.slug === "azure_openai" ? "Azure API key (Key 1)" : "sk-..."}
                                        required
                                        className="pr-8"
                                    />
                                </div>
                            </div>

                            {selectedProvider?.slug === "azure_openai" && (
                                <div className="space-y-2">
                                    <Label htmlFor="api_secret">API Key (Key 2) <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                    <Input
                                        id="api_secret"
                                        type="password"
                                        value={formData.api_secret}
                                        onChange={e => setFormData({ ...formData, api_secret: e.target.value })}
                                        placeholder="Optional – for key rotation"
                                    />
                                </div>
                            )}

                            {selectedProvider?.slug === "google" && (
                                <div className="space-y-2">
                                    <Label htmlFor="model">Model Version <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                    <Select
                                        value={formData.model}
                                        onValueChange={(value) => setFormData({ ...formData, model: value || "" })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                                            <SelectItem value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</SelectItem>
                                            <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                                            <SelectItem value="gemini-3-flash-preview">Gemini 3 Flash (Preview)</SelectItem>
                                            <SelectItem value="gemini-3-pro-preview">Gemini 3 Pro (Preview)</SelectItem>
                                            <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Select the specific Gemini model version to use.
                                    </p>
                                </div>
                            )}

                            {/* Optional fields based on provider */}
                            <div className="space-y-2">
                                <Label>Scopes (Optional)</Label>
                                <div className="grid grid-cols-2 gap-2 border p-3 rounded-md max-h-40 overflow-y-auto">
                                    {availableScopes.map(scope => (
                                        <div key={scope.slug} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`scope-${scope.slug}`}
                                                checked={formData.scopes.includes(scope.slug)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setFormData(prev => ({ ...prev, scopes: [...prev.scopes, scope.slug] }))
                                                    } else {
                                                        setFormData(prev => ({ ...prev, scopes: prev.scopes.filter(s => s !== scope.slug) }))
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`scope-${scope.slug}`} className="text-sm font-normal cursor-pointer">
                                                {scope.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">Limit this key to specific tasks. Leave empty for all.</p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(c) => setFormData({ ...formData, is_active: c === true })}
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>

                        </form>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate}>Save Key</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Edit API Key</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4 py-4">
                            {selectedApiKey?.provider?.slug === "azure_openai" && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-endpoint_url">Endpoint URL *</Label>
                                        <Input
                                            id="edit-endpoint_url"
                                            value={formData.endpoint_url}
                                            onChange={e => setFormData({ ...formData, endpoint_url: e.target.value })}
                                            placeholder="https://your-resource.openai.azure.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-deployment_name">Deployment name *</Label>
                                        <Input
                                            id="edit-deployment_name"
                                            value={formData.deployment_name}
                                            onChange={e => setFormData({ ...formData, deployment_name: e.target.value })}
                                            placeholder="e.g. gpt-35-turbo"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Friendly Name</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-api_key">
                                    {selectedApiKey?.provider?.slug === "azure_openai" ? "New API Key (Key 1) – leave blank to keep" : "New API Key (Leave blank to keep current)"}
                                </Label>
                                <Input
                                    id="edit-api_key"
                                    type="password"
                                    value={formData.api_key}
                                    onChange={e => setFormData({ ...formData, api_key: e.target.value })}
                                    placeholder="Enter new key only if changing"
                                />
                            </div>

                            {selectedApiKey?.provider?.slug === "azure_openai" && (
                                <div className="space-y-2">
                                    <Label htmlFor="edit-api_secret">API Key (Key 2) – leave blank to keep</Label>
                                    <Input
                                        id="edit-api_secret"
                                        type="password"
                                        value={formData.api_secret}
                                        onChange={e => setFormData({ ...formData, api_secret: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                            )}

                            {selectedApiKey?.provider?.slug === "google" && (
                                <div className="space-y-2">
                                    <Label htmlFor="edit-model">Model Version <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                                    <Select
                                        value={formData.model}
                                        onValueChange={(value) => setFormData({ ...formData, model: value || "" })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                                            <SelectItem value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</SelectItem>
                                            <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                                            <SelectItem value="gemini-3-flash-preview">Gemini 3 Flash (Preview)</SelectItem>
                                            <SelectItem value="gemini-3-pro-preview">Gemini 3 Pro (Preview)</SelectItem>
                                            <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Select the specific Gemini model version to use.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Scopes (Optional)</Label>
                                <div className="grid grid-cols-2 gap-2 border p-3 rounded-md max-h-40 overflow-y-auto">
                                    {availableScopes.map(scope => (
                                        <div key={scope.slug} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`edit-scope-${scope.slug}`}
                                                checked={formData.scopes.includes(scope.slug)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setFormData(prev => ({ ...prev, scopes: [...prev.scopes, scope.slug] }))
                                                    } else {
                                                        setFormData(prev => ({ ...prev, scopes: prev.scopes.filter(s => s !== scope.slug) }))
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`edit-scope-${scope.slug}`} className="text-sm font-normal cursor-pointer">
                                                {scope.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(c) => setFormData({ ...formData, is_active: c === true })}
                                />
                                <Label htmlFor="edit-is_active">Active</Label>
                            </div>
                        </form>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdate}>Update Key</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Alert */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. Any tasks relying on this key will fallback to system keys if available.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </div>
        </CustomerDashboardLayout>
    )
}
