"use client"

import * as React from "react"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
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
import {
  proxySetupService,
  socialConnectionService,
  type Proxy,
  type ProxyType,
  type ProxySettings,
  type ProxyWithChannels,
  type SocialChannel,
} from "@/lib/api"
import { toast } from "@/lib/toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  MoreHorizontalCircle01Icon,
  EditIcon,
  DeleteIcon,
  Settings01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"

const PROXY_TYPES: { value: ProxyType; label: string }[] = [
  { value: "http", label: "HTTP" },
  { value: "https", label: "HTTPS" },
  { value: "socks4", label: "SOCKS4" },
  { value: "socks5", label: "SOCKS5" },
]

function getStatusBadge(proxy: Proxy) {
  if (!proxy.last_check_status) {
    return <Badge variant="secondary">Not tested</Badge>
  }
  if (proxy.last_check_status === "success") {
    return <Badge variant="default" className="bg-green-600">Connected</Badge>
  }
  if (proxy.last_check_status === "failed") {
    return <Badge variant="destructive">Failed</Badge>
  }
  return <Badge variant="secondary">Pending</Badge>
}

export default function ProxySetupPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [proxies, setProxies] = React.useState<Proxy[]>([])
  const [settings, setSettings] = React.useState<ProxySettings | null>(null)
  const [channels, setChannels] = React.useState<SocialChannel[]>([])

  // Dialog states
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editProxy, setEditProxy] = React.useState<Proxy | null>(null)
  const [deleteProxy, setDeleteProxy] = React.useState<Proxy | null>(null)
  const [assignProxy, setAssignProxy] = React.useState<ProxyWithChannels | null>(null)
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  // Form states
  const [formName, setFormName] = React.useState("")
  const [formType, setFormType] = React.useState<ProxyType>("http")
  const [formHost, setFormHost] = React.useState("")
  const [formPort, setFormPort] = React.useState("")
  const [formUsername, setFormUsername] = React.useState("")
  const [formPassword, setFormPassword] = React.useState("")
  const [formEnabled, setFormEnabled] = React.useState(true)
  const [formSaving, setFormSaving] = React.useState(false)

  // Settings form states
  const [settingsUseRandom, setSettingsUseRandom] = React.useState(false)
  const [settingsApplyAll, setSettingsApplyAll] = React.useState(true)
  const [settingsOnFailure, setSettingsOnFailure] = React.useState<"stop_automation" | "continue_without_proxy">("continue_without_proxy")
  const [settingsSaving, setSettingsSaving] = React.useState(false)

  // Channel assignment states
  const [assignedChannels, setAssignedChannels] = React.useState<Record<number, boolean>>({})
  const [assignSaving, setAssignSaving] = React.useState(false)

  // Testing state
  const [testingProxyId, setTestingProxyId] = React.useState<number | null>(null)

  const load = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [proxiesRes, settingsRes, channelsRes] = await Promise.all([
        proxySetupService.listProxies(),
        proxySetupService.getSettings(),
        socialConnectionService.getChannels({ page: 1, per_page: 100 }),
      ])

      if (proxiesRes.success && proxiesRes.data) {
        setProxies(proxiesRes.data)
      }

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data)
        setSettingsUseRandom(settingsRes.data.use_random_proxy)
        setSettingsApplyAll(settingsRes.data.apply_to_all_channels)
        setSettingsOnFailure(settingsRes.data.on_proxy_failure)
      }

      if (channelsRes.success && channelsRes.data) {
        setChannels(channelsRes.data)
      }
    } catch (error) {
      console.error("Failed to load proxy data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setFormName("")
    setFormType("http")
    setFormHost("")
    setFormPort("")
    setFormUsername("")
    setFormPassword("")
    setFormEnabled(true)
  }

  const openCreate = () => {
    resetForm()
    setCreateOpen(true)
  }

  const openEdit = (proxy: Proxy) => {
    setFormName(proxy.name)
    setFormType(proxy.type)
    setFormHost(proxy.host)
    setFormPort(proxy.port.toString())
    setFormUsername("")
    setFormPassword("")
    setFormEnabled(proxy.is_enabled)
    setEditProxy(proxy)
  }

  const openAssign = async (proxy: Proxy) => {
    try {
      const res = await proxySetupService.getProxy(proxy.id)
      if (res.success && res.data) {
        const proxyWithChannels = res.data
        setAssignProxy(proxyWithChannels)
        const assigned: Record<number, boolean> = {}
        proxyWithChannels.channels.forEach((ch) => {
          assigned[ch.id] = true
        })
        setAssignedChannels(assigned)
      }
    } catch (error) {
      toast.error("Failed to load proxy details")
    }
  }

  const handleCreate = async () => {
    if (!formName.trim() || !formHost.trim() || !formPort.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setFormSaving(true)
    try {
      const res = await proxySetupService.createProxy({
        name: formName.trim(),
        type: formType,
        host: formHost.trim(),
        port: parseInt(formPort, 10),
        username: formUsername.trim() || null,
        password: formPassword.trim() || null,
        is_enabled: formEnabled,
      })

      if (res.success && res.data) {
        setProxies((prev) => [...prev, res.data!])
        toast.success("Proxy created successfully")
        setCreateOpen(false)
        resetForm()
      } else {
        toast.error(res.message || "Failed to create proxy")
      }
    } catch (error) {
      toast.error("Failed to create proxy")
    } finally {
      setFormSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editProxy) return
    if (!formName.trim() || !formHost.trim() || !formPort.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setFormSaving(true)
    try {
      const res = await proxySetupService.updateProxy(editProxy.id, {
        name: formName.trim(),
        type: formType,
        host: formHost.trim(),
        port: parseInt(formPort, 10),
        username: formUsername.trim() || null,
        password: formPassword.trim() || null,
        is_enabled: formEnabled,
      })

      if (res.success && res.data) {
        setProxies((prev) => prev.map((p) => (p.id === editProxy.id ? res.data! : p)))
        toast.success("Proxy updated successfully")
        setEditProxy(null)
        resetForm()
      } else {
        toast.error(res.message || "Failed to update proxy")
      }
    } catch (error) {
      toast.error("Failed to update proxy")
    } finally {
      setFormSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteProxy) return

    try {
      const res = await proxySetupService.deleteProxy(deleteProxy.id)
      if (res.success) {
        setProxies((prev) => prev.filter((p) => p.id !== deleteProxy.id))
        toast.success("Proxy deleted successfully")
        setDeleteProxy(null)
      } else {
        toast.error(res.message || "Failed to delete proxy")
      }
    } catch (error) {
      toast.error("Failed to delete proxy")
    }
  }

  const handleToggleEnabled = async (proxy: Proxy) => {
    try {
      const res = proxy.is_enabled
        ? await proxySetupService.disableProxy(proxy.id)
        : await proxySetupService.enableProxy(proxy.id)

      if (res.success && res.data) {
        setProxies((prev) => prev.map((p) => (p.id === proxy.id ? res.data! : p)))
        toast.success(res.data.is_enabled ? "Proxy enabled" : "Proxy disabled")
      }
    } catch (error) {
      toast.error("Failed to toggle proxy status")
    }
  }

  const handleTest = async (proxy: Proxy) => {
    setTestingProxyId(proxy.id)
    try {
      const res = await proxySetupService.testProxy(proxy.id)
      if (res.success && res.data) {
        if (res.data.success) {
          toast.success(`Proxy is working! Response time: ${res.data.response_time_ms}ms`)
        } else {
          toast.error(`Proxy test failed: ${res.data.message}`)
        }
        // Refresh proxies to show updated status
        const proxiesRes = await proxySetupService.listProxies()
        if (proxiesRes.success && proxiesRes.data) {
          setProxies(proxiesRes.data)
        }
      }
    } catch (error) {
      toast.error("Failed to test proxy")
    } finally {
      setTestingProxyId(null)
    }
  }

  const handleAssignChannels = async () => {
    if (!assignProxy) return

    setAssignSaving(true)
    try {
      const channelIds = Object.entries(assignedChannels)
        .filter(([, selected]) => selected)
        .map(([id]) => parseInt(id, 10))

      const res = await proxySetupService.assignChannels(assignProxy.id, channelIds)
      if (res.success) {
        toast.success("Channels assigned successfully")
        setAssignProxy(null)
        setAssignedChannels({})
        // Refresh proxies to show updated channel count
        const proxiesRes = await proxySetupService.listProxies()
        if (proxiesRes.success && proxiesRes.data) {
          setProxies(proxiesRes.data)
        }
      } else {
        toast.error(res.message || "Failed to assign channels")
      }
    } catch (error) {
      toast.error("Failed to assign channels")
    } finally {
      setAssignSaving(false)
    }
  }

  const handleUpdateSettings = async () => {
    setSettingsSaving(true)
    try {
      const res = await proxySetupService.updateSettings({
        use_random_proxy: settingsUseRandom,
        apply_to_all_channels: settingsApplyAll,
        on_proxy_failure: settingsOnFailure,
      })

      if (res.success && res.data) {
        setSettings(res.data)
        toast.success("Settings updated successfully")
        setSettingsOpen(false)
      } else {
        toast.error(res.message || "Failed to update settings")
      }
    } catch (error) {
      toast.error("Failed to update settings")
    } finally {
      setSettingsSaving(false)
    }
  }

  const recordsLabel = isLoading ? "..." : `${proxies.length}`

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              Proxy Setup{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({recordsLabel} proxies)
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure proxies for social media automation
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSettingsOpen(true)}>
              <HugeiconsIcon icon={Settings01Icon} className="size-4 mr-2" />
              Settings
            </Button>
            <Button onClick={openCreate}>
              <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
              Add Proxy
            </Button>
          </div>
        </div>

        {/* Settings summary */}
        {settings && (
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Random selection:</span>
                  <Badge variant={settings.use_random_proxy ? "default" : "secondary"}>
                    {settings.use_random_proxy ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Apply to:</span>
                  <Badge variant="outline">
                    {settings.apply_to_all_channels ? "All channels" : "Selected channels"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">On failure:</span>
                  <Badge variant={settings.on_proxy_failure === "stop_automation" ? "destructive" : "secondary"}>
                    {settings.on_proxy_failure === "stop_automation" ? "Stop automation" : "Continue without proxy"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Loading proxies...</p>
            </CardContent>
          </Card>
        ) : proxies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-2">
              <p className="text-sm text-muted-foreground">No proxies configured yet.</p>
              <Button variant="outline" onClick={openCreate}>
                Add your first proxy
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {proxies.map((proxy) => (
              <Card key={proxy.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{proxy.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {proxy.type.toUpperCase()} - {proxy.host}:{proxy.port}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <HugeiconsIcon icon={MoreHorizontalCircle01Icon} className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(proxy)}>
                          <HugeiconsIcon icon={EditIcon} className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openAssign(proxy)}>
                          <HugeiconsIcon icon={Settings01Icon} className="size-4 mr-2" />
                          Assign channels
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTest(proxy)}
                          disabled={testingProxyId === proxy.id}
                        >
                          <HugeiconsIcon icon={RefreshIcon} className="size-4 mr-2" />
                          {testingProxyId === proxy.id ? "Testing..." : "Test connection"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteProxy(proxy)}
                          className="text-destructive focus:text-destructive"
                        >
                          <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(proxy)}
                      {proxy.has_auth && (
                        <Badge variant="outline" className="text-xs">Auth</Badge>
                      )}
                      {(proxy.channels_count ?? 0) > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {proxy.channels_count} channel{(proxy.channels_count ?? 0) > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <Switch
                      checked={proxy.is_enabled}
                      onCheckedChange={() => handleToggleEnabled(proxy)}
                    />
                  </div>
                  {proxy.last_check_message && proxy.last_check_status === "failed" && (
                    <p className="text-xs text-destructive mt-2 truncate" title={proxy.last_check_message}>
                      {proxy.last_check_message}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Proxy Dialog */}
        <AlertDialog open={createOpen || !!editProxy} onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false)
            setEditProxy(null)
            resetForm()
          }
        }}>
          <AlertDialogContent className="!w-[500px] !max-w-[500px]">
            <AlertDialogHeader>
              <AlertDialogTitle>{editProxy ? "Edit Proxy" : "Add New Proxy"}</AlertDialogTitle>
              <AlertDialogDescription>
                {editProxy ? "Update proxy configuration" : "Configure a new proxy server"}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="My Proxy"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formType} onValueChange={(v) => setFormType(v as ProxyType || "http")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROXY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port *</Label>
                  <Input
                    id="port"
                    type="number"
                    placeholder="8080"
                    value={formPort}
                    onChange={(e) => setFormPort(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="host">Host *</Label>
                <Input
                  id="host"
                  placeholder="proxy.example.com or 192.168.1.1"
                  value={formHost}
                  onChange={(e) => setFormHost(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Optional"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Optional"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="enabled"
                  checked={formEnabled}
                  onCheckedChange={setFormEnabled}
                />
                <Label htmlFor="enabled">Enabled</Label>
              </div>
            </div>

            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                onClick={editProxy ? handleUpdate : handleCreate}
                disabled={formSaving}
              >
                {formSaving ? "Saving..." : editProxy ? "Update" : "Create"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteProxy} onOpenChange={(open) => !open && setDeleteProxy(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Proxy</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{deleteProxy?.name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Settings Dialog */}
        <AlertDialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <AlertDialogContent className="!w-[500px] !max-w-[500px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Proxy Settings</AlertDialogTitle>
              <AlertDialogDescription>
                Configure how proxies are used for automation
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-6 mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Random proxy selection</Label>
                  <p className="text-xs text-muted-foreground">
                    Randomly select from enabled proxies for each request
                  </p>
                </div>
                <Switch
                  checked={settingsUseRandom}
                  onCheckedChange={setSettingsUseRandom}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Apply to all channels</Label>
                  <p className="text-xs text-muted-foreground">
                    Use proxies for all social media channels
                  </p>
                </div>
                <Switch
                  checked={settingsApplyAll}
                  onCheckedChange={setSettingsApplyAll}
                />
              </div>

              <div className="space-y-2">
                <Label>On proxy failure</Label>
                <Select
                  value={settingsOnFailure}
                  onValueChange={(v) => setSettingsOnFailure(v as "stop_automation" | "continue_without_proxy" || "continue_without_proxy")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="continue_without_proxy">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-green-600" />
                        Continue without proxy
                      </div>
                    </SelectItem>
                    <SelectItem value="stop_automation">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={Cancel01Icon} className="size-4 text-destructive" />
                        Stop automation
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {settingsOnFailure === "stop_automation"
                    ? "Automation will stop if proxy connection fails"
                    : "Automation will continue without proxy if connection fails"}
                </p>
              </div>
            </div>

            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button onClick={handleUpdateSettings} disabled={settingsSaving}>
                {settingsSaving ? "Saving..." : "Save Settings"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Assign Channels Dialog */}
        <AlertDialog open={!!assignProxy} onOpenChange={(open) => {
          if (!open) {
            setAssignProxy(null)
            setAssignedChannels({})
          }
        }}>
          <AlertDialogContent className="!w-[600px] !max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Assign Channels to {assignProxy?.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Select which social media channels should use this proxy.
                {settings?.apply_to_all_channels && (
                  <span className="block mt-1 text-yellow-600">
                    Note: You have &quot;Apply to all channels&quot; enabled in settings. These assignments will only be used when that setting is disabled.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-2 max-h-[400px] overflow-y-auto mt-4">
              {channels.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No social media channels connected yet.
                </p>
              ) : (
                channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted/50 cursor-pointer"
                    onClick={() => setAssignedChannels((prev) => ({
                      ...prev,
                      [channel.id]: !prev[channel.id],
                    }))}
                  >
                    <Checkbox
                      checked={!!assignedChannels[channel.id]}
                      onCheckedChange={(checked) => setAssignedChannels((prev) => ({
                        ...prev,
                        [channel.id]: !!checked,
                      }))}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {channel.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={channel.avatar_url}
                        alt={channel.name}
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {channel.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{channel.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {channel.provider} - {channel.type.replace(/_/g, " ")}
                      </p>
                    </div>
                    {!channel.is_active && (
                      <Badge variant="secondary" className="text-xs">Paused</Badge>
                    )}
                  </div>
                ))
              )}
            </div>

            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button onClick={handleAssignChannels} disabled={assignSaving}>
                {assignSaving ? "Saving..." : "Save Assignments"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CustomerDashboardLayout>
  )
}
