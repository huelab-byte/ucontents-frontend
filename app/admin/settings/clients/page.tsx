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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  KeyIcon,
  PlusSignIcon,
  DeleteIcon,
  RefreshIcon,
  Cancel01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  EyeIcon,
  SettingsIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { clientService, type ApiClient, type ApiKey } from "@/lib/api/services/client.service"
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

// Available API scopes/endpoints
const AVAILABLE_SCOPES = [
  { value: "content:read", label: "Content: Read" },
  { value: "content:write", label: "Content: Write" },
  { value: "media:read", label: "Media: Read" },
  { value: "media:write", label: "Media: Write" },
  { value: "user:read", label: "User: Read" },
  { value: "user:write", label: "User: Write" },
  { value: "analytics:read", label: "Analytics: Read" },
  { value: "automation:read", label: "Automation: Read" },
  { value: "automation:write", label: "Automation: Write" },
]

// Sample shops (in a real app, this would come from an API)
const AVAILABLE_SHOPS = [
  { id: "1", name: "Main Store" },
  { id: "2", name: "Outlet Store" },
  { id: "3", name: "Online Store" },
]

export default function ClientSettingsPage() {
  const { hasPermission } = usePermission()
  const [loading, setLoading] = React.useState(true)
  const [clients, setClients] = React.useState<ApiClient[]>([])
  const [selectedClient, setSelectedClient] = React.useState<ApiClient | null>(null)
  const [clientKeys, setClientKeys] = React.useState<Record<number, ApiKey[]>>({})

  // Permission check
  if (!hasPermission("view_api_clients") && !hasPermission("manage_api_clients")) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [keyDialogOpen, setKeyDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [revokeDialogOpen, setRevokeDialogOpen] = React.useState(false)
  const [revokeKeyDialogOpen, setRevokeKeyDialogOpen] = React.useState(false)
  const [revokeKeyData, setRevokeKeyData] = React.useState<{ clientId: number; keyId: number } | null>(null)
  const [newKeyDialogOpen, setNewKeyDialogOpen] = React.useState(false)
  
  // New key display (shown only once)
  const [newKeyPair, setNewKeyPair] = React.useState<{ public_key: string; secret_key: string } | null>(null)
  
  // Form states
  const [clientName, setClientName] = React.useState("")
  const [clientDescription, setClientDescription] = React.useState("")
  const [clientEnvironment, setClientEnvironment] = React.useState<"production" | "staging" | "development">("production")
  const [selectedScopes, setSelectedScopes] = React.useState<string[]>([])
  const [selectedShops, setSelectedShops] = React.useState<string[]>([])
  const [rateLimit, setRateLimit] = React.useState(60)
  const [ratePeriod, setRatePeriod] = React.useState(60)
  
  // Copy state
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      const response = await clientService.getAll()
      if (response.success && response.data) {
        setClients(response.data)
        // Use apiKeys from the response (already eager loaded by backend)
        // This avoids N+1 query problem - no need for separate API calls
        const keysMap: Record<number, ApiKey[]> = {}
        response.data.forEach((client) => {
          // Backend returns api_keys in snake_case
          if ((client as any).api_keys && Array.isArray((client as any).api_keys)) {
            keysMap[client.id] = (client as any).api_keys
          } else {
            keysMap[client.id] = []
          }
        })
        setClientKeys(keysMap)
      }
    } catch (error) {
      toast.error("Failed to load clients")
    } finally {
      setLoading(false)
    }
  }

  const loadClientKeys = async (clientId: number) => {
    try {
      const response = await clientService.getKeys(clientId)
      if (response.success && response.data) {
        setClientKeys((prev) => ({
          ...prev,
          [clientId]: response.data || [],
        }))
      }
    } catch (error) {
      console.error("Failed to load client keys:", error)
    }
  }

  const handleCreateClient = async () => {
    try {
      const response = await clientService.create({
        name: clientName,
        description: clientDescription || undefined,
        environment: clientEnvironment,
        is_active: true,
        allowed_endpoints: selectedScopes.length > 0 ? selectedScopes : undefined,
        rate_limit: {
          limit: rateLimit,
          period: ratePeriod,
        },
        shops: selectedShops.length > 0 ? selectedShops : undefined,
      })
      
      if (response.success && response.data) {
        const client = response.data
        
        // Generate initial key pair
        await handleGenerateKey(client.id, true)
        
        toast.success("Client created successfully")
        setClients((prev) => [client, ...prev])
        setClientKeys((prev) => ({ ...prev, [client.id]: [] }))
        setCreateDialogOpen(false)
        resetForm()
      } else {
        toast.error(response.message || "Failed to create client")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create client")
    }
  }

  const handleGenerateKey = async (clientId: number, isNewClient = false) => {
    try {
      const response = await clientService.createKey(clientId, {
        name: `Key for ${clients.find(c => c.id === clientId)?.name || "Client"}`,
      })
      
      if (response.success && response.data) {
        const keyData = response.data as any
        if (keyData.secret_key) {
          setNewKeyPair({
            public_key: keyData.public_key,
            secret_key: keyData.secret_key,
          })
          setNewKeyDialogOpen(true)
        }
        // Update state directly with new key
        setClientKeys((prev) => ({
          ...prev,
          [clientId]: [...(prev[clientId] || []), keyData],
        }))
        if (!isNewClient) {
          toast.success("API key generated successfully")
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to generate API key")
    }
  }

  const handleRotateKey = async (clientId: number, keyId: number) => {
    try {
      const response = await clientService.rotateKey(clientId, keyId)
      if (response.success && response.data) {
        const keyData = response.data as any
        if (keyData.secret_key) {
          setNewKeyPair({
            public_key: keyData.public_key,
            secret_key: keyData.secret_key,
          })
          setNewKeyDialogOpen(true)
        }
        // Update state directly: replace old key with rotated key
        setClientKeys((prev) => ({
          ...prev,
          [clientId]: (prev[clientId] || []).map((k) =>
            k.id === keyId ? keyData : k
          ),
        }))
        toast.success("API key rotated successfully")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to rotate API key")
    }
  }

  const handleRevokeKey = async () => {
    if (!revokeKeyData) return
    
    try {
      const response = await clientService.revokeKey(revokeKeyData.clientId, revokeKeyData.keyId)
      if (response.success) {
        // Update state directly: remove revoked key
        setClientKeys((prev) => ({
          ...prev,
          [revokeKeyData.clientId]: (prev[revokeKeyData.clientId] || []).filter(
            (k) => k.id !== revokeKeyData.keyId
          ),
        }))
        toast.success("API key revoked successfully")
        setRevokeKeyDialogOpen(false)
        setRevokeKeyData(null)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to revoke API key")
    }
  }

  const handleDeleteClient = async () => {
    if (!selectedClient) return
    
    try {
      const response = await clientService.delete(selectedClient.id)
      if (response.success) {
        toast.success("Client deleted successfully")
        setClients((prev) => prev.filter((c) => c.id !== selectedClient.id))
        setDeleteDialogOpen(false)
        setSelectedClient(null)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete client")
    }
  }

  const handleRevokeClient = async () => {
    if (!selectedClient) return
    
    try {
      const response = await clientService.update(selectedClient.id, {
        is_active: false,
      })
      if (response.success && response.data) {
        toast.success("Client revoked successfully")
        setClients((prev) => prev.map((c) => c.id === selectedClient.id ? response.data! : c))
        setRevokeDialogOpen(false)
        setSelectedClient(null)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to revoke client")
    }
  }

  const handleUpdateClient = async () => {
    if (!selectedClient) return
    
    try {
      const response = await clientService.update(selectedClient.id, {
        name: clientName,
        description: clientDescription || undefined,
        environment: clientEnvironment,
        allowed_endpoints: selectedScopes.length > 0 ? selectedScopes : undefined,
        rate_limit: {
          limit: rateLimit,
          period: ratePeriod,
        },
        shops: selectedShops.length > 0 ? selectedShops : undefined,
      })
      if (response.success && response.data) {
        toast.success("Client updated successfully")
        setClients((prev) => prev.map((c) => c.id === selectedClient.id ? response.data! : c))
        setEditDialogOpen(false)
        resetForm()
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update client")
    }
  }

  const resetForm = () => {
    setClientName("")
    setClientDescription("")
    setClientEnvironment("production")
    setSelectedScopes([])
    setSelectedShops([])
    setRateLimit(60)
    setRatePeriod(60)
    setSelectedClient(null)
  }

  const openEditDialog = (client: ApiClient) => {
    setSelectedClient(client)
    setClientName(client.name)
    setClientDescription(client.description || "")
    setClientEnvironment(client.environment || "production")
    setSelectedScopes(client.allowed_endpoints || [])
    setSelectedShops(client.shops || [])
    setRateLimit(client.rate_limit?.limit || 60)
    setRatePeriod(client.rate_limit?.period || 60)
    setEditDialogOpen(true)
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
      toast.success("Copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading clients...</div>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HugeiconsIcon icon={KeyIcon} className="size-8" />
              Client Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage API clients, generate keys, and configure access scopes and rate limits
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
            Create Client
          </Button>
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          {clients.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <HugeiconsIcon icon={KeyIcon} className="size-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No clients created yet</p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                  Create Your First Client
                </Button>
              </CardContent>
            </Card>
          ) : (
            clients.map((client) => {
              const keys = clientKeys[client.id] || []
              const activeKeys = keys.filter((k) => k.is_active)
              
              return (
                <Card key={client.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {client.name}
                          {!client.is_active && (
                            <span className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded">
                              Revoked
                            </span>
                          )}
                        </CardTitle>
                        {client.description && (
                          <CardDescription className="mt-1">
                            {client.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(client)}
                        >
                          <HugeiconsIcon icon={SettingsIcon} className="size-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClient(client)
                            setRevokeDialogOpen(true)
                          }}
                        >
                          <HugeiconsIcon icon={Cancel01Icon} className="size-4 mr-2" />
                          Revoke
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedClient(client)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* API Keys Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-base font-semibold">API Keys</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateKey(client.id)}
                          >
                            <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                            Generate Key
                          </Button>
                        </div>
                        {activeKeys.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No active keys</p>
                        ) : (
                          <div className="space-y-2">
                            {activeKeys.map((key) => (
                              <div
                                key={key.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                      {key.public_key}
                                    </code>
                                    {key.last_used_at && (
                                      <span className="text-xs text-muted-foreground">
                                        Last used: {new Date(key.last_used_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  {key.name && (
                                    <p className="text-xs text-muted-foreground mt-1">{key.name}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRotateKey(client.id, key.id)}
                                  >
                                    <HugeiconsIcon icon={RefreshIcon} className="size-4 mr-2" />
                                    Rotate
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setRevokeKeyData({ clientId: client.id, keyId: key.id })
                                      setRevokeKeyDialogOpen(true)
                                    }}
                                  >
                                    <HugeiconsIcon icon={Cancel01Icon} className="size-4 mr-2" />
                                    Revoke
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Rate Limiting Section */}
                      <div className="pt-4 border-t">
                        <Label className="text-base font-semibold mb-3 block">Rate Limiting</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel>
                              <Label>Limit (requests)</Label>
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                type="number"
                                min="1"
                                value={rateLimit}
                                onChange={(e) => setRateLimit(parseInt(e.target.value) || 60)}
                                placeholder="60"
                              />
                            </FieldContent>
                          </Field>
                          <Field>
                            <FieldLabel>
                              <Label>Period (seconds)</Label>
                            </FieldLabel>
                            <FieldContent>
                              <Input
                                type="number"
                                min="1"
                                value={ratePeriod}
                                onChange={(e) => setRatePeriod(parseInt(e.target.value) || 60)}
                                placeholder="60"
                              />
                            </FieldContent>
                          </Field>
                        </div>
                      </div>

                      {/* Scopes Section */}
                      <div className="pt-4 border-t">
                        <Label className="text-base font-semibold mb-3 block">Scopes</Label>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_SCOPES.map((scope) => (
                            <label
                              key={scope.value}
                              className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-muted/50"
                            >
                              <input
                                type="checkbox"
                                checked={selectedScopes.includes(scope.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedScopes([...selectedScopes, scope.value])
                                  } else {
                                    setSelectedScopes(selectedScopes.filter((s) => s !== scope.value))
                                  }
                                }}
                                className="size-4"
                              />
                              <span className="text-sm">{scope.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Shops Section */}
                      <div className="pt-4 border-t">
                        <Label className="text-base font-semibold mb-3 block">Available Shops</Label>
                        <div className="flex flex-wrap gap-2">
                          {AVAILABLE_SHOPS.map((shop) => (
                            <label
                              key={shop.id}
                              className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-muted/50"
                            >
                              <input
                                type="checkbox"
                                checked={selectedShops.includes(shop.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedShops([...selectedShops, shop.id])
                                  } else {
                                    setSelectedShops(selectedShops.filter((s) => s !== shop.id))
                                  }
                                }}
                                className="size-4"
                              />
                              <span className="text-sm">{shop.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Create Client Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Client</DialogTitle>
              <DialogDescription>
                Create a new API client and generate a key pair for API access
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Field>
                <FieldLabel>
                  <Label>Client Name *</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g., Mobile App, Web Platform"
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>
                  <Label>Description</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    value={clientDescription}
                    onChange={(e) => setClientDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>
                  <Label>Environment</Label>
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={clientEnvironment}
                    onValueChange={(value) =>
                      setClientEnvironment((value || "production") as "production" | "staging" | "development")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>
                  <Label>Rate Limiting</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Limit (requests)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={rateLimit}
                        onChange={(e) => setRateLimit(parseInt(e.target.value) || 60)}
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Period (seconds)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={ratePeriod}
                        onChange={(e) => setRatePeriod(parseInt(e.target.value) || 60)}
                        placeholder="60"
                      />
                    </div>
                  </div>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>
                  <Label>Scopes</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SCOPES.map((scope) => (
                      <label
                        key={scope.value}
                        className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(scope.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedScopes([...selectedScopes, scope.value])
                            } else {
                              setSelectedScopes(selectedScopes.filter((s) => s !== scope.value))
                            }
                          }}
                          className="size-4"
                        />
                        <span className="text-sm">{scope.label}</span>
                      </label>
                    ))}
                  </div>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>
                  <Label>Available Shops</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SHOPS.map((shop) => (
                      <label
                        key={shop.id}
                        className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedShops.includes(shop.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedShops([...selectedShops, shop.id])
                            } else {
                              setSelectedShops(selectedShops.filter((s) => s !== shop.id))
                            }
                          }}
                          className="size-4"
                        />
                        <span className="text-sm">{shop.name}</span>
                      </label>
                    ))}
                  </div>
                </FieldContent>
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateClient} disabled={!clientName.trim()}>
                Create Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Client Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>
                Update client settings, scopes, and rate limits
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Field>
                <FieldLabel>
                  <Label>Client Name *</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g., Mobile App, Web Platform"
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>
                  <Label>Description</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    value={clientDescription}
                    onChange={(e) => setClientDescription(e.target.value)}
                    placeholder="Optional description"
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>
                  <Label>Rate Limiting</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Limit (requests)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={rateLimit}
                        onChange={(e) => setRateLimit(parseInt(e.target.value) || 60)}
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Period (seconds)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={ratePeriod}
                        onChange={(e) => setRatePeriod(parseInt(e.target.value) || 60)}
                        placeholder="60"
                      />
                    </div>
                  </div>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>
                  <Label>Scopes</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SCOPES.map((scope) => (
                      <label
                        key={scope.value}
                        className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(scope.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedScopes([...selectedScopes, scope.value])
                            } else {
                              setSelectedScopes(selectedScopes.filter((s) => s !== scope.value))
                            }
                          }}
                          className="size-4"
                        />
                        <span className="text-sm">{scope.label}</span>
                      </label>
                    ))}
                  </div>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel>
                  <Label>Available Shops</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SHOPS.map((shop) => (
                      <label
                        key={shop.id}
                        className="flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-muted/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedShops.includes(shop.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedShops([...selectedShops, shop.id])
                            } else {
                              setSelectedShops(selectedShops.filter((s) => s !== shop.id))
                            }
                          }}
                          className="size-4"
                        />
                        <span className="text-sm">{shop.name}</span>
                      </label>
                    ))}
                  </div>
                </FieldContent>
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateClient}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Key Pair Dialog */}
        <Dialog open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API Key Generated</DialogTitle>
              <DialogDescription>
                Save these credentials securely. The secret key will not be shown again.
              </DialogDescription>
            </DialogHeader>
            {newKeyPair && (
              <div className="space-y-4">
                <Field>
                  <FieldLabel>
                    <Label>Public Key (Client Key)</Label>
                  </FieldLabel>
                  <FieldContent>
                    <div className="flex gap-2">
                      <Input
                        value={newKeyPair.public_key}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(newKeyPair.public_key, "public")}
                      >
                        {copiedKey === "public" ? (
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />
                        ) : (
                          <HugeiconsIcon icon={Copy01Icon} className="size-4" />
                        )}
                      </Button>
                    </div>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>
                    <Label>Secret Key (Client Secret)</Label>
                  </FieldLabel>
                  <FieldContent>
                    <div className="flex gap-2">
                      <PasswordInput
                        value={newKeyPair.secret_key}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(newKeyPair.secret_key, "secret")}
                      >
                        {copiedKey === "secret" ? (
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />
                        ) : (
                          <HugeiconsIcon icon={Copy01Icon} className="size-4" />
                        )}
                      </Button>
                    </div>
                  </FieldContent>
                </Field>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => {
                setNewKeyDialogOpen(false)
                setNewKeyPair(null)
              }}>
                I've Saved These Credentials
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Client Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Client</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedClient?.name}"? This action cannot be undone and will revoke all associated API keys.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteClient} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Revoke Client Dialog */}
        <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke {selectedClient?.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to revoke this client? All API keys will be deactivated and the client will no longer be able to access the API.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRevokeClient} className="bg-destructive text-destructive-foreground">
                Revoke
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Revoke Key Dialog */}
        <AlertDialog open={revokeKeyDialogOpen} onOpenChange={setRevokeKeyDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to revoke this API key? It will be deactivated and can no longer be used to access the API.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRevokeKey} className="bg-destructive text-destructive-foreground">
                Revoke
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminDashboardLayout>
  )
}
