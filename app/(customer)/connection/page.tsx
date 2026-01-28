"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
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
  socialConnectionService,
  type SocialChannel,
  type SocialChannelType,
  type SocialProvider,
  type SocialConnectionGroup,
} from "@/lib/api"
import { toast } from "@/lib/toast"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  Search01Icon,
  FilterIcon,
  MoreHorizontalCircle01Icon,
  CheckmarkCircle01Icon,
  PauseIcon,
  DeleteIcon,
} from "@hugeicons/core-free-icons"
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa"

const PROVIDER_LABEL: Record<SocialProvider, string> = {
  meta: "Meta",
  google: "YouTube",
  tiktok: "TikTok",
}

function channelSubtitle(ch: SocialChannel): string {
  switch (ch.type) {
    case "facebook_page":
      return "Facebook page"
    case "facebook_profile":
      return "Facebook profile"
    case "instagram_business":
      return "Instagram profile"
    case "youtube_channel":
      return "Youtube channel"
    case "tiktok_profile":
      return "Tiktok profile"
    default:
      return ch.type
  }
}

function avatarFallback(label: string) {
  return label?.slice(0, 1).toUpperCase() || "C"
}

function ConnectionPageContent() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = React.useState(true)
  const [enabledProviders, setEnabledProviders] = React.useState<SocialProvider[]>([])
  const [channels, setChannels] = React.useState<SocialChannel[]>([])
  const [groups, setGroups] = React.useState<SocialConnectionGroup[]>([])
  const [selected, setSelected] = React.useState<Record<number, boolean>>({})
  const [addOpen, setAddOpen] = React.useState(false)
  const [newGroupOpen, setNewGroupOpen] = React.useState(false)
  const [newGroupName, setNewGroupName] = React.useState("")
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filterProviders, setFilterProviders] = React.useState<SocialProvider[]>([])
  const [filterStatus, setFilterStatus] = React.useState<"all" | "active" | "paused">("all")
  const [filterGroupId, setFilterGroupId] = React.useState<number | null>(null)

  // Post-connect selection state: let user choose which channels to add
  const [selectionOpen, setSelectionOpen] = React.useState(false)
  const [selectionProvider, setSelectionProvider] = React.useState<SocialProvider | null>(null)
  const [selectionToken, setSelectionToken] = React.useState<string | null>(null)
  const [selectionChannels, setSelectionChannels] = React.useState<Array<{
    key: string
    provider: string
    type: SocialChannelType
    provider_channel_id: string
    name: string
    username?: string | null
    avatar_url?: string | null
    metadata?: Record<string, any>
  }>>([])
  const [selectionSelected, setSelectionSelected] = React.useState<Record<string, boolean>>({})
  const [selectionSaving, setSelectionSaving] = React.useState(false)
  const [selectionLoading, setSelectionLoading] = React.useState(false)

  const load = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [provRes, chanRes, groupsRes] = await Promise.all([
        socialConnectionService.getEnabledProviders(),
        socialConnectionService.getChannels({ page: 1, per_page: 100 }),
        socialConnectionService.getGroups(),
      ])

      let nextProviders: SocialProvider[] = []
      let nextChannels: SocialChannel[] = []
      let nextGroups: SocialConnectionGroup[] = []

      if (provRes.success && provRes.data) {
        nextProviders = provRes.data.map((p) => p.provider)
        setEnabledProviders(nextProviders)
      } else {
        setEnabledProviders([])
      }

      if (chanRes.success && chanRes.data) {
        nextChannels = chanRes.data
        setChannels(nextChannels)
      } else {
        setChannels([])
      }

      if (groupsRes.success && groupsRes.data) {
        nextGroups = groupsRes.data
        setGroups(nextGroups)
      } else {
        setGroups([])
      }

      return { providers: nextProviders, channels: nextChannels, groups: nextGroups }
    } catch (error) {
      setEnabledProviders([])
      setChannels([])
      setGroups([])
      return { providers: [] as SocialProvider[], channels: [] as SocialChannel[], groups: [] as SocialConnectionGroup[] }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Show result of OAuth callback (success/error) when redirected back from provider
  React.useEffect(() => {
    const status = searchParams.get("status")
    const provider = searchParams.get("provider") as SocialProvider | null
    const token = searchParams.get("token")
    const channelsAvailable = searchParams.get("channels_available")
    const channelsUpserted = searchParams.get("channels_upserted")

    if (status === "select" && provider === "meta" && token) {
      // New flow: Fetch available channels and show selection modal
      setSelectionLoading(true)
      setSelectionProvider("meta")
      setSelectionToken(token)

      socialConnectionService
        .getAvailableChannels("meta", token)
        .then((res) => {
          if (res.success && res.data) {
            const channels = res.data
            // Start with no channels selected - user selects one by one
            const initial: Record<string, boolean> = {}

            setSelectionChannels(channels)
            setSelectionSelected(initial)
            setSelectionOpen(true)

            const count = channels.length
            toast.success(
              `Found ${count} Meta channel${count > 1 ? "s" : ""}. Select which ones to add.`,
            )
          } else {
            toast.error("Failed to load available connections")
          }
        })
        .catch((error) => {
          toast.error("Failed to load available channels")
        })
        .finally(() => {
          setSelectionLoading(false)
          // Clear URL params
          const url = new URL(window.location.href)
          url.searchParams.delete("status")
          url.searchParams.delete("provider")
          url.searchParams.delete("token")
          url.searchParams.delete("channels_available")
          window.history.replaceState({}, "", url.toString())
        })
    } else if (status === "success") {
      const count = channelsUpserted ? parseInt(channelsUpserted, 10) : 0
      if (count > 0) {
        toast.success(`Successfully connected ${count} connection${count > 1 ? "s" : ""}`)
      } else {
        toast.success("Account connected successfully")
      }
      // Reload channels to reflect new connection
      load()
      // Clear URL params after showing message
      const url = new URL(window.location.href)
      url.searchParams.delete("status")
      url.searchParams.delete("provider")
      url.searchParams.delete("channels_upserted")
      window.history.replaceState({}, "", url.toString())
    } else if (status === "error") {
      toast.error("Social connection failed. Please try again.")
      // Clear URL params after showing message
      const url = new URL(window.location.href)
      url.searchParams.delete("status")
      url.searchParams.delete("provider")
      url.searchParams.delete("error")
      window.history.replaceState({}, "", url.toString())
    }
    // We intentionally do not include `load` in deps to avoid double-loading on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  React.useEffect(() => {
    load()
  }, [load])

  const confirmSelection = async () => {
    if (!selectionProvider || !selectionToken) {
      setSelectionOpen(false)
      return
    }

    const selectedKeys = selectionChannels
      .filter((ch) => selectionSelected[ch.key])
      .map((ch) => ch.key)

    if (selectedKeys.length === 0) {
      toast.error("Please select at least one connection")
      return
    }

    setSelectionSaving(true)
    try {
      const res = await socialConnectionService.saveSelectedChannels(
        selectionProvider,
        selectionToken,
        selectedKeys,
      )

      if (res.success) {
        const count = res.data?.channels_upserted ?? selectedKeys.length
        toast.success(`Successfully added ${count} connection${count > 1 ? "s" : ""}`)
        await load()
        setSelectionOpen(false)
        setSelectionToken(null)
        setSelectionChannels([])
        setSelectionSelected({})
      } else {
        toast.error(res.message || "Failed to save selected channels")
      }
    } catch (error) {
      toast.error("Failed to save selected channels. Please try again.")
    } finally {
      setSelectionSaving(false)
    }
  }

  const connect = async (provider: SocialProvider, channelTypes?: string[]) => {
    try {
      const res = await socialConnectionService.getRedirectUrl(provider, channelTypes)
      if (res.success && res.data?.redirect_url) {
        window.location.href = res.data.redirect_url
        return
      }

      toast.error(res.message || "Provider is not configured or enabled")
    } catch (error) {
      toast.error("Provider is not configured or enabled")
    }
  }

  const disconnect = async (channelId: number) => {
    try {
      const res = await socialConnectionService.disconnectChannel(channelId)
      if (res.success && res.data) {
        const updatedChannel = res.data
        setChannels((prev) => prev.map((c) => (c.id === channelId ? updatedChannel : c)))
      }
    } catch (error) {
      console.error("Failed to disconnect channel:", error)
      toast.error("Failed to disconnect channel")
    }
  }

  const updateChannelStatus = async (channelId: number, isActive: boolean) => {
    try {
      const res = await socialConnectionService.updateChannelStatus(channelId, isActive)
      if (res.success && res.data) {
        const updatedChannel = res.data
        setChannels((prev) => prev.map((c) => (c.id === channelId ? updatedChannel : c)))
      }
    } catch (error) {
      toast.error("Failed to update channel status")
    }
  }

  const handleBulkAction = async (action: "active" | "pause" | "delete" | "move-to-group") => {
    const selectedIds = Object.keys(selected)
      .map(Number)
      .filter((id) => selected[id])
    const selectedChannels = channels.filter((ch) => selectedIds.includes(ch.id))

    if (selectedChannels.length === 0) {
      toast.error("Please select at least one connection")
      return
    }

    try {
      if (action === "active") {
        // updateChannelStatus already updates state from API response
        await Promise.all(
          selectedChannels.map((ch) => updateChannelStatus(ch.id, true)),
        )
        toast.success(`Activated ${selectedChannels.length} connection${selectedChannels.length > 1 ? "s" : ""}`)
      } else if (action === "pause") {
        // updateChannelStatus already updates state from API response
        await Promise.all(
          selectedChannels.map((ch) => updateChannelStatus(ch.id, false)),
        )
        toast.success(`Paused ${selectedChannels.length} connection${selectedChannels.length > 1 ? "s" : ""}`)
      } else if (action === "delete") {
        await Promise.all(selectedChannels.map((ch) => socialConnectionService.deleteChannel(ch.id)))
        // Remove deleted channels from local state instead of reloading
        setChannels((prev) => prev.filter((ch) => !selectedIds.includes(ch.id)))
        toast.success(`Deleted ${selectedChannels.length} connection${selectedChannels.length > 1 ? "s" : ""}`)
      } else if (action === "move-to-group") {
        // This will be handled by a separate dialog
        setNewGroupOpen(true)
        return
      }

      // Clear selection after action
      setSelected({})
    } catch (error) {
      toast.error("Failed to perform bulk action")
    }
  }

  const handleMoveToGroup = async (groupId: number | null) => {
    const selectedIds = Object.keys(selected)
      .map(Number)
      .filter((id) => selected[id])

    if (selectedIds.length === 0) {
      toast.error("Please select at least one connection")
      return
    }

    try {
      const res = await socialConnectionService.bulkAssignGroup(selectedIds, groupId)
      if (res.success) {
        toast.success(`Moved ${selectedIds.length} connection${selectedIds.length > 1 ? "s" : ""} to group`)
        // Update channels locally instead of reloading
        setChannels((prev) =>
          prev.map((ch) =>
            selectedIds.includes(ch.id) ? { ...ch, group_id: groupId } : ch
          )
        )
        setSelected({})
        setNewGroupOpen(false)
      } else {
        toast.error(res.message || "Failed to move connections")
      }
    } catch (error) {
      toast.error("Failed to move connections to group")
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name")
      return
    }

    try {
      const res = await socialConnectionService.createGroup(newGroupName.trim())
      if (res.success && res.data) {
        const newGroup = res.data
        const selectedIds = Object.keys(selected)
          .map(Number)
          .filter((id) => selected[id])
        
        // If there are selected connections, move them to the new group
        if (selectedIds.length > 0) {
          const moveRes = await socialConnectionService.bulkAssignGroup(selectedIds, newGroup.id)
          if (moveRes.success) {
            toast.success(`Group created and ${selectedIds.length} connection${selectedIds.length > 1 ? "s" : ""} moved`)
            // Update channels locally instead of reloading
            setChannels((prev) =>
              prev.map((ch) =>
                selectedIds.includes(ch.id) ? { ...ch, group_id: newGroup.id } : ch
              )
            )
            setSelected({})
          } else {
            toast.success("Group created successfully")
          }
        } else {
          toast.success("Group created successfully")
        }
        
        // Add the new group to local state
        setGroups((prev) => [...prev, newGroup])
        setNewGroupName("")
        setNewGroupOpen(false)
      } else {
        toast.error(res.message || "Failed to create group")
      }
    } catch (error) {
      toast.error("Failed to create group")
    }
  }

  const selectedCount = Object.values(selected).filter(Boolean).length

  // Filter connections based on search and filters
  const displayedChannels = React.useMemo(() => {
    let filtered = [...channels]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((ch) => {
        const name = ch.name?.toLowerCase() || ""
        const username = ch.username?.toLowerCase() || ""
        const providerChannelId = ch.provider_channel_id?.toLowerCase() || ""
        return name.includes(query) || username.includes(query) || providerChannelId.includes(query)
      })
    }

    // Provider filter
    if (filterProviders.length > 0) {
      filtered = filtered.filter((ch) => filterProviders.includes(ch.provider))
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((ch) => {
        if (filterStatus === "active") return ch.is_active
        if (filterStatus === "paused") return !ch.is_active
        return true
      })
    }

    // Group filter
    if (filterGroupId !== null) {
      filtered = filtered.filter((ch) => ch.group_id === filterGroupId)
    } else if (filterGroupId === null && (filterProviders.length > 0 || filterStatus !== "all" || searchQuery.trim())) {
      // If other filters are active but group is "all", show all (no group filter)
    }

    return filtered
  }, [channels, searchQuery, filterProviders, filterStatus, filterGroupId])

  const recordsLabel = isLoading ? "…" : `${displayedChannels.length}`

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">
              Manage connections{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({recordsLabel} records)
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Seamless Management for All Connections
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setNewGroupOpen(true)}>
              New Group
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
              Add connections
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <div className="relative w-[240px]">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
            />
            <Input
              placeholder="Search"
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline">
                <HugeiconsIcon icon={FilterIcon} className="size-4 mr-2" />
                Filters
                {(filterProviders.length > 0 || filterStatus !== "all" || filterGroupId !== null) && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                    {(filterProviders.length > 0 ? 1 : 0) + (filterStatus !== "all" ? 1 : 0) + (filterGroupId !== null ? 1 : 0)}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2 space-y-3">
                <div>
                  <p className="text-xs font-medium mb-2 text-muted-foreground">Provider</p>
                  <div className="space-y-1">
                    {(["meta", "google", "tiktok"] as SocialProvider[]).map((provider) => (
                      <label key={provider} className="flex items-center gap-2 cursor-pointer text-sm">
                        <Checkbox
                          checked={filterProviders.includes(provider)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilterProviders((prev) => [...prev, provider])
                            } else {
                              setFilterProviders((prev) => prev.filter((p) => p !== provider))
                            }
                          }}
                        />
                        <span>{PROVIDER_LABEL[provider]}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2 text-muted-foreground">Status</p>
                  <div className="space-y-1">
                    {(["all", "active", "paused"] as const).map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="status"
                          checked={filterStatus === status}
                          onChange={() => setFilterStatus(status)}
                          className="size-4"
                        />
                        <span className="capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-2 text-muted-foreground">Group</p>
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="group"
                        checked={filterGroupId === null}
                        onChange={() => setFilterGroupId(null)}
                        className="size-4"
                      />
                      <span>All connections</span>
                    </label>
                    {groups.map((group) => (
                      <label key={group.id} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="group"
                          checked={filterGroupId === group.id}
                          onChange={() => setFilterGroupId(group.id)}
                          className="size-4"
                        />
                        <span>{group.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {(filterProviders.length > 0 || filterStatus !== "all" || filterGroupId !== null) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setFilterProviders([])
                      setFilterStatus("all")
                      setFilterGroupId(null)
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={selectedCount === 0}
              >
                <HugeiconsIcon icon={MoreHorizontalCircle01Icon} className="size-4 mr-2" />
                Actions
                {selectedCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                    {selectedCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleBulkAction("active")}>
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 mr-2" />
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("pause")}>
                <HugeiconsIcon icon={PauseIcon} className="size-4 mr-2" />
                Pause
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction("move-to-group")}>
                Move to group...
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBulkAction("delete")}
                variant="destructive"
              >
                <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Groups (folders) display */}
        {groups.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterGroupId(null)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                filterGroupId === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-border"
              }`}
            >
              All connections
            </button>
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setFilterGroupId(group.id)}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  filterGroupId === group.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted border-border"
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Loading connections...</p>
            </CardContent>
          </Card>
        ) : channels.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-2">
              <p className="text-sm text-muted-foreground">No channels connected yet.</p>
              <Button variant="outline" onClick={() => setAddOpen(true)}>
                Add channels
              </Button>
            </CardContent>
          </Card>
        ) : displayedChannels.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {searchQuery || filterProviders.length > 0 || filterStatus !== "all" || filterGroupId !== null
                  ? "No connections match your filters."
                  : "No connections connected yet."}
              </p>
              {(searchQuery || filterProviders.length > 0 || filterStatus !== "all" || filterGroupId !== null) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterProviders([])
                    setFilterStatus("all")
                    setFilterGroupId(null)
                  }}
                >
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {displayedChannels.map((ch) => {
              const isSelected = !!selected[ch.id]
              return (
                <Card key={ch.id} className="overflow-hidden py-0">
                  <CardContent className="p-0">
                    <div className="flex items-start justify-between p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {ch.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ch.avatar_url}
                            alt={ch.name}
                            className="size-10 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="size-10 rounded-full bg-muted flex items-center justify-center font-medium">
                            {avatarFallback(ch.name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{ch.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {channelSubtitle(ch)}
                          </p>
                        </div>
                      </div>

                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(v) =>
                          setSelected((prev) => ({ ...prev, [ch.id]: !!v }))
                        }
                      />
                    </div>

                    <div className="border-t flex">
                      <button
                        type="button"
                        className="flex-1 py-3 text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
                        onClick={() => connect(ch.provider)}
                        disabled={!enabledProviders.includes(ch.provider)}
                        title={
                          enabledProviders.includes(ch.provider)
                            ? "Reconnect"
                            : `${PROVIDER_LABEL[ch.provider]} is not enabled`
                        }
                      >
                        Reconnect
                      </button>
                      <div className="w-px bg-border" />
                      <button
                        type="button"
                        className="flex-1 py-3 text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
                        onClick={() => disconnect(ch.id)}
                        disabled={!ch.is_active}
                      >
                        Pause
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <AlertDialog open={addOpen} onOpenChange={setAddOpen}>
          <AlertDialogContent className="!w-[650px] !max-w-[650px] max-w-[calc(100vw-2rem)] mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle>Add connections</AlertDialogTitle>
            </AlertDialogHeader>

            <div className="grid grid-cols-4 gap-3">
              {enabledProviders.includes("meta") && (
                <>
                  <Card className="overflow-hidden">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-center">
                        <div className="size-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                          <FaFacebook className="size-5 text-white" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Facebook</p>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => connect("meta", ["facebook_page", "facebook_profile"])}
                        >
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-center">
                        <div className="size-10 rounded-full bg-fuchsia-600 text-white flex items-center justify-center font-semibold">
                          <FaInstagram className="size-5 text-white" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Instagram</p>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => connect("meta", ["instagram_business"])}
                        >
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {enabledProviders.includes("google") && (
                <Card className="overflow-hidden">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-center">
                      <div className="size-10 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                        <FaYoutube className="size-5 text-white" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Youtube</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => connect("google")}>
                        + Channel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {enabledProviders.includes("tiktok") && (
                <Card className="overflow-hidden">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-center">
                      <div className="size-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                        <FaTiktok className="size-5 text-white" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Tiktok</p>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => connect("tiktok")}>
                        + Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {enabledProviders.length === 0 && (
                <div className="col-span-full text-sm text-muted-foreground">
                  No providers are enabled right now.
                </div>
              )}
            </div>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Channel Selection Modal (after Meta OAuth) */}
        <AlertDialog open={selectionOpen} onOpenChange={setSelectionOpen}>
          <AlertDialogContent className="!w-[650px] !max-w-[650px] max-w-[calc(100vw-2rem)] mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">Select Connections to Add</AlertDialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {Object.values(selectionSelected).filter(Boolean).length > 0
                  ? `${Object.values(selectionSelected).filter(Boolean).length} connection${Object.values(selectionSelected).filter(Boolean).length > 1 ? "s" : ""} selected`
                  : "Choose which connections you want to connect to your account"}
              </p>
            </AlertDialogHeader>

            {selectionLoading ? (
              <div className="py-12 text-center">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Loading available connections...</p>
              </div>
            ) : selectionChannels.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No channels available</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto mt-4">
                {selectionChannels.map((ch) => {
                  const isSelected = !!selectionSelected[ch.key]
                  return (
                    <Card
                      key={ch.key}
                      className={`overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:border-border"
                      }`}
                      onClick={() =>
                        setSelectionSelected((prev) => ({
                          ...prev,
                          [ch.key]: !isSelected,
                        }))
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {ch.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={ch.avatar_url}
                                alt={ch.name}
                                className="size-12 rounded-full object-cover border-2 border-background shadow-sm"
                              />
                            ) : (
                              <div className="size-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-primary border-2 border-background shadow-sm">
                                {avatarFallback(ch.name)}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate text-base">{ch.name}</p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {channelSubtitle({ type: ch.type } as SocialChannel)}
                              </p>
                            </div>
                          </div>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(v) =>
                              setSelectionSelected((prev) => ({
                                ...prev,
                                [ch.key]: !!v,
                              }))
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="size-5"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel onClick={() => setSelectionOpen(false)}>
                Cancel
              </AlertDialogCancel>
              <Button
                onClick={confirmSelection}
                disabled={
                  selectionSaving ||
                  Object.values(selectionSelected).filter(Boolean).length === 0
                }
              >
                {selectionSaving
                  ? "Saving..."
                  : `Add ${Object.values(selectionSelected).filter(Boolean).length || ""} Connection${Object.values(selectionSelected).filter(Boolean).length !== 1 ? "s" : ""}`}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Move to Group / New Group Dialog */}
        <AlertDialog open={newGroupOpen} onOpenChange={setNewGroupOpen}>
          <AlertDialogContent className="!w-[500px] !max-w-[500px] max-w-[calc(100vw-2rem)] mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {Object.values(selected).filter(Boolean).length > 0
                  ? "Move to Group"
                  : "New Group"}
              </AlertDialogTitle>
            </AlertDialogHeader>

            {Object.values(selected).filter(Boolean).length > 0 ? (
              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Select a group for {Object.values(selected).filter(Boolean).length} selected connection{Object.values(selected).filter(Boolean).length > 1 ? "s" : ""}:
                </p>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handleMoveToGroup(null)}
                    className="w-full text-left px-3 py-2 text-sm rounded-md border hover:bg-muted transition-colors"
                  >
                    No group
                  </button>
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => handleMoveToGroup(group.id)}
                      className="w-full text-left px-3 py-2 text-sm rounded-md border hover:bg-muted transition-colors"
                    >
                      {group.name}
                    </button>
                  ))}
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Or create a new group:</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Group name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCreateGroup()
                        }
                      }}
                    />
                    <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateGroup()
                    }
                  }}
                />
              </div>
            )}

            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel onClick={() => {
                setNewGroupOpen(false)
                setNewGroupName("")
              }}>
                Cancel
              </AlertDialogCancel>
              {Object.values(selected).filter(Boolean).length === 0 && (
                <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
                  Create
                </Button>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CustomerDashboardLayout>
  )
}

export default function ConnectionPage() {
  return (
    <Suspense fallback={
      <CustomerDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </CustomerDashboardLayout>
    }>
      <ConnectionPageContent />
    </Suspense>
  )
}
