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
} from "@/components/footage-library"
import type { VideoClip } from "@/components/footage-library/types"
import { usePermission } from "@/lib/hooks/use-permission"
import { footageLibraryService } from "@/lib/api/services/footage-library.service"
import type { Footage } from "@/lib/api/services/footage-library.service"
import { toast } from "@/lib/api"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

export default function LibraryFootageFolderPage() {
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

  const canBrowse = hasPermission("use_footage_library")
  const canUpload = hasPermission("upload_footage")
  const canManage = hasPermission("manage_footage")
  const showUploadOrDelete = canUpload || canManage

  const totalPages = pagination.last_page
  const startIndex = (pagination.current_page - 1) * pagination.per_page
  const endIndex = startIndex + clips.length

  const mapFootageToClip = React.useCallback((footage: Footage): VideoClip => {
    const filename =
      footage.title?.trim() ||
      (footage.storage_file as { path?: string })?.path?.split("/").pop() ||
      `Footage ${footage.id}`
    return {
      id: String(footage.id),
      filename,
      status: footage.status,
      videoUrl: (footage.storage_file as { url?: string | null })?.url ?? null,
      orientation: (footage.metadata as { orientation?: "horizontal" | "vertical" })?.orientation,
    }
  }, [])

  const loadFolderName = React.useCallback(async () => {
    if (!Number.isFinite(libraryId)) return
    try {
      const response = await footageLibraryService.browseFolders()
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
      const response = await footageLibraryService.browseFootage({
        folder_id: libraryId,
        per_page: itemsPerPage,
        page: currentPage,
        status: "ready",
      })
      if (response.success && response.data) {
        setClips((response.data as Footage[]).map(mapFootageToClip))
        setSelectedClips(new Set())
        if (response.pagination) {
          setPagination(response.pagination as typeof pagination)
        }
      }
    } catch (error) {
      console.error("Failed to load footage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [libraryId, currentPage, mapFootageToClip])

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
      await Promise.all(ids.map((id) => footageLibraryService.deleteFootage(id, true)))
      setClips((prev) => prev.filter((c) => !selectedClips.has(c.id)))
      setSelectedClips(new Set())
      toast.success("Selected footage deleted")
    } catch (error) {
      console.error("Failed to delete footage:", error)
      toast.error("Failed to delete selected footage")
    }
  }

  if (!canBrowse) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Footage Library</h1>
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
            onClick={() => router.push("/library/footage")}
            className="h-8 w-8"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            <span className="sr-only">Back to footage library</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{folderName ?? "Footage Library"}</h1>
            <p className="text-muted-foreground mt-2">Browse and use shared footage in this folder.</p>
          </div>
        </div>
        {canUpload && <UploadSection onUploadClick={() => setIsUploadModalOpen(true)} />}
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
        <div className="text-center text-muted-foreground">Loading footage...</div>
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
        title="Delete Selected Footage"
        description={`Are you sure you want to delete ${selectedClips.size} selected footage clip${selectedClips.size > 1 ? 's' : ''}? This action cannot be undone.`}
        onConfirm={confirmDeleteSelected}
      />
    </div>
  )
}
