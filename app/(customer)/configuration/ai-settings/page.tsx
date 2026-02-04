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
        organization_id: "",
        project_id: "",
        is_active: true,
        priority: 0,
        scopes: [] as string[],
    })

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
            organization_id: "",
            project_id: "",
            is_active: true,
            priority: 0,
            scopes: [],
        })
        setTestResult(null)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
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
            const res = await customerAiKeyService.update(selectedApiKey.id, {
                name: formData.name,
                api_key: formData.api_key || undefined, // Only send if changed? Logic might need adjustment but usually fine
                api_secret: formData.api_secret || undefined,
                endpoint_url: formData.endpoint_url || undefined,
                organization_id: formData.organization_id || undefined,
                project_id: formData.project_id || undefined,
                is_active: formData.is_active,
                priority: formData.priority,
                scopes: formData.scopes.length > 0 ? formData.scopes : undefined, // If passing undefined, it might not update scopes appropriately? DTO handles optional.
                // Actually UpdateDTO has optional everything. Sending just what changed is better visually but sending full form is easier.
                // Existing logic replaces.
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
            api_key: "", // Don't show existing key for security, user re-enters to change
            api_secret: "",
            endpoint_url: "", // Might want to fetch details if returned, usually not returned in list?
            organization_id: "",
            project_id: "",
            is_active: key.is_active,
            priority: key.priority,
            // Scopes isn't in simplified AiApiKey interface but backend returns it.
            // Assuming listing returns scopes. If not, fetched in detailed show/edit? 
            // For now, assume empty.
            scopes: [],
        })
        // Ideally fetch details:
        customerAiKeyService.get(key.id).then(res => {
            if (res.success && res.data) {
                const d = res.data as any
                setFormData(prev => ({
                    ...prev,
                    endpoint_url: d.endpoint_url || "",
                    organization_id: d.organization_id || "",
                    project_id: d.project_id || "",
                    scopes: d.scopes || [],
                    // Still keep api_key empty
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
                                    value={formData.provider_id}
                                    onValueChange={(val) => setFormData({ ...formData, provider_id: val || "" })}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select provider" />
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

                            <div className="space-y-2">
                                <Label htmlFor="name">Friendly Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. My OpenAI Key"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="api_key">API Key</Label>
                                <div className="relative">
                                    <Input
                                        id="api_key"
                                        type="password"
                                        value={formData.api_key}
                                        onChange={e => setFormData({ ...formData, api_key: e.target.value })}
                                        placeholder="sk-..."
                                        required
                                        className="pr-8"
                                    />
                                </div>
                            </div>

                            {/* Optional fields based on provider? For simplicity showing common ones */}
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
                                <Label htmlFor="edit-api_key">New API Key (Leave blank to keep current)</Label>
                                <Input
                                    id="edit-api_key"
                                    type="password"
                                    value={formData.api_key}
                                    onChange={e => setFormData({ ...formData, api_key: e.target.value })}
                                    placeholder="Enter new key ONLY if changing"
                                />
                            </div>

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
