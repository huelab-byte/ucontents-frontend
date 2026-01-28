"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { FolderIcon } from "@hugeicons/core-free-icons"
import { StatisticsCards } from "@/components/image-library/statistics-cards"
import { LibraryTable } from "@/components/image-library/library-table"
import { EditLibraryDialog } from "@/components/image-library/edit-library-dialog"
import { NewLibraryDialog } from "@/components/image-library/new-library-dialog"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import type { Library } from "@/components/image-library/types"
import { imageLibraryService, type ImageFolder, type ImageStats } from "@/lib/api/services/image-library.service"
import { toast } from "@/lib/api"
import { ITEMS_PER_PAGE } from "@/components/image-library/constants"

export default function ImageLibraryPage() {
  const router = useRouter()
  const [folders, setFolders] = React.useState<Library[]>([])
  const [stats, setStats] = React.useState<ImageStats | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [editingLibrary, setEditingLibrary] = React.useState<Library | null>(null)
  const [deletingLibrary, setDeletingLibrary] = React.useState<Library | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const totalPages = Math.ceil(folders.length / ITEMS_PER_PAGE)

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      
      const [foldersResponse, statsResponse] = await Promise.all([
        imageLibraryService.listFolders(),
        imageLibraryService.getAdminStats(),
      ])

      if (foldersResponse.success && foldersResponse.data) {
        const mappedFolders: Library[] = foldersResponse.data.map((folder: ImageFolder) => ({
          id: folder.id,
          name: folder.name,
          parent_id: folder.parent_id,
          path: folder.path,
          image_count: folder.image_count ?? 0,
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
      toast.error("Error", "Failed to load image library data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreateFolder = async (data: Pick<Library, "name" | "parent_id">): Promise<boolean> => {
    try {
      const response = await imageLibraryService.createFolder({
        name: data.name,
        parent_id: data.parent_id,
      })

      if (response.success) {
        toast.success("Success", "Folder created successfully")
        await loadData()
        return true
      }
      return false
    } catch (error) {
      toast.error("Error", "Failed to create folder")
      return false
    }
  }

  const handleUpdateFolder = async (id: number, data: Pick<Library, "name" | "parent_id">): Promise<boolean> => {
    try {
      const response = await imageLibraryService.updateFolder(id, {
        name: data.name,
        parent_id: data.parent_id,
      })

      if (response.success) {
        toast.success("Success", "Folder updated successfully")
        await loadData()
        return true
      }
      return false
    } catch (error) {
      toast.error("Error", "Failed to update folder")
      return false
    }
  }

  const handleDeleteFolder = (library: Library): void => {
    setDeletingLibrary(library)
  }

  const confirmDeleteFolder = async (): Promise<void> => {
    if (!deletingLibrary) return

    try {
      const response = await imageLibraryService.deleteFolder(deletingLibrary.id)

      if (response.success) {
        toast.success("Success", "Folder deleted successfully")
        await loadData()
      }
    } catch (error) {
      toast.error("Error", "Failed to delete folder")
    }
  }

  const handleViewFolder = (id: number) => {
    router.push(`/admin/image-library/${id}`)
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Image Library</h1>
            <p className="text-muted-foreground mt-2">
              Organize and manage your image assets - categorize and store photos, graphics, and illustrations for efficient content creation workflows
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
                Create your first folder to organize your image assets.
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
