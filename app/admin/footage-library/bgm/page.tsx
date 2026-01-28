"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import {
  StatisticsCards,
  LibraryTable,
  EditLibraryDialog,
  demoLibraries,
  type Library,
} from "@/components/bgm"

export default function BGMLibraryPage() {
  const router = useRouter()
  const [libraries, setLibraries] = React.useState<Library[]>(demoLibraries)
  const [editingLibrary, setEditingLibrary] = React.useState<Library | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 5

  const totalPages = Math.ceil(libraries.length / itemsPerPage)

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleCreateLibrary = (library: Pick<Library, "name" | "parent_id">) => {
    const newLibrary: Library = {
      ...library,
      id: Date.now().toString(),
      lastUpdated: "Just now",
    }
    setLibraries((prev) => [newLibrary, ...prev])
    return true
  }

  const handleUpdateLibrary = (id: number | string, updates: Pick<Library, "name" | "parent_id">) => {
    setLibraries((prev) =>
      prev.map((library) => {
        if (library.id === id) {
          return { ...library, ...updates, lastUpdated: "Just now" }
        }
        return library
      })
    )
    setEditingLibrary(null)
    return true
  }

  const handleDeleteLibrary = (library: Library) => {
    setLibraries((prev) => prev.filter((lib) => lib.id !== library.id))
  }

  const handleToggleStar = (id: string) => {
    setLibraries(
      libraries.map((library) => (library.id === id ? { ...library, isStarred: !library.isStarred } : library))
    )
  }

  const handleEditLibrary = (library: Library) => {
    setEditingLibrary(library)
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">BGM Library</h1>
          <p className="text-muted-foreground mt-2">
            Background music tracks used to set the emotional tone of videos. Organized by mood for quick matching with content or visuals.
          </p>
        </div>

        {/* Statistics Section */}
        <StatisticsCards totalFolders={libraries.length} stats={null} />

        {/* Libraries Table */}
        <LibraryTable
          libraries={libraries}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onView={(id) => router.push(`/admin/footage-library/bgm/${id}`)}
          onEdit={handleEditLibrary}
          onDelete={handleDeleteLibrary}
          onCreate={handleCreateLibrary}
        />

        {/* Edit Library Dialog */}
        <EditLibraryDialog
          library={editingLibrary}
          onUpdate={handleUpdateLibrary}
          onClose={() => setEditingLibrary(null)}
        />
      </div>
    </AdminDashboardLayout>
  )
}
