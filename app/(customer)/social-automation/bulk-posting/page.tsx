"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
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
  NewBulkPostingDialog,
  EditBulkPostingDialog,
  StatisticsCards,
  BulkPostingTable,
  type BulkPostingItem,
} from "@/components/bulk-posting"
import { bulkPostingService, mediaUploadService, socialConnectionService, type SocialChannel, type SocialConnectionGroup, type MediaUploadFolder } from "@/lib/api"
import { toast } from "@/lib/toast"

/** Flatten nested folder tree so users can select any folder (including subfolders) */
function flattenMediaFolders(folders: MediaUploadFolder[]): { id: number; name: string }[] {
  const result: { id: number; name: string }[] = []
  const visit = (f: MediaUploadFolder, depth = 0) => {
    const prefix = depth > 0 ? "  ".repeat(depth) + "↳ " : ""
    result.push({ id: f.id, name: `${prefix}${f.name}` })
    const children = (f as MediaUploadFolder & { children?: MediaUploadFolder[] }).children ?? []
    children.forEach((c) => visit(c, depth + 1))
  }
  folders.forEach((f) => visit(f))
  return result
}

export default function BulkPostingPage() {
  const router = useRouter()
  const [items, setItems] = React.useState<BulkPostingItem[]>([])
  const [editingItem, setEditingItem] = React.useState<BulkPostingItem | null>(null)
  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [channels, setChannels] = React.useState<SocialChannel[]>([])
  const [groups, setGroups] = React.useState<SocialConnectionGroup[]>([])
  const [mediaFolders, setMediaFolders] = React.useState<MediaUploadFolder[]>([])
  const [isLoadingConnections, setIsLoadingConnections] = React.useState(true)
  const itemsPerPage = 20
  const [totalFromApi, setTotalFromApi] = React.useState(0)

  const loadCampaigns = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await bulkPostingService.list({ per_page: 200, page: 1 })
      if (response.success && response.data) {
        const list = Array.isArray(response.data) ? response.data : []
        setItems(list)
        setTotalFromApi(response.pagination?.total ?? list.length)
      }
    } catch (error) {
      console.error("Failed to load campaigns:", error)
      toast.error("Failed to load campaigns")
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadConnections = React.useCallback(async () => {
    setIsLoadingConnections(true)
    try {
      const [channelsRes, groupsRes] = await Promise.all([
        socialConnectionService.getChannels({ per_page: 100 }),
        socialConnectionService.getGroups(),
      ])
      if (channelsRes.success && channelsRes.data) {
        setChannels(Array.isArray(channelsRes.data) ? channelsRes.data : [])
      }
      if (groupsRes.success && groupsRes.data) {
        setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : [])
      }
      const foldersRes = await mediaUploadService.listFolders()
      if (foldersRes.success && foldersRes.data) {
        setMediaFolders(Array.isArray(foldersRes.data) ? foldersRes.data : [])
      }
    } catch (error) {
      console.error("Failed to load connections:", error)
    } finally {
      setIsLoadingConnections(false)
    }
  }, [])

  React.useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

  React.useEffect(() => {
    loadConnections()
  }, [loadConnections])

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const mapCreatePayloadToApi = (item: Omit<BulkPostingItem, "id" | "postedAmount" | "remainingContent" | "startedDate">) => ({
    brand_name: item.brand.name,
    project_name: item.brand.projectName,
    brand_logo_storage_file_id: null,
    content_source_type: item.contentSourceType,
    content_source_config: item.contentSourceType === "media_upload"
      ? { folder_ids: item.contentSource.map((s) => parseInt(s, 10)).filter((n) => !isNaN(n)) as number[] }
      : { csv_storage_file_id: null },
    schedule_condition: item.scheduleCondition ?? "daily",
    schedule_interval: item.scheduleInterval ?? 1,
    repost_enabled: item.repostEnabled ?? false,
    repost_condition: item.repostCondition ?? null,
    repost_interval: item.repostInterval ?? 0,
    repost_max_count: item.repostMaxCount ?? 1,
    connections: item.connections ?? { channels: [], groups: [] },
  })

  const handleCreate = async (item: Omit<BulkPostingItem, "id" | "postedAmount" | "remainingContent" | "startedDate">) => {
    try {
      const payload = mapCreatePayloadToApi(item)
      const response = await bulkPostingService.create(payload)
      if (response.success && response.data) {
        setItems((prev) => [response.data as BulkPostingItem, ...prev])
        setTotalFromApi((t) => t + 1)
        toast.success("Campaign created successfully")
      }
    } catch (error) {
      console.error("Failed to create campaign:", error)
      toast.error("Failed to create campaign")
    }
  }

  const handleUpdate = async (
    id: string,
    updates: Partial<Omit<BulkPostingItem, "id" | "postedAmount" | "remainingContent" | "startedDate">>
  ) => {
    try {
      const payload: Record<string, unknown> = {}
      if (updates.brand) {
        payload.brand_name = updates.brand.name
        payload.project_name = updates.brand.projectName
      }
      if (updates.connections) payload.connections = updates.connections
      if (updates.contentSourceType) payload.content_source_type = updates.contentSourceType
      if (updates.contentSource) {
        payload.content_source_config =
          updates.contentSourceType === "media_upload"
            ? { folder_ids: updates.contentSource.map((s) => parseInt(s, 10)).filter((n) => !isNaN(n)) }
            : {}
      }
      if (updates.scheduleCondition) payload.schedule_condition = updates.scheduleCondition
      if (updates.scheduleInterval !== undefined) payload.schedule_interval = updates.scheduleInterval
      if (updates.repostEnabled !== undefined) payload.repost_enabled = updates.repostEnabled
      if (updates.repostCondition !== undefined) payload.repost_condition = updates.repostCondition
      if (updates.repostInterval !== undefined) payload.repost_interval = updates.repostInterval
      if (updates.repostMaxCount !== undefined) payload.repost_max_count = updates.repostMaxCount

      const response = await bulkPostingService.update(id, payload)
      if (response.success && response.data) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? (response.data as BulkPostingItem) : i))
        )
        setEditingItem(null)
        toast.success("Campaign updated successfully")
      }
    } catch (error) {
      console.error("Failed to update campaign:", error)
      toast.error("Failed to update campaign")
    }
  }

  const handleView = (id: string) => {
    router.push(`/social-automation/bulk-posting/${id}`)
  }

  const handleEdit = (id: string) => {
    const item = items.find((i) => i.id === id)
    if (item) setEditingItem(item)
  }

  const handlePause = async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    const isPause = item.status === "running"
    try {
      const response = isPause
        ? await bulkPostingService.pause(id)
        : await bulkPostingService.resume(id)
      if (response.success && response.data) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? (response.data as BulkPostingItem) : i))
        )
        toast.success(isPause ? "Campaign paused" : "Campaign resumed")
      }
    } catch (error) {
      console.error("Failed to update campaign status:", error)
      toast.error("Failed to update campaign status")
    }
  }

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return
    try {
      const response = await bulkPostingService.delete(deleteTargetId)
      if (response.success) {
        setItems((prev) => prev.filter((i) => i.id !== deleteTargetId))
        setTotalFromApi((t) => Math.max(0, t - 1))
        setDeleteTargetId(null)
        toast.success("Campaign deleted")
      }
    } catch (error) {
      console.error("Failed to delete campaign:", error)
      toast.error("Failed to delete campaign")
    }
  }

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bulk Posting</h1>
          <p className="text-muted-foreground mt-2">
            Create and schedule multiple social media posts at once with batch upload and automated scheduling
          </p>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading campaigns...</div>
        ) : (
          <>
            <StatisticsCards items={items} />
            <BulkPostingTable
              items={items}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onView={handleView}
              onEdit={handleEdit}
              onPause={handlePause}
              onDelete={handleDeleteClick}
              onCreateClick={() => setCreateDialogOpen(true)}
            />
          </>
        )}

        <NewBulkPostingDialog
          onCreate={handleCreate}
          channels={channels}
          groups={groups}
          mediaFolders={flattenMediaFolders(mediaFolders)}
          isLoadingConnections={isLoadingConnections}
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        <EditBulkPostingDialog
          item={editingItem}
          onUpdate={handleUpdate}
          onClose={() => setEditingItem(null)}
          channels={channels}
          groups={groups}
          mediaFolders={flattenMediaFolders(mediaFolders)}
          isLoadingConnections={isLoadingConnections}
        />

        <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this campaign? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CustomerDashboardLayout>
  )
}
