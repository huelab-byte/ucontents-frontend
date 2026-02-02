"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { FolderIcon } from "@hugeicons/core-free-icons"
import { LibraryTable, type Library } from "@/components/footage-library"
import { usePermission } from "@/lib/hooks/use-permission"
import { footageLibraryService } from "@/lib/api/services/footage-library.service"
import { toast } from "@/lib/api"

export default function LibraryFootagePage() {
  const router = useRouter()
  const { hasPermission } = usePermission()
  const [libraries, setLibraries] = React.useState<Library[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(true)

  const canBrowse = hasPermission("use_footage_library")
  const canManageFolders = hasPermission("manage_footage_folders")
  const itemsPerPage = 5

  const loadFolders = React.useCallback(async () => {
    if (!canBrowse) return
    try {
      setIsLoading(true)
      const response = await footageLibraryService.browseFolders()
      if (response.success && response.data) {
        const folders = response.data as { id: number; name: string; parent_id: number | null; path: string; footage_count?: number; horizontal_count?: number; vertical_count?: number; created_at?: string; updated_at?: string }[]
        setLibraries(folders.map((f) => ({ id: f.id, name: f.name, parent_id: f.parent_id, path: f.path, footage_count: f.footage_count ?? 0, horizontal_count: f.horizontal_count ?? 0, vertical_count: f.vertical_count ?? 0, created_at: f.created_at, updated_at: f.updated_at })))
      }
    } catch (error) {
      console.error("Failed to load folders:", error)
    } finally {
      setIsLoading(false)
    }
  }, [canBrowse])

  React.useEffect(() => {
    loadFolders()
  }, [loadFolders])

  const totalPages = Math.max(1, Math.ceil(libraries.length / itemsPerPage))

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const handleView = (id: number) => {
    router.push(`/library/footage/${id}`)
  }

  const handleCreateLibrary = async (library: Pick<Library, "name" | "parent_id">) => {
    if (!canManageFolders) return false
    try {
      const response = await footageLibraryService.createFolder({ name: library.name, parent_id: library.parent_id ?? null })
      if (response.success && response.data) {
        const d = response.data
        setLibraries((prev) => [{ id: d.id, name: d.name, parent_id: d.parent_id, path: d.path, footage_count: 0, horizontal_count: 0, vertical_count: 0, created_at: d.created_at, updated_at: d.updated_at }, ...prev])
        toast.success("Folder created successfully")
        return true
      }
    } catch (error) {
      console.error("Failed to create folder:", error)
      toast.error("Failed to create folder")
    }
    return false
  }

  if (!canBrowse) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Footage Library</h1>
        <p className="text-muted-foreground">You do not have permission to browse the footage library.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Footage Library</h1>
        <p className="text-muted-foreground mt-2">
          Browse and use shared footage - same structure as admin, without stats and filters.
        </p>
      </div>

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
          {...(canManageFolders && { onCreate: handleCreateLibrary })}
        />
      ) : (
        <Card className="p-12 text-center mr-0 sm:mr-[26px]">
          <CardContent className="pt-6 flex flex-col items-center">
            <HugeiconsIcon icon={FolderIcon} className="size-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No folders yet</h2>
            <p className="text-muted-foreground">There are no shared footage folders available to browse.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
