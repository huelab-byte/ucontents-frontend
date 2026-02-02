"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { FolderTable } from "@/components/media-upload/folder-table"
import { mediaUploadService, type MediaUploadFolder } from "@/lib/api"
import { toast } from "@/lib/toast"

export default function MediaUploadPage() {
  const router = useRouter()
  const [folders, setFolders] = React.useState<MediaUploadFolder[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const loadFolders = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await mediaUploadService.listFolders(null)
      if (res.success && res.data) {
        setFolders(res.data)
      }
    } catch (err) {
      console.error("Failed to load folders:", err)
      toast.error("Failed to load folders")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadFolders()
  }, [loadFolders])

  const handleCreateFolder = async (data: { name: string; parent_id?: number | null }): Promise<string | null> => {
    try {
      const res = await mediaUploadService.createFolder(data)
      if (res.success && res.data) {
        setFolders((prev) => [res.data!, ...prev])
        toast.success("Folder created")
        return null
      }
      // Extract error message from validation errors or message
      if (res.errors && typeof res.errors === 'object') {
        const errorKeys = Object.keys(res.errors)
        if (errorKeys.length > 0) {
          const firstErrors = res.errors[errorKeys[0]]
          if (Array.isArray(firstErrors) && firstErrors.length > 0) {
            return firstErrors[0]
          }
        }
      }
      return res.message || "Failed to create folder"
    } catch (err: unknown) {
      // Handle rejected promise from API client (e.g., 422 validation errors)
      const error = err as { errors?: Record<string, string[]>; message?: string }
      if (error.errors && typeof error.errors === 'object') {
        const errorKeys = Object.keys(error.errors)
        if (errorKeys.length > 0) {
          const firstErrors = error.errors[errorKeys[0]]
          if (Array.isArray(firstErrors) && firstErrors.length > 0) {
            return firstErrors[0]
          }
        }
      }
      return error.message || "Failed to create folder"
    }
  }

  const handleUpdateFolder = async (id: number, data: { name: string }) => {
    const res = await mediaUploadService.updateFolder(id, data)
    if (res.success && res.data) {
      setFolders((prev) =>
        prev.map((f) => (f.id === id ? res.data! : f))
      )
      toast.success("Folder updated")
    }
  }

  const handleDeleteFolder = async (id: number) => {
    try {
      const res = await mediaUploadService.deleteFolder(id)
      if (res.success) {
        setFolders((prev) => prev.filter((f) => f.id !== id))
        toast.success("Folder deleted")
      }
    } catch (err) {
      console.error("Delete failed:", err)
      toast.error("Failed to delete folder")
    }
  }

  const handleNavigate = (id: number) => {
    router.push(`/content-generation/media-upload/${id}`)
  }

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Media Upload</h1>
          <p className="text-muted-foreground mt-2">
            Create folders and upload videos for automated content generation. Each folder can have its own caption
            templates and AI content settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Folders</p>
            <p className="text-2xl font-bold">{folders.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Videos</p>
            <p className="text-2xl font-bold">
              {folders.reduce((sum, f) => sum + (f.media_uploads_count ?? 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        <FolderTable
          folders={folders}
          isLoading={isLoading}
          onCreateFolder={handleCreateFolder}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
          onNavigate={handleNavigate}
        />
      </div>
    </CustomerDashboardLayout>
  )
}
