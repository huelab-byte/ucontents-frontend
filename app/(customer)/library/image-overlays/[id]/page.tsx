"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { usePermission } from "@/lib/hooks/use-permission"
import { imageOverlayService, type ImageOverlay } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons"

export default function LibraryImageOverlaysFolderPage() {
  const params = useParams()
  const router = useRouter()
  const { hasPermission } = usePermission()
  const folderId = Number(params.id)
  const [items, setItems] = React.useState<ImageOverlay[]>([])
  const [folderName, setFolderName] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [pagination, setPagination] = React.useState<{ total: number; per_page: number; current_page: number; last_page: number } | null>(null)

  const canBrowse = hasPermission("use_image_overlay")

  React.useEffect(() => {
    if (!canBrowse || !Number.isFinite(folderId)) return
    setLoading(true)
    Promise.all([
      imageOverlayService.browseFolders(),
      imageOverlayService.browseImageOverlays({
        folder_id: folderId,
        per_page: 12,
        page,
        status: "ready",
      }),
    ])
      .then(([foldersRes, itemsRes]) => {
        if (foldersRes.success && foldersRes.data) {
          const folder = foldersRes.data.find((f) => f.id === folderId)
          if (folder) setFolderName(folder.name)
        }
        if (itemsRes.success && itemsRes.data) setItems(itemsRes.data)
        if (itemsRes.pagination) setPagination(itemsRes.pagination)
      })
      .catch((err) => console.error("Failed to load image overlays", err))
      .finally(() => setLoading(false))
  }, [canBrowse, folderId, page])

  if (!canBrowse) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Image Overlays</h1>
        <p className="text-muted-foreground">You do not have permission to browse image overlays.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/library/image-overlays")}
          aria-label="Back to folders"
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} className="size-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{folderName ?? `Folder #${folderId}`}</h1>
          <p className="text-muted-foreground mt-1">Image overlays in this folder. Read-only.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading image overlays...</div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No image overlays in this folder.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((overlay) => (
              <Card key={overlay.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {overlay.storage_file?.url && (
                    <img
                      src={overlay.storage_file.url}
                      alt={overlay.title || "Overlay"}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <p className="font-medium truncate">{overlay.title || "Untitled"}</p>
                    <p className="text-sm text-muted-foreground">Status: {overlay.status}</p>
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      Use in content
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {pagination && pagination.last_page > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <Button
                variant="outline"
                disabled={page >= pagination.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
