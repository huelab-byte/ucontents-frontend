"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons"
import { ImageClipGrid } from "@/components/image-library/image-clip-grid"
import { UploadSection } from "@/components/image-library/detail/upload-section"
import { UploadModal } from "@/components/image-library/detail/upload-modal"
import { SelectionBar } from "@/components/image-library/detail/selection-bar"
import { Pagination } from "@/components/image-library/detail/pagination"
import type { ImageClip } from "@/components/image-library/types"
import { usePermission } from "@/lib/hooks/use-permission"
import { imageLibraryService } from "@/lib/api/services/image-library.service"
import type { Image as ImageType } from "@/lib/api/services/image-library.service"
import { toast } from "@/lib/api"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

export default function LibraryImagesFolderPage() {
  const params = useParams()
  const router = useRouter()
  const { hasPermission } = usePermission()
  const libraryId = Number(params.id)
  const [folderName, setFolderName] = React.useState<string | null>(null)
  const [clips, setClips] = React.useState<ImageClip[]>([])
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

  const canBrowse = hasPermission("use_image_library")
  const canUpload = hasPermission("upload_image")
  const canManage = hasPermission("manage_image")
  const showUploadOrDelete = canUpload || canManage

  const totalPages = pagination.last_page
  const startIndex = (pagination.current_page - 1) * pagination.per_page
  const endIndex = startIndex + clips.length

  const mapImageToClip = React.useCallback((image: ImageType): ImageClip => {
    const filename =
      image.title?.trim() ||
      image.storage_file?.path?.split("/").pop() ||
      `Image ${image.id}`
    return {
      id: String(image.id),
      filename,
      status: image.status,
      imageUrl: image.storage_file?.url ?? undefined,
      thumbnailUrl: image.storage_file?.url ?? undefined,
      width: image.metadata?.width,
      height: image.metadata?.height,
      format: image.metadata?.format,
      fileSize: image.metadata?.file_size,
    }
  }, [])

  const loadFolderName = React.useCallback(async () => {
    if (!Number.isFinite(libraryId)) return
    try {
      const response = await imageLibraryService.browseFolders()
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
      const response = await imageLibraryService.browseImages({
        folder_id: libraryId,
        per_page: itemsPerPage,
        page: currentPage,
        status: "ready",
      })
      if (response.success && response.data) {
        setClips((response.data as ImageType[]).map(mapImageToClip))
        setSelectedClips(new Set())
        if (response.pagination) {
          setPagination(response.pagination as typeof pagination)
        }
      }
    } catch (error) {
      console.error("Failed to load images:", error)
    } finally {
      setIsLoading(false)
    }
  }, [libraryId, currentPage, mapImageToClip])

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
      await Promise.all(ids.map((id) => imageLibraryService.deleteImage(id, true)))
      setClips((prev) => prev.filter((c) => !selectedClips.has(c.id)))
      setSelectedClips(new Set())
      toast.success("Selected images deleted")
    } catch (error) {
      console.error("Failed to delete images:", error)
      toast.error("Failed to delete selected images")
    }
  }

  if (!canBrowse) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Image Library</h1>
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
            onClick={() => router.push("/library/images")}
            className="h-8 w-8"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            <span className="sr-only">Back to image library</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{folderName ?? "Image Library"}</h1>
            <p className="text-muted-foreground mt-2">Browse and use shared images in this folder.</p>
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
        <div className="text-center text-muted-foreground">Loading image files...</div>
      ) : clips.length > 0 ? (
        <div className="space-y-4">
          <ImageClipGrid
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
        <ImageClipGrid
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
        title="Delete Selected Images"
        description={`Are you sure you want to delete ${selectedClips.size} selected image${selectedClips.size > 1 ? 's' : ''}? This action cannot be undone.`}
        onConfirm={confirmDeleteSelected}
      />
    </div>
  )
}
