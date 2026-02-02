"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons"
import {
  VideoClipGrid,
  UploadSection,
  UploadModal,
  SelectionBar,
  DetailStatisticsCards,
  Pagination,
  type Library,
  type VideoClip,
} from "@/components/footage-library"
import { usePermission } from "@/lib/hooks/use-permission"
import { footageLibraryService, type Footage, type FootageFolder, type FootageUserWithUploadCount, toast } from "@/lib/api"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { UserFilter } from "@/components/shared/user-filter"

export default function LibraryViewPage() {
  const params = useParams()
  const router = useRouter()
  const { hasPermission } = usePermission()
  const libraryId = Number(params.id)
  const [library, setLibrary] = React.useState<Library | null>(null)
  const [clips, setClips] = React.useState<VideoClip[]>([])
  const [selectedClips, setSelectedClips] = React.useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false)
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false)
  const [showVertical, setShowVertical] = React.useState(false)
  const [showLandscape, setShowLandscape] = React.useState(false)
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null)
  const [usersWithUploads, setUsersWithUploads] = React.useState<FootageUserWithUploadCount[]>([])
  const itemsPerPage = 8
  const [pagination, setPagination] = React.useState({
    total: 0,
    per_page: itemsPerPage,
    current_page: 1,
    last_page: 1,
  })

  const hasAccess =
    hasPermission("view_footage_library") || hasPermission("manage_footage_library")

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

  const mapFootageToClip = React.useCallback((footage: Footage): VideoClip => {
    const filename =
      footage.title?.trim() ||
      footage.storage_file?.path?.split("/").pop() ||
      `Footage ${footage.id}`
    return {
      id: String(footage.id),
      filename,
      status: footage.status,
      videoUrl: footage.storage_file?.url ?? null,
      orientation: footage.metadata?.orientation,
    }
  }, [])

  const findFolderById = React.useCallback((folders: FootageFolder[], id: number): FootageFolder | null => {
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
      const response = await footageLibraryService.listFolders()
      if (response.success && response.data) {
        const match = findFolderById(response.data, libraryId)
        if (match) {
          setLibrary({
            id: match.id,
            name: match.name,
            parent_id: match.parent_id,
            path: match.path,
            footage_count: match.footage_count,
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

  // Build orientation filter based on checkbox selection
  const orientationFilter = React.useMemo(() => {
    const filters: ('horizontal' | 'vertical')[] = []
    if (showVertical) filters.push('vertical')
    if (showLandscape) filters.push('horizontal')
    return filters.length > 0 ? filters : undefined
  }, [showVertical, showLandscape])

  const loadClips = React.useCallback(async () => {
    if (!Number.isFinite(libraryId)) return
    try {
      setIsLoading(true)
      // Use admin endpoint when user filter is applied, otherwise use customer endpoint
      const params = {
        folder_id: libraryId,
        per_page: itemsPerPage,
        page: currentPage,
        orientation: orientationFilter,
        ...(selectedUserId && { user_id: selectedUserId }),
      }
      
      const response = selectedUserId
        ? await footageLibraryService.listFootageAdmin(params)
        : await footageLibraryService.listFootage(params)
      
      if (response.success && response.data) {
        setClips(response.data.map(mapFootageToClip))
        setSelectedClips(new Set())
        if (response.pagination) {
          setPagination(response.pagination)
          if (response.pagination.current_page !== currentPage) {
            setCurrentPage(response.pagination.current_page)
          }
        }
      }
    } catch (error) {
      console.error("Failed to load footage:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, itemsPerPage, libraryId, mapFootageToClip, orientationFilter, selectedUserId])

  React.useEffect(() => {
    if (!hasAccess) return
    loadLibrary()
  }, [hasAccess, loadLibrary])

  // Stats state for total counts (without filter)
  const [stats, setStats] = React.useState({ vertical: 0, horizontal: 0, total: 0 })

  // Load stats separately for the cards (without orientation filter)
  const loadStats = React.useCallback(async () => {
    if (!Number.isFinite(libraryId)) return
    try {
      // Fetch counts for each orientation
      const [verticalRes, horizontalRes, totalRes] = await Promise.all([
        footageLibraryService.listFootage({ folder_id: libraryId, orientation: ['vertical'], per_page: 1 }),
        footageLibraryService.listFootage({ folder_id: libraryId, orientation: ['horizontal'], per_page: 1 }),
        footageLibraryService.listFootage({ folder_id: libraryId, per_page: 1 }),
      ])
      setStats({
        vertical: verticalRes.pagination?.total || 0,
        horizontal: horizontalRes.pagination?.total || 0,
        total: totalRes.pagination?.total || 0,
      })
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }, [libraryId])

  React.useEffect(() => {
    if (!hasAccess) return
    loadClips()
  }, [hasAccess, loadClips])

  React.useEffect(() => {
    if (!hasAccess) return
    loadStats()
  }, [hasAccess, loadStats])

  // Load users with upload counts
  const loadUsers = React.useCallback(async () => {
    try {
      const response = await footageLibraryService.getUsersWithUploads()
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
  }, [showVertical, showLandscape, selectedUserId])

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
        numericIds.map((id) => footageLibraryService.deleteFootage(id, true))
      )
      setClips((prev) => prev.filter((clip) => !selectedClips.has(clip.id)))
      setSelectedClips(new Set())
      toast.success("Selected clips deleted")
    } catch (error) {
      console.error("Failed to delete selected clips:", error)
      toast.error("Failed to delete selected clips")
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
              onClick={() => router.push("/admin/footage-library")}
              className="h-8 w-8"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
              <span className="sr-only">Back to libraries</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{library?.name || "Footage Library"}</h1>
              <p className="text-muted-foreground mt-2">
                See all social media automation campaigns in a single row.
              </p>
            </div>
          </div>
          <UploadSection onUploadClick={() => setIsUploadModalOpen(true)} />
        </div>

        {/* Statistics with Filter Checkboxes */}
        <DetailStatisticsCards
          verticalCount={stats.vertical}
          landscapeCount={stats.horizontal}
          totalClips={stats.total}
          lastUpdated={formatDate(library?.updated_at)}
          showVertical={showVertical}
          showLandscape={showLandscape}
          onVerticalChange={setShowVertical}
          onLandscapeChange={setShowLandscape}
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
        {(showVertical || showLandscape || selectedUserId) && (
          <div className="text-sm text-muted-foreground">
            Showing {pagination.total} {showVertical && showLandscape ? '' : showVertical ? 'vertical' : showLandscape ? 'landscape' : ''} {selectedUserId ? `files from selected user` : 'clips'}
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
            loadStats()
          }}
        />

        {/* Video Grid/List */}
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading footage...</div>
        ) : clips.length > 0 ? (
          <div className="space-y-4">
            <VideoClipGrid
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
        ) : (showVertical || showLandscape) ? (
          <div className="text-center text-muted-foreground py-12">
            No clips match the current filter. Try adjusting your orientation filter.
          </div>
        ) : (
          <VideoClipGrid
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
          title="Delete Selected Clips"
          description={`Are you sure you want to delete ${selectedClips.size} selected clip${selectedClips.size > 1 ? 's' : ''}? This action cannot be undone.`}
          onConfirm={confirmDeleteSelected}
        />
      </div>
    </AdminDashboardLayout>
  )
}
