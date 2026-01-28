"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { FolderIcon } from "@hugeicons/core-free-icons"
import {
  StatisticsCards,
  LibraryTable,
  EditLibraryDialog,
  NewLibraryDialog,
  type Library,
} from "@/components/image-overlay"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { usePermission } from "@/lib/hooks/use-permission"
import { imageOverlayService, toast, type ImageOverlayStats } from "@/lib/api"

const ITEMS_PER_PAGE = 5

export default function ImageOverlayPage() {
  const router = useRouter()
  const { hasPermission } = usePermission()
  const [folders, setFolders] = React.useState<Library[]>([])
  const [stats, setStats] = React.useState<ImageOverlayStats | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [editingLibrary, setEditingLibrary] = React.useState<Library | null>(null)
  const [deletingLibrary, setDeletingLibrary] = React.useState<Library | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const hasAccess =
    hasPermission("view_image_overlay") || hasPermission("manage_image_overlay")

  const totalPages = Math.ceil(folders.length / ITEMS_PER_PAGE)

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      
      const [foldersResponse, statsResponse] = await Promise.all([
        imageOverlayService.listFolders(),
        imageOverlayService.getAdminStats(),
      ])

      if (foldersResponse.success && foldersResponse.data) {
        const mappedFolders: Library[] = foldersResponse.data.map((folder) => ({
          id: folder.id,
          name: folder.name,
          parent_id: folder.parent_id,
          path: folder.path,
          image_overlay_count: folder.image_overlay_count ?? 0,
          created_at: folder.created_at,
          updated_at: folder.updated_at,
        }))
        setFolders(mappedFolders)
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
      toast.error("Failed to load image overlay data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (!hasAccess) return
    loadData()
  }, [hasAccess, loadData])

  // Reset to page 1 if current page exceeds total pages
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [folders.length, currentPage, totalPages])

  const handleCreateFolder = async (data: Pick<Library, "name" | "parent_id">): Promise<boolean> => {
    try {
      const response = await imageOverlayService.createFolder({
        name: data.name,
        parent_id: data.parent_id,
      })

      if (response.success && response.data) {
        toast.success("Folder created successfully")
        await loadData()
        return true
      }
      return false
    } catch (error) {
      toast.error("Failed to create folder")
      return false
    }
  }

  const handleUpdateFolder = async (id: number, data: Pick<Library, "name" | "parent_id">): Promise<boolean> => {
    try {
      const response = await imageOverlayService.updateFolder(id, {
        name: data.name,
        parent_id: data.parent_id,
      })

      if (response.success && response.data) {
        toast.success("Folder updated successfully")
        await loadData()
        setEditingLibrary(null)
        return true
      }
      return false
    } catch (error) {
      toast.error("Failed to update folder")
      return false
    }
  }

  const handleDeleteFolder = (library: Library): void => {
    setDeletingLibrary(library)
  }

  const confirmDeleteFolder = async (): Promise<void> => {
    if (!deletingLibrary) return

    try {
      const response = await imageOverlayService.deleteFolder(deletingLibrary.id)

      if (response.success) {
        toast.success("Folder deleted successfully")
        await loadData()
      }
    } catch (error) {
      toast.error("Failed to delete folder")
    }
  }

  const handleViewFolder = (id: number) => {
    router.push(`/admin/image-overlay/${id}`)
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Image Overlay</h1>
            <p className="text-muted-foreground mt-2">
              Organize and manage your image overlay assets - store PNG, GIF, and WebP images with transparency for use in video creation workflows
            </p>
          </div>
        </div>

        <StatisticsCards totalFolders={folders.length} stats={stats} />

        {isLoading ? (
          <Card className="p-12 text-center mr-0 sm:mr-[26px]">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Loading folders...</p>
            </CardContent>
          </Card>
        ) : folders.length > 0 ? (
          <LibraryTable
            libraries={folders}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onView={handleViewFolder}
            onEdit={setEditingLibrary}
            onDelete={handleDeleteFolder}
            onCreate={handleCreateFolder}
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
                Create your first folder to organize your image overlay assets.
              </p>
              <NewLibraryDialog onCreate={handleCreateFolder} />
            </CardContent>
          </Card>
        )}

        <EditLibraryDialog
          library={editingLibrary}
          onUpdate={handleUpdateFolder}
          onClose={() => setEditingLibrary(null)}
        />

        <DeleteConfirmDialog
          open={!!deletingLibrary}
          onOpenChange={(open) => !open && setDeletingLibrary(null)}
          title="Delete Folder"
          description={`Are you sure you want to delete "${deletingLibrary?.name}" and all its contents? This action cannot be undone.`}
          onConfirm={confirmDeleteFolder}
        />
      </div>
    </AdminDashboardLayout>
  )
}
