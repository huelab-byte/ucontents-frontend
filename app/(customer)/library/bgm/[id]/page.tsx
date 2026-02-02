"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons"
import {
  AudioClipGrid,
  UploadSection,
  UploadModal,
  SelectionBar,
  Pagination,
  type AudioClip,
} from "@/components/bgm-library"
import { usePermission } from "@/lib/hooks/use-permission"
import { bgmLibraryService } from "@/lib/api/services/bgm-library.service"
import type { Bgm } from "@/lib/api/services/bgm-library.service"
import { toast } from "@/lib/api"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"

export default function LibraryBgmFolderPage() {
  const params = useParams()
  const router = useRouter()
  const { hasPermission } = usePermission()
  const libraryId = Number(params.id)
  const [folderName, setFolderName] = React.useState<string | null>(null)
  const [clips, setClips] = React.useState<AudioClip[]>([])
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

  const canBrowse = hasPermission("use_bgm_library")
  const canUpload = hasPermission("upload_bgm")
  const canManage = hasPermission("manage_bgm")
  const showUploadOrDelete = canUpload || canManage

  const totalPages = pagination.last_page
  const startIndex = (pagination.current_page - 1) * pagination.per_page
  const endIndex = startIndex + clips.length

  const mapBgmToClip = React.useCallback((bgm: Bgm): AudioClip => {
    const filename =
      bgm.title?.trim() ||
      (bgm.storage_file as { path?: string })?.path?.split("/").pop() ||
      `BGM ${bgm.id}`
    return {
      id: String(bgm.id),
      filename,
      status: bgm.status,
      audioUrl: (bgm.storage_file as { url?: string | null })?.url ?? null,
    }
  }, [])

  const loadFolderName = React.useCallback(async () => {
    if (!Number.isFinite(libraryId)) return
    try {
      const response = await bgmLibraryService.browseFolders()
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
      const response = await bgmLibraryService.browseBgm({
        folder_id: libraryId,
        per_page: itemsPerPage,
        page: currentPage,
        status: "ready",
      })
      if (response.success && response.data) {
        setClips((response.data as Bgm[]).map(mapBgmToClip))
        setSelectedClips(new Set())
        if (response.pagination) {
          setPagination(response.pagination as typeof pagination)
        }
      }
    } catch (error) {
      console.error("Failed to load BGM:", error)
    } finally {
      setIsLoading(false)
    }
  }, [libraryId, currentPage, mapBgmToClip])

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
      await Promise.all(ids.map((id) => bgmLibraryService.deleteBgm(id, true)))
      setClips((prev) => prev.filter((c) => !selectedClips.has(c.id)))
      setSelectedClips(new Set())
      toast.success("Selected BGM deleted")
    } catch (error) {
      console.error("Failed to delete BGM:", error)
      toast.error("Failed to delete selected BGM")
    }
  }

  if (!canBrowse) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">BGM Library</h1>
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
            onClick={() => router.push("/library/bgm")}
            className="h-8 w-8"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            <span className="sr-only">Back to BGM library</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{folderName ?? "BGM Library"}</h1>
            <p className="text-muted-foreground mt-2">Browse and use shared BGM in this folder.</p>
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
        <div className="text-center text-muted-foreground">Loading BGM files...</div>
      ) : clips.length > 0 ? (
        <div className="space-y-4">
          <AudioClipGrid
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
        <AudioClipGrid
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
        title="Delete Selected BGM Files"
        description={`Are you sure you want to delete ${selectedClips.size} selected BGM file${selectedClips.size > 1 ? 's' : ''}? This action cannot be undone.`}
        onConfirm={confirmDeleteSelected}
      />
    </div>
  )
}
