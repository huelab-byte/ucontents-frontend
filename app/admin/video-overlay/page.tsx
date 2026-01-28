"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { FolderIcon } from "@hugeicons/core-free-icons"
import {
  NewLibraryDialog,
  EditLibraryDialog,
  StatisticsCards,
  LibraryTable,
  type Library,
} from "@/components/video-overlay"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { usePermission } from "@/lib/hooks/use-permission"
import { videoOverlayService, toast, type VideoOverlayStats } from "@/lib/api"

export default function VideoOverlayPage() {
  const router = useRouter()
  const { hasPermission } = usePermission()
  const [libraries, setLibraries] = React.useState<Library[]>([])
  const [editingLibrary, setEditingLibrary] = React.useState<Library | null>(null)
  const [deletingLibrary, setDeletingLibrary] = React.useState<Library | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)
  const [stats, setStats] = React.useState<VideoOverlayStats | null>(null)

  const hasAccess =
    hasPermission("view_video_overlay") || hasPermission("manage_video_overlay")

  const itemsPerPage = 5

  // Reset to page 1 if current page exceeds total pages (e.g., after deletion)
  React.useEffect(() => {
    const totalPages = Math.ceil(libraries.length / itemsPerPage)
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [libraries.length, currentPage, itemsPerPage])

  const totalPages = Math.ceil(libraries.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const loadLibraries = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await videoOverlayService.listFolders()
      if (response.success && response.data) {
        setLibraries(response.data)
      }
    } catch (error) {
      console.error("Failed to load folders:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadStats = React.useCallback(async () => {
    try {
      const response = await videoOverlayService.getAdminStats()
      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }, [])

  React.useEffect(() => {
    if (!hasAccess) return
    loadLibraries()
    loadStats()
  }, [hasAccess, loadLibraries, loadStats])

  const handleCreateLibrary = async (library: Pick<Library, "name" | "parent_id">) => {
    try {
      const response = await videoOverlayService.createFolder({
        name: library.name,
        parent_id: library.parent_id ?? null,
      })
      const data = response.success ? response.data : undefined
      if (data) {
        setLibraries((prev) => [data, ...prev])
        toast.success("Folder created successfully")
        return true
      }
    } catch (error) {
      console.error("Failed to create folder:", error)
      toast.error("Failed to create folder")
    }
    return false
  }

  const handleUpdateLibrary = async (id: number, updates: Pick<Library, "name" | "parent_id">) => {
    try {
      const response = await videoOverlayService.updateFolder(id, {
        name: updates.name,
        parent_id: updates.parent_id ?? null,
      })
      const data = response.success ? response.data : undefined
      if (data) {
        setLibraries((prev) => prev.map((lib) => (lib.id === id ? data : lib)))
        toast.success("Folder updated successfully")
        setEditingLibrary(null)
        return true
      }
    } catch (error) {
      console.error("Failed to update folder:", error)
      toast.error("Failed to update folder")
    }
    return false
  }

  const handleDeleteLibrary = (library: Library) => {
    setDeletingLibrary(library)
  }

  const confirmDeleteLibrary = async () => {
    if (!deletingLibrary) return
    
    try {
      const response = await videoOverlayService.deleteFolder(deletingLibrary.id)
      if (response.success) {
        setLibraries((prev) => prev.filter((lib) => lib.id !== deletingLibrary.id))
        toast.success("Folder deleted successfully")
      }
    } catch (error) {
      console.error("Failed to delete folder:", error)
      toast.error("Failed to delete folder")
    }
  }

  const handleEditLibrary = (library: Library) => {
    setEditingLibrary(library)
  }

  const handleView = (id: number) => {
    router.push(`/admin/video-overlay/${id}`)
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
        <div>
          <h1 className="text-3xl font-bold">Video Overlay</h1>
          <p className="text-muted-foreground mt-2">
            Organize and manage your video overlay assets - store video overlays for use in video creation workflows
          </p>
        </div>

        {/* Statistics Section */}
        <StatisticsCards
          totalFolders={libraries.length}
          stats={stats}
        />

        {/* Libraries Table */}
        {isLoading ? (
          <Card className="p-12 text-center mr-0 sm:mr-[26px]">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Loading folders...</p>
            </CardContent>
          </Card>
        ) : libraries.length > 0 ? (
          <LibraryTable
            libraries={libraries}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onView={handleView}
            onEdit={handleEditLibrary}
            onDelete={handleDeleteLibrary}
            onCreate={handleCreateLibrary}
          />
        ) : (
          <Card className="p-12 text-center mr-0 sm:mr-[26px]">
            <CardContent className="pt-6 flex flex-col items-center">
              <HugeiconsIcon
                icon={FolderIcon}
                className="size-12 text-muted-foreground mb-4"
              />
              <h2 className="text-lg font-semibold mb-2">No folders yet</h2>
              <p className="text-muted-foreground mb-4">
                Create your first folder to organize your video overlay assets.
              </p>
              <NewLibraryDialog onCreate={handleCreateLibrary} />
            </CardContent>
          </Card>
        )}

        {/* Edit Library Dialog */}
        <EditLibraryDialog
          library={editingLibrary}
          onUpdate={handleUpdateLibrary}
          onClose={() => setEditingLibrary(null)}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={!!deletingLibrary}
          onOpenChange={(open) => !open && setDeletingLibrary(null)}
          title="Delete Folder"
          description={`Are you sure you want to delete "${deletingLibrary?.name}" and all its contents? This action cannot be undone.`}
          onConfirm={confirmDeleteLibrary}
        />
      </div>
    </AdminDashboardLayout>
  )
}
