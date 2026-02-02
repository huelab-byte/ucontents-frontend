"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { ContentSource } from "@/components/content-sources/types"
import { ContentSourceStats } from "@/components/content-sources/content-source-stats"
import { ContentSourceTable } from "@/components/content-sources/content-source-table"
import { EmptyState } from "@/components/content-sources/empty-state"
import { EditSourceDialog } from "@/components/content-sources/edit-source-dialog"
import { demoContentSources } from "@/components/content-sources/demo-data"

export default function ContentSourcesPage() {
  const router = useRouter()
  const [sources, setSources] = React.useState<ContentSource[]>(demoContentSources)
  const [editingSource, setEditingSource] = React.useState<ContentSource | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  const handleCreateSource = (source: Omit<ContentSource, "id" | "createdAt" | "campaigns" | "totalVideos">) => {
    const newSource: ContentSource = {
      ...source,
      id: `source-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      campaigns: [],
      totalVideos: 0,
    }
    setSources([newSource, ...sources])
  }

  const handleUpdateSource = (
    id: string,
    updates: Partial<Omit<ContentSource, "id" | "createdAt" | "campaigns" | "totalVideos">>
  ) => {
    setSources(
      sources.map((source) => {
        if (source.id === id) {
          return { ...source, ...updates }
        }
        return source
      })
    )
    setEditingSource(null)
  }

  const handleDeleteSource = (id: string) => {
    setSources(sources.filter((source) => source.id !== id))
  }

  const handleEditSource = (source: ContentSource) => {
    setEditingSource(source)
  }

  const handleNavigate = (id: string) => {
    router.push(`/content-generation/media-upload/${id}`)
  }

  // Pagination calculations
  const totalPages = Math.ceil(sources.length / itemsPerPage)

  // Reset to page 1 if current page exceeds total pages (e.g., after deletion)
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

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Media Upload</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage video sources used for automated editing workflows. Each source defines
            the video format, aspect ratio (9:16 or 16:9), and orientation (vertical or landscape).
          </p>
        </div>

        {/* Statistics Section */}
        <ContentSourceStats sources={sources} onCreateSource={handleCreateSource} />

        {/* Sources Table or Empty State */}
        {sources.length > 0 ? (
          <ContentSourceTable
            sources={sources}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onEdit={handleEditSource}
            onDelete={handleDeleteSource}
            onNavigate={handleNavigate}
            onPageChange={handlePageChange}
          />
        ) : (
          <EmptyState onCreateSource={handleCreateSource} />
        )}

        {/* Edit Source Dialog */}
        <EditSourceDialog
          source={editingSource}
          onUpdate={handleUpdateSource}
          onClose={() => setEditingSource(null)}
        />
      </div>
    </CustomerDashboardLayout>
  )
}
