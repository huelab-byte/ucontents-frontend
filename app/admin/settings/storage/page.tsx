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
  Database02Icon,
  Upload01Icon,
  DeleteIcon,
  RefreshIcon,
  CheckmarkCircle01Icon,
  EyeIcon,
  ArrowRight01Icon,
  AlertCircleIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { storageManagementService, type StorageConfig, type StorageDriver } from "@/lib/api/services/storage-management.service"
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

export default function StorageManagementPage() {
  const { hasPermission } = usePermission()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [testing, setTesting] = React.useState(false)
  const [migrating, setMigrating] = React.useState(false)
  const [cleaning, setCleaning] = React.useState(false)

  // Permission check
  if (!hasPermission("view_storage_config") && !hasPermission("manage_storage_config")) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }
  
  const [currentConfig, setCurrentConfig] = React.useState<StorageConfig | null>(null)
  const [allConfigs, setAllConfigs] = React.useState<StorageConfig[]>([])
  const [usage, setUsage] = React.useState<any>(null)
  
  // Form state
  const [driver, setDriver] = React.useState<StorageDriver>("local")
  const [key, setKey] = React.useState("")
  const [secret, setSecret] = React.useState("")
  const [region, setRegion] = React.useState("")
  const [bucket, setBucket] = React.useState("")
  const [endpoint, setEndpoint] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [usePathStyleEndpoint, setUsePathStyleEndpoint] = React.useState(false)
  const [rootPath, setRootPath] = React.useState("")
  
  // Migration state
  const [sourceConfigId, setSourceConfigId] = React.useState<number | null>(null)
  const [destinationConfigId, setDestinationConfigId] = React.useState<number | null>(null)
  const [migrationResult, setMigrationResult] = React.useState<any>(null)
  const [migrationProgress, setMigrationProgress] = React.useState(0)
  
  // Cleanup state
  const [olderThanDays, setOlderThanDays] = React.useState(30)
  
  // Modal state
  const [addStorageDialogOpen, setAddStorageDialogOpen] = React.useState(false)
  const [editingConfig, setEditingConfig] = React.useState<StorageConfig | null>(null)
  
  // New storage form state (separate from main form)
  const [newDriver, setNewDriver] = React.useState<StorageDriver>("local")
  const [newKey, setNewKey] = React.useState("")
  const [newSecret, setNewSecret] = React.useState("")
  const [newRegion, setNewRegion] = React.useState("")
  const [newBucket, setNewBucket] = React.useState("")
  const [newEndpoint, setNewEndpoint] = React.useState("")
  const [newUrl, setNewUrl] = React.useState("")
  const [newUsePathStyleEndpoint, setNewUsePathStyleEndpoint] = React.useState(false)
  const [newRootPath, setNewRootPath] = React.useState("")

  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load critical data first (configs)
      await Promise.all([
        loadCurrentConfig(),
        loadAllConfigs(),
      ])
      // Load usage separately (non-blocking, can fail without blocking the page)
      loadUsage().catch(() => {
        // Set usage to null so UI can handle it gracefully
        setUsage(null)
      })
    } catch (error) {
      // Even if critical data fails, stop loading so user can see the error
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentConfig = async () => {
    try {
      const response = await storageManagementService.getCurrentConfig()
      if (response.success && response.data) {
        setCurrentConfig(response.data)
        populateForm(response.data)
      } else {
        // No config found is okay, set to null
        setCurrentConfig(null)
      }
    } catch (error) {
      setCurrentConfig(null)
    }
  }

  const loadAllConfigs = async () => {
    try {
      const response = await storageManagementService.listConfigs()
      if (response.success && response.data) {
        setAllConfigs(response.data)
      } else {
        setAllConfigs([])
      }
    } catch (error) {
      setAllConfigs([])
    }
  }

  const loadUsage = async () => {
    try {
      // Add a timeout wrapper for usage loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Usage loading timeout')), 10000) // 10 second timeout
      })
      
      const response = await Promise.race([
        storageManagementService.getUsage(),
        timeoutPromise,
      ]) as any
      
      if (response?.success && response?.data) {
        setUsage(response.data)
      }
    } catch (error) {
      // Set usage to null on error so UI doesn't break
      setUsage(null)
    }
  }

  const populateForm = (config: StorageConfig) => {
    setDriver(config.driver)
    setKey(config.key || "")
    setSecret(config.secret || "")
    setRegion(config.region || "")
    setBucket(config.bucket || "")
    setEndpoint(config.endpoint || "")
    setUrl(config.url || "")
    setUsePathStyleEndpoint(config.use_path_style_endpoint || false)
    setRootPath(config.root_path || "")
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Build config data based on driver type
      const configData: Partial<StorageConfig> = {
        driver,
      }

      if (driver === "local") {
        // Local storage only needs root_path (optional)
        if (rootPath) {
          configData.root_path = rootPath
        }
      } else {
        // S3 drivers require these fields
        configData.key = key || ""
        configData.region = region || ""
        configData.bucket = bucket || ""
        configData.use_path_style_endpoint = usePathStyleEndpoint || false
        
        // Secret: only send if it has a value (for updates, if user didn't change it, don't send it)
        // For new configs, secret is required and will be validated
        if (secret && secret.trim() !== "") {
          configData.secret = secret
        } else if (!currentConfig?.id) {
          // For new configs, send empty string so validation can catch it
          configData.secret = ""
        }
        
        // Optional fields
        if (endpoint) {
          configData.endpoint = endpoint
        }
        if (url) {
          configData.url = url
        }
      }

      let response
      if (currentConfig?.id) {
        response = await storageManagementService.updateConfig(currentConfig.id, configData)
      } else {
        response = await storageManagementService.createConfig(configData as StorageConfig)
      }

      if (response.success && response.data) {
        toast.success(response.message || "Storage configuration saved successfully")
        const updatedConfig = response.data
        // Update state from response instead of reloading
        if (currentConfig?.id) {
          setAllConfigs(prev => prev.map(c => c.id === updatedConfig.id ? updatedConfig : c))
        } else {
          setAllConfigs(prev => [...prev, updatedConfig])
        }
        if (updatedConfig.is_active) {
          setCurrentConfig(updatedConfig)
        }
        populateForm(updatedConfig)
      } else {
        toast.error(response.message || "Failed to save storage configuration")
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to save storage configuration"
      const errorDetails = error?.response?.data?.errors
      
      if (errorDetails) {
        // Show validation errors
        const errorList = Object.entries(errorDetails)
          .map(([field, messages]: [string, any]) => {
            const msg = Array.isArray(messages) ? messages.join(", ") : messages
            return `${field}: ${msg}`
          })
          .join("\n")
        toast.error(errorMessage, errorList)
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setTesting(true)
      const configData: Partial<StorageConfig> = {
        driver,
        key: driver !== "local" ? key : undefined,
        secret: driver !== "local" ? secret : undefined,
        region: driver !== "local" ? region : undefined,
        bucket: driver !== "local" ? bucket : undefined,
        endpoint: driver !== "local" ? endpoint : undefined,
        use_path_style_endpoint: driver !== "local" ? usePathStyleEndpoint : undefined,
      }

      const response = await storageManagementService.testConnection(configData as StorageConfig)
      if (response.success && response.data?.connected) {
        toast.success("Connection test successful!")
      } else {
        toast.error("Connection test failed")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Connection test failed")
    } finally {
      setTesting(false)
    }
  }

  const handleMigrate = async () => {
    if (!sourceConfigId || !destinationConfigId) {
      toast.error("Please select both source and destination configurations")
      return
    }

    if (sourceConfigId === destinationConfigId) {
      toast.error("Source and destination cannot be the same")
      return
    }

    if (!confirm("Are you sure you want to migrate storage? This may take a while and cannot be undone.")) {
      return
    }

    try {
      setMigrating(true)
      setMigrationProgress(0)
      setMigrationResult(null)
      
      // Simulate progress (since migration is synchronous, we'll show progress based on response)
      const progressInterval = setInterval(() => {
        setMigrationProgress((prev) => {
          if (prev >= 90) return prev
          return prev + 10
        })
      }, 500)

      const response = await storageManagementService.migrateStorage(sourceConfigId, destinationConfigId)
      
      clearInterval(progressInterval)
      setMigrationProgress(100)

      if (response.success && response.data) {
        setMigrationResult(response.data)
        const successMsg = response.message || `Migration completed: ${response.data.migrated} files migrated, ${response.data.failed} failed`
        toast.success(successMsg)
        // Only reload usage stats after migration (configs don't change)
        await loadUsage()
        
        // Clear result after 10 seconds
        setTimeout(() => {
          setMigrationResult(null)
          setMigrationProgress(0)
        }, 10000)
      } else {
        toast.error(response.message || "Migration failed")
        setMigrationProgress(0)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Migration failed")
      setMigrationProgress(0)
      setMigrationResult(null)
    } finally {
      setMigrating(false)
    }
  }

  const handleCleanup = async () => {
    if (!confirm(`Are you sure you want to delete unused files older than ${olderThanDays} days?`)) {
      return
    }

    try {
      setCleaning(true)
      const response = await storageManagementService.cleanup(olderThanDays)
      if (response.success && response.data) {
        const successMsg = response.message || `Cleanup completed: ${response.data.deleted} files deleted, ${response.data.failed} failed`
        toast.success(successMsg)
        await loadUsage()
      } else {
        toast.error(response.message || "Cleanup failed")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Cleanup failed")
    } finally {
      setCleaning(false)
    }
  }

  const handleActivate = async (id: number) => {
    try {
      const response = await storageManagementService.activateConfig(id)
      if (response.success && response.data) {
        toast.success(response.message || "Storage configuration activated")
        const activatedConfig = response.data
        // Update state from response: set all configs inactive except the activated one
        setAllConfigs(prev => prev.map(c => ({
          ...c,
          is_active: c.id === activatedConfig.id
        })))
        setCurrentConfig(activatedConfig)
        populateForm(activatedConfig)
      } else {
        toast.error(response.message || "Failed to activate configuration")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to activate configuration")
    }
  }

  const handleDelete = async (id: number, driverName: string) => {
    const config = allConfigs.find((c) => c.id === id)
    
    if (config?.is_active) {
      toast.error("Cannot delete the active storage configuration. Please activate another storage first.")
      return
    }

    if (!confirm(`Are you sure you want to delete the "${driverName}" storage configuration? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await storageManagementService.deleteConfig(id)
      if (response.success) {
        toast.success(response.message || "Storage configuration deleted successfully")
        // Remove from state instead of reloading
        setAllConfigs(prev => prev.filter(c => c.id !== id))
      } else {
        toast.error(response.message || "Failed to delete configuration")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete configuration")
    }
  }

  const resetNewStorageForm = () => {
    setNewDriver("local")
    setNewKey("")
    setNewSecret("")
    setNewRegion("")
    setNewBucket("")
    setNewEndpoint("")
    setNewUrl("")
    setNewUsePathStyleEndpoint(false)
    setNewRootPath("")
    setEditingConfig(null)
  }

  const openAddStorageDialog = (config?: StorageConfig) => {
    if (config) {
      setEditingConfig(config)
      setNewDriver(config.driver)
      setNewKey(config.key || "")
      setNewSecret("") // Don't populate secret for security
      setNewRegion(config.region || "")
      setNewBucket(config.bucket || "")
      setNewEndpoint(config.endpoint || "")
      setNewUrl(config.url || "")
      setNewUsePathStyleEndpoint(config.use_path_style_endpoint || false)
      setNewRootPath(config.root_path || "")
    } else {
      resetNewStorageForm()
    }
    setAddStorageDialogOpen(true)
  }

  const handleSaveNewStorage = async () => {
    try {
      setSaving(true)
      
      const configData: Partial<StorageConfig> = {
        driver: newDriver,
      }

      if (newDriver === "local") {
        if (newRootPath) {
          configData.root_path = newRootPath
        }
      } else {
        configData.key = newKey || ""
        configData.region = newRegion || ""
        configData.bucket = newBucket || ""
        configData.use_path_style_endpoint = newUsePathStyleEndpoint || false
        
        if (newSecret && newSecret.trim() !== "") {
          configData.secret = newSecret
        } else if (!editingConfig) {
          configData.secret = ""
        }
        
        if (newEndpoint) {
          configData.endpoint = newEndpoint
        }
        if (newUrl) {
          configData.url = newUrl
        }
      }

      let response
      if (editingConfig?.id) {
        response = await storageManagementService.updateConfig(editingConfig.id, configData)
      } else {
        response = await storageManagementService.createConfig(configData as StorageConfig)
      }

      if (response.success && response.data) {
        toast.success(response.message || (editingConfig ? "Storage configuration updated successfully" : "Storage configuration created successfully"))
        const savedConfig = response.data
        // Update state from response instead of reloading
        if (editingConfig?.id) {
          setAllConfigs(prev => prev.map(c => c.id === savedConfig.id ? savedConfig : c))
        } else {
          setAllConfigs(prev => [...prev, savedConfig])
        }
        if (savedConfig.is_active) {
          setCurrentConfig(savedConfig)
          populateForm(savedConfig)
        }
        resetNewStorageForm()
        setAddStorageDialogOpen(false)
      } else {
        toast.error(response.message || "Failed to save storage configuration")
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to save storage configuration"
      const errorDetails = error?.response?.data?.errors
      
      if (errorDetails) {
        const errorList = Object.entries(errorDetails)
          .map(([field, messages]: [string, any]) => {
            const msg = Array.isArray(messages) ? messages.join(", ") : messages
            return `${field}: ${msg}`
          })
          .join("\n")
        toast.error(errorMessage, errorList)
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setSaving(false)
    }
  }

  const newRequiresS3Config = newDriver !== "local"

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  const formatToGB = (bytes: number): string => {
    if (bytes === 0) return "0 GB"
    const gb = bytes / (1024 * 1024 * 1024)
    // Show 2 decimal places for GB
    return gb.toFixed(2) + " GB"
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading storage settings...</div>
        </div>
      </AdminDashboardLayout>
    )
  }

  const requiresS3Config = driver !== "local"

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={Database02Icon} className="size-8" />
            Storage Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure system storage and manage file uploads
          </p>
        </div>

        

        {/* Storage Usage Overview */}
        {usage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Database02Icon} className="size-5" />
                Storage Usage
              </CardTitle>
              <CardDescription>
                Current storage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Total Size</Label>
                  <p className="text-2xl font-bold">{formatToGB(usage.total_size || 0)}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">File Count</Label>
                  <p className="text-2xl font-bold">{usage.file_count || 0}</p>
                </div>
                {usage.driver && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">Active Driver</Label>
                    <p className="text-lg font-semibold capitalize">{usage.driver.replace("_", " ")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Configurations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Storage Configurations</CardTitle>
                <CardDescription>
                  Manage all storage configurations
                </CardDescription>
              </div>
              <Button
                onClick={() => openAddStorageDialog()}
                size="sm"
              >
                <HugeiconsIcon icon={Upload01Icon} className="size-4 mr-2" />
                Add New Storage
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {allConfigs.length > 0 ? (
              <div className="space-y-2">
                {allConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold capitalize">
                        {config.driver.replace("_", " ")}
                        {config.is_active && (
                          <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Active)</span>
                        )}
                      </p>
                      {config.bucket && (
                        <p className="text-sm text-muted-foreground">Bucket: {config.bucket}</p>
                      )}
                      {config.region && (
                        <p className="text-sm text-muted-foreground">Region: {config.region}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => config.id && openAddStorageDialog(config)}
                        disabled={config.is_active}
                        title={config.is_active ? "Cannot edit active storage. Deactivate it first or activate another storage." : "Edit this storage configuration"}
                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Edit
                      </Button>
                      {!config.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => config.id && handleActivate(config.id)}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => config.id && handleDelete(config.id, config.driver.replace("_", " "))}
                        disabled={config.is_active}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={config.is_active ? "Cannot delete active storage. Activate another storage first." : "Delete this storage configuration"}
                      >
                        <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No storage configurations found.</p>
                <p className="text-sm mt-2">Click "Add New Storage" to create one.</p>
              </div>
            )}
          </CardContent>
        </Card>

        

        {/* Storage Migration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={RefreshIcon} className="size-5" />
              Migrate Storage
            </CardTitle>
            <CardDescription>
              Migrate files from one storage to another without data loss. All files will be copied to the destination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allConfigs.length < 2 ? (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                <HugeiconsIcon icon={InformationCircleIcon} className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">Multiple Storage Configurations Required</p>
                  <p>You need at least 2 storage configurations to migrate files. Create another storage configuration above to enable migration.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Migration Flow Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Source Storage */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Source Storage</Label>
                    <select
                      value={sourceConfigId || ""}
                      onChange={(e) => {
                        setSourceConfigId(Number(e.target.value) || null)
                        setMigrationResult(null)
                      }}
                      disabled={migrating}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    >
                      <option value="">Select source...</option>
                      {allConfigs.map((config) => (
                        <option key={config.id} value={config.id}>
                          {config.driver.replace("_", " ").toUpperCase()} {config.is_active && "(Active)"}
                        </option>
                      ))}
                    </select>
                    {sourceConfigId && (
                      <div className="mt-2 p-2 rounded-md bg-muted text-xs">
                        {(() => {
                          const config = allConfigs.find((c) => c.id === sourceConfigId)
                          return config ? (
                            <div>
                              <div className="font-semibold capitalize">{config.driver.replace("_", " ")}</div>
                              {config.bucket && <div className="text-muted-foreground">Bucket: {config.bucket}</div>}
                              {config.region && <div className="text-muted-foreground">Region: {config.region}</div>}
                            </div>
                          ) : null
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className={cn(
                        "size-8 text-muted-foreground",
                        migrating && "animate-pulse"
                      )}
                    />
                  </div>

                  {/* Destination Storage */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Destination Storage</Label>
                    <select
                      value={destinationConfigId || ""}
                      onChange={(e) => {
                        setDestinationConfigId(Number(e.target.value) || null)
                        setMigrationResult(null)
                      }}
                      disabled={migrating}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                    >
                      <option value="">Select destination...</option>
                      {allConfigs.map((config) => (
                        <option key={config.id} value={config.id}>
                          {config.driver.replace("_", " ").toUpperCase()} {config.is_active && "(Active)"}
                        </option>
                      ))}
                    </select>
                    {destinationConfigId && (
                      <div className="mt-2 p-2 rounded-md bg-muted text-xs">
                        {(() => {
                          const config = allConfigs.find((c) => c.id === destinationConfigId)
                          return config ? (
                            <div>
                              <div className="font-semibold capitalize">{config.driver.replace("_", " ")}</div>
                              {config.bucket && <div className="text-muted-foreground">Bucket: {config.bucket}</div>}
                              {config.region && <div className="text-muted-foreground">Region: {config.region}</div>}
                            </div>
                          ) : null
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Warning Message */}
                {sourceConfigId && destinationConfigId && sourceConfigId !== destinationConfigId && (
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                    <HugeiconsIcon icon={InformationCircleIcon} className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-semibold mb-1">Migration Warning</p>
                      <p>This will copy all files from the source storage to the destination. The process may take a while depending on the number of files. Files in the source storage will remain intact.</p>
                    </div>
                  </div>
                )}

                {/* Migration Progress */}
                {migrating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Migrating files...</span>
                      <span className="font-semibold">{migrationProgress}%</span>
                    </div>
                    <Progress value={migrationProgress} />
                    <p className="text-xs text-muted-foreground">
                      Please wait while files are being copied. Do not close this page.
                    </p>
                  </div>
                )}

                {/* Migration Results */}
                {migrationResult && !migrating && (
                  <div className="space-y-3 p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={migrationResult.failed === 0 ? CheckmarkCircle01Icon : AlertCircleIcon}
                        className={cn(
                          "size-5",
                          migrationResult.failed === 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-amber-600 dark:text-amber-400"
                        )}
                      />
                      <span className="font-semibold">Migration Results</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Files</div>
                        <div className="text-lg font-bold">{migrationResult.total}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Migrated</div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {migrationResult.migrated}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Failed</div>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          {migrationResult.failed}
                        </div>
                      </div>
                    </div>
                    {migrationResult.errors && migrationResult.errors.length > 0 && (
                      <div className="mt-3">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View {migrationResult.errors.length} error(s)
                          </summary>
                          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                            {migrationResult.errors.map((error: any, idx: number) => (
                              <div key={idx} className="p-2 rounded bg-destructive/10 text-destructive">
                                <div className="font-semibold">{error.path}</div>
                                <div className="text-muted-foreground">{error.error}</div>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                )}

                {/* Start Migration Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleMigrate}
                    disabled={migrating || !sourceConfigId || !destinationConfigId || sourceConfigId === destinationConfigId}
                    variant="outline"
                    className="min-w-[150px]"
                  >
                    {migrating ? (
                      <>
                        <HugeiconsIcon icon={RefreshIcon} className="size-4 mr-2 animate-spin" />
                        Migrating...
                      </>
                    ) : (
                      <>
                        <HugeiconsIcon icon={RefreshIcon} className="size-4 mr-2" />
                        Start Migration
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cleanup Unused Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={DeleteIcon} className="size-5" />
              Clean Unused Files
            </CardTitle>
            <CardDescription>
              Remove files that are no longer in use
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>
                  <Label>Delete files older than (days)</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={olderThanDays}
                    onChange={(e) => setOlderThanDays(Number(e.target.value))}
                  />
                </FieldContent>
              </Field>

              <Button
                onClick={handleCleanup}
                disabled={cleaning}
                variant="destructive"
              >
                {cleaning ? "Cleaning..." : "Clean Unused Files"}
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Add/Edit Storage Dialog */}
        <Dialog open={addStorageDialogOpen} onOpenChange={setAddStorageDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? "Edit Storage Configuration" : "Add New Storage"}
              </DialogTitle>
              <DialogDescription>
                {editingConfig 
                  ? "Update the storage configuration. Leave secret empty to keep the existing value."
                  : "Configure a new storage provider. Only one storage can be active at a time."
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Field>
                <FieldLabel>
                  <Label>Storage Driver</Label>
                </FieldLabel>
                <FieldContent>
                  <select
                    value={newDriver}
                    onChange={(e) => setNewDriver(e.target.value as StorageDriver)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <option value="local">Local Storage</option>
                    <option value="do_s3">DigitalOcean Spaces</option>
                    <option value="aws_s3">AWS S3</option>
                    <option value="contabo_s3">Contabo Object Storage</option>
                    <option value="cloudflare_r2">Cloudflare R2</option>
                    <option value="backblaze_b2">Backblaze B2</option>
                  </select>
                </FieldContent>
              </Field>

              {newRequiresS3Config && (
                <>
                  <Field>
                    <FieldLabel>
                      <Label>Access Key ID</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        type="text"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        placeholder="Enter access key"
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label>Secret Access Key</Label>
                      {editingConfig && (
                        <span className="text-xs text-muted-foreground ml-2">(Leave empty to keep existing)</span>
                      )}
                    </FieldLabel>
                    <FieldContent>
                      <PasswordInput
                        value={newSecret}
                        onChange={(e) => setNewSecret(e.target.value)}
                        placeholder={editingConfig ? "Enter new secret or leave empty" : "Enter secret key"}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label>Region</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        type="text"
                        value={newRegion}
                        onChange={(e) => setNewRegion(e.target.value)}
                        placeholder="e.g., us-east-1, nyc3"
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label>Bucket Name</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        type="text"
                        value={newBucket}
                        onChange={(e) => setNewBucket(e.target.value)}
                        placeholder="Enter bucket name"
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label>Endpoint (Optional)</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        type="url"
                        value={newEndpoint}
                        onChange={(e) => setNewEndpoint(e.target.value)}
                        placeholder="Custom endpoint URL"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty for default endpoints
                      </p>
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label>CDN URL (Optional)</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        type="url"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="CDN URL for public access"
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel>
                      <Label>Use Path Style Endpoint</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="new-use-path-style"
                          checked={newUsePathStyleEndpoint}
                          onChange={(e) => setNewUsePathStyleEndpoint(e.target.checked)}
                          className="size-4 rounded border-input"
                        />
                        <Label htmlFor="new-use-path-style" className="text-sm font-normal cursor-pointer">
                          Enable path-style endpoint (required for some S3-compatible services)
                        </Label>
                      </div>
                    </FieldContent>
                  </Field>
                </>
              )}

              {newDriver === "local" && (
                <Field>
                  <FieldLabel>
                    <Label>Root Path (Optional)</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="text"
                      value={newRootPath}
                      onChange={(e) => setNewRootPath(e.target.value)}
                      placeholder="Custom root path"
                    />
                  </FieldContent>
                </Field>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAddStorageDialogOpen(false)
                  resetNewStorageForm()
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              {newRequiresS3Config && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    try {
                      setTesting(true)
                      const configData: Partial<StorageConfig> = {
                        driver: newDriver,
                        key: newKey || "",
                        secret: newSecret || "",
                        region: newRegion || "",
                        bucket: newBucket || "",
                        endpoint: newEndpoint || undefined,
                        use_path_style_endpoint: newUsePathStyleEndpoint || false,
                      }

                      const response = await storageManagementService.testConnection(configData as StorageConfig)
                      if (response.success && response.data?.connected) {
                        toast.success("Connection test successful!")
                      } else {
                        toast.error(response.message || "Connection test failed")
                      }
                    } catch (error: any) {
                      toast.error(error?.response?.data?.message || error?.message || "Connection test failed")
                    } finally {
                      setTesting(false)
                    }
                  }}
                  disabled={testing || !newKey || !newSecret || !newRegion || !newBucket}
                >
                  {testing ? "Testing..." : "Test Connection"}
                </Button>
              )}
              <Button onClick={handleSaveNewStorage} disabled={saving}>
                {saving ? "Saving..." : editingConfig ? "Update Configuration" : "Create Configuration"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
      </div>
    </AdminDashboardLayout>
  )
}
