"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons"
import {
  ImageClipGrid,
  UploadSection,
  UploadModal,
  DetailStatisticsCards,
  Pagination,
  SelectionBar,
  type Library,
  type ImageClip,
} from "@/components/image-overlay"
import { usePermission } from "@/lib/hooks/use-permission"
import { imageOverlayService, type ImageOverlay, type ImageOverlayFolder, type ImageOverlayUserWithUploadCount, toast } from "@/lib/api"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { UserFilter } from "@/components/shared/user-filter"

export default function ImageOverlayDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { hasPermission } = usePermission()
  const libraryId = Number(params.id)
  const [library, setLibrary] = React.useState<Library | null>(null)
  const [clips, setClips] = React.useState<ImageClip[]>([])
  const [selectedClips, setSelectedClips] = React.useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false)
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null)
  const [usersWithUploads, setUsersWithUploads] = React.useState<ImageOverlayUserWithUploadCount[]>([])
  const itemsPerPage = 8
  const [pagination, setPagination] = React.useState({
    total: 0,
    per_page: itemsPerPage,
    current_page: 1,
    last_page: 1,
  })

  const hasAccess =
    hasPermission("view_image_overlay") || hasPermission("manage_image_overlay")

  const totalPages = pagination.last_page
  const startIndex = (pagination.current_page - 1) * pagination.per_page
  const endIndex = startIndex + clips.length

  const formatDate = (value?: string | null) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const mapImageOverlayToClip = React.useCallback((imageOverlay: ImageOverlay): ImageClip => {
    const filename =
      imageOverlay.title?.trim() ||
      imageOverlay.storage_file?.path?.split("/").pop() ||
      `Image Overlay ${imageOverlay.id}`
    return {
      id: String(imageOverlay.id),
      filename,
      status: imageOverlay.status,
      imageUrl: imageOverlay.storage_file?.url ?? undefined,
      thumbnailUrl: imageOverlay.storage_file?.url ?? undefined,
      width: imageOverlay.metadata?.width,
      height: imageOverlay.metadata?.height,
      format: imageOverlay.metadata?.format,
      fileSize: imageOverlay.metadata?.file_size,
    }
  }, [])

  const findFolderById = React.useCallback((folders: ImageOverlayFolder[], id: number): ImageOverlayFolder | null => {
    for (const folder of folders) {
      if (folder.id === id) return folder
      if (folder.children?.length) {
        const match = findFolderById(folder.children, id)
        if (match) return match
      }
    }
    return null
  }, [])

  const loadLibrary = React.useCallback(async () => {
    if (!Number.isFinite(libraryId)) return
    try {
      const response = await imageOverlayService.listFolders()
      if (response.success && response.data) {
        const match = findFolderById(response.data, libraryId)
        if (match) {
          setLibrary({
            id: match.id,
            name: match.name,
            parent_id: match.parent_id,
            path: match.path,
            image_overlay_count: match.image_overlay_count,
            created_at: match.created_at,
            updated_at: match.updated_at,
          })
        } else {
          setLibrary({
            id: libraryId,
            name: `Library #${libraryId}`,
          })
        }
      }
    } catch (error) {
      console.error("Failed to load folder:", error)
    }
  }, [findFolderById, libraryId])

  const loadClips = React.useCallback(async () => {
    if (!Number.isFinite(libraryId)) return
    try {
      setIsLoading(true)
      const params = {
        folder_id: libraryId,
        per_page: itemsPerPage,
        page: currentPage,
        ...(selectedUserId && { user_id: selectedUserId }),
      }
      
      const response = selectedUserId
        ? await imageOverlayService.listImageOverlaysAdmin(params)
        : await imageOverlayService.listImageOverlays(params)
      
      if (response.success && response.data) {
        setClips(response.data.map(mapImageOverlayToClip))
        setSelectedClips(new Set())
        if (response.pagination) {
          setPagination(response.pagination)
          if (response.pagination.current_page !== currentPage) {
            setCurrentPage(response.pagination.current_page)
          }
        }
      }
    } catch (error) {
      console.error("Failed to load image overlays:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, libraryId, mapImageOverlayToClip, selectedUserId])

  React.useEffect(() => {
    if (!hasAccess) return
    loadLibrary()
  }, [hasAccess, loadLibrary])

  React.useEffect(() => {
    if (!hasAccess) return
    loadClips()
  }, [hasAccess, loadClips])

  // Load users with upload counts
  const loadUsers = React.useCallback(async () => {
    try {
      const response = await imageOverlayService.getUsersWithUploads()
      if (response.success && response.data) {
        setUsersWithUploads(response.data)
      }
    } catch (error) {
      console.error("Failed to load users:", error)
    }
  }, [])

  React.useEffect(() => {
    if (!hasAccess) return
    loadUsers()
  }, [hasAccess, loadUsers])

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [selectedUserId])

  // Handle clip selection
  const handleToggleSelection = (clipId: string) => {
    setSelectedClips((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(clipId)) {
        newSet.delete(clipId)
      } else {
        newSet.add(clipId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedClips.size === clips.length) {
      setSelectedClips(new Set())
    } else {
      setSelectedClips(new Set(clips.map((c) => c.id)))
    }
  }

  const handleDeleteSelected = () => {
    if (selectedClips.size > 0) {
      setIsBulkDeleteOpen(true)
    }
  }

  const confirmDeleteSelected = async () => {
    const selectedIds = Array.from(selectedClips)
    const numericIds = selectedIds
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id))
    if (numericIds.length === 0) return

    try {
      await Promise.all(
        numericIds.map((id) => imageOverlayService.deleteImageOverlay(id, true))
      )
      setClips((prev) => prev.filter((clip) => !selectedClips.has(clip.id)))
      setSelectedClips(new Set())
      toast.success("Selected image overlays deleted")
      loadClips()
    } catch (error) {
      console.error("Failed to delete selected image overlays:", error)
      toast.error("Failed to delete selected image overlays")
    }
  }

  if (!hasAccess) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/image-overlay")}
              className="h-8 w-8"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
              <span className="sr-only">Back to libraries</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{library?.name || "Image Overlay"}</h1>
              <p className="text-muted-foreground mt-2">
                Manage your image overlay files (PNG, GIF, WebP only) and organize them into folders.
              </p>
            </div>
          </div>
          <UploadSection onUploadClick={() => setIsUploadModalOpen(true)} />
        </div>

        {/* Statistics */}
        <DetailStatisticsCards
          totalOverlays={pagination.total}
          lastUpdated={formatDate(library?.updated_at)}
        />

        {/* User Filter */}
        {usersWithUploads.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Filter by User:</span>
              <UserFilter
                users={usersWithUploads}
                selectedUserId={selectedUserId}
                onUserChange={setSelectedUserId}
                placeholder="All Users"
                className="w-[250px]"
              />
            </div>
          </div>
        )}

        {/* Filter Status */}
        {selectedUserId && (
          <div className="text-sm text-muted-foreground">
            Showing {pagination.total} files from selected user
          </div>
        )}

        {/* Upload Modal */}
        <UploadModal
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
          folderId={libraryId}
          onUploadComplete={() => {
            loadClips()
            loadLibrary()
          }}
        />

        {/* Image Grid/List */}
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading image overlays...</div>
        ) : clips.length > 0 ? (
          <div className="space-y-4">
            <ImageClipGrid
              clips={clips}
              selectedClips={selectedClips}
              onToggleSelection={handleToggleSelection}
            />

            {/* Pagination */}
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
          />
        )}

        {/* Selection Bar */}
        <SelectionBar
          selectedCount={selectedClips.size}
          onSelectAll={handleSelectAll}
          onDelete={handleDeleteSelected}
          onClear={() => setSelectedClips(new Set())}
        />

        {/* Bulk Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={isBulkDeleteOpen}
          onOpenChange={setIsBulkDeleteOpen}
          title="Delete Selected Image Overlays"
          description={`Are you sure you want to delete ${selectedClips.size} selected image overlay${selectedClips.size > 1 ? 's' : ''}? This action cannot be undone.`}
          onConfirm={confirmDeleteSelected}
        />
      </div>
    </AdminDashboardLayout>
  )
}
