"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons"
import {
  VideoClipGrid,
  UploadSection,
  UploadModal,
  SelectionBar,
  Pagination,
} from "@/components/video-overlay"
import type { VideoClip } from "@/components/video-overlay/types"
import { usePermission } from "@/lib/hooks/use-permission"
import { videoOverlayService } from "@/lib/api/services/video-overlay.service"
import type { VideoOverlay } from "@/lib/api/services/video-overlay.service"
import { toast } from "@/lib/api"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

export default function LibraryVideoOverlaysFolderPage() {
  const params = useParams()
  const router = useRouter()
  const { hasPermission } = usePermission()
  const libraryId = Number(params.id)
  const [folderName, setFolderName] = React.useState<string | null>(null)
  const [clips, setClips] = React.useState<VideoClip[]>([])
  const [selectedClips, setSelectedClips] = React.useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false)
  const itemsPerPage = 8
  const [pagination, setPagination] = React.useState({
    total: 0,
    per_page: itemsPerPage,
    current_page: 1,
    last_page: 1,
  })

  const canBrowse = hasPermission("use_video_overlay")
  const canUpload = hasPermission("upload_video_overlay")
  const canManage = hasPermission("manage_video_overlay")
  const showUploadOrDelete = canUpload || canManage

  const totalPages = pagination.last_page
  const startIndex = (pagination.current_page - 1) * pagination.per_page
  const endIndex = startIndex + clips.length

  const mapVideoOverlayToClip = React.useCallback((overlay: VideoOverlay): VideoClip => {
    const filename =
      overlay.title?.trim() ||
      (overlay.storage_file as { path?: string })?.path?.split("/").pop() ||
      `Video Overlay ${overlay.id}`
    return {
      id: String(overlay.id),
      filename,
      status: overlay.status,
      videoUrl: (overlay.storage_file as { url?: string | null })?.url ?? null,
      orientation: (overlay.metadata as { orientation?: "horizontal" | "vertical" })?.orientation,
    }
  }, [])

  const loadFolderName = React.useCallback(async () => {
    if (!Number.isFinite(libraryId)) return
    try {
      const response = await videoOverlayService.browseFolders()
      if (response.success && response.data) {
        const folders = response.data as { id: number; name: string }[]
        const folder = folders.find((f) => f.id === libraryId)
        setFolderName(folder?.name ?? `Folder #${libraryId}`)
      }
    } catch (error) {
      console.error("Failed to load folder name:", error)
      setFolderName(`Folder #${libraryId}`)
    }
  }, [libraryId])

  const loadClips = React.useCallback(async () => {
    if (!Number.isFinite(libraryId)) return
    try {
      setIsLoading(true)
      const response = await videoOverlayService.browseVideoOverlays({
        folder_id: libraryId,
        per_page: itemsPerPage,
        page: currentPage,
        status: "ready",
      })
      if (response.success && response.data) {
        setClips((response.data as VideoOverlay[]).map(mapVideoOverlayToClip))
        setSelectedClips(new Set())
        if (response.pagination) {
          setPagination(response.pagination as typeof pagination)
        }
      }
    } catch (error) {
      console.error("Failed to load video overlays:", error)
    } finally {
      setIsLoading(false)
    }
  }, [libraryId, currentPage, mapVideoOverlayToClip])

  React.useEffect(() => {
    if (!canBrowse) return
    loadFolderName()
  }, [canBrowse, loadFolderName])

  React.useEffect(() => {
    if (!canBrowse) return
    loadClips()
  }, [canBrowse, loadClips])

  const handleToggleSelection = (clipId: string) => {
    if (!showUploadOrDelete) return
    setSelectedClips((prev) => {
      const next = new Set(prev)
      if (next.has(clipId)) next.delete(clipId)
      else next.add(clipId)
      return next
    })
  }

  const handleSelectAll = () => {
    if (!showUploadOrDelete) return
    if (selectedClips.size === clips.length) setSelectedClips(new Set())
    else setSelectedClips(new Set(clips.map((c) => c.id)))
  }

  const handleDeleteSelected = () => {
    if (!canManage) return
    if (selectedClips.size > 0) {
      setIsBulkDeleteOpen(true)
    }
  }

  const confirmDeleteSelected = async () => {
    const ids = Array.from(selectedClips).map(Number).filter(Number.isFinite)
    if (ids.length === 0) return
    try {
      await Promise.all(ids.map((id) => videoOverlayService.deleteVideoOverlay(id, true)))
      setClips((prev) => prev.filter((c) => !selectedClips.has(c.id)))
      setSelectedClips(new Set())
      toast.success("Selected video overlays deleted")
    } catch (error) {
      console.error("Failed to delete video overlays:", error)
      toast.error("Failed to delete selected video overlays")
    }
  }

  if (!canBrowse) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Video Overlays</h1>
        <p className="text-muted-foreground">You do not have permission to browse this folder.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/library/video-overlays")}
            className="h-8 w-8"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            <span className="sr-only">Back to video overlays</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{folderName ?? "Video Overlays"}</h1>
            <p className="text-muted-foreground mt-2">Browse and use shared video overlays in this folder.</p>
          </div>
        </div>
        {canUpload && (
          <UploadSection onUploadClick={() => setIsUploadModalOpen(true)} />
        )}
      </div>

      {canUpload && (
        <UploadModal
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
          folderId={libraryId}
          onUploadComplete={() => {
            loadClips()
            loadFolderName()
          }}
        />
      )}

      {isLoading ? (
        <div className="text-center text-muted-foreground">Loading video overlays...</div>
      ) : clips.length > 0 ? (
        <div className="space-y-4">
          <VideoClipGrid
            clips={clips}
            selectedClips={selectedClips}
            onToggleSelection={handleToggleSelection}
            showSelection={showUploadOrDelete}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={pagination.total}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        <VideoClipGrid
          clips={[]}
          selectedClips={new Set()}
          onToggleSelection={() => {}}
          showSelection={showUploadOrDelete}
        />
      )}

      {showUploadOrDelete && (
        <SelectionBar
          selectedCount={selectedClips.size}
          onSelectAll={handleSelectAll}
          onDelete={handleDeleteSelected}
          onClear={() => setSelectedClips(new Set())}
        />
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        title="Delete Selected Video Overlays"
        description={`Are you sure you want to delete ${selectedClips.size} selected video overlay${selectedClips.size > 1 ? 's' : ''}? This action cannot be undone.`}
        onConfirm={confirmDeleteSelected}
      />
    </div>
  )
}
