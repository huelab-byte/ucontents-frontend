"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { usePermission } from "@/lib/hooks/use-permission"
import { imageOverlayService, type ImageOverlayFolder } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import { FolderIcon } from "@hugeicons/core-free-icons"

export default function LibraryImageOverlaysPage() {
  const router = useRouter()
  const { hasPermission } = usePermission()
  const [folders, setFolders] = React.useState<ImageOverlayFolder[]>([])
  const [loading, setLoading] = React.useState(true)

  const canBrowse = hasPermission("use_image_overlay")

  React.useEffect(() => {
    if (!canBrowse) return
    setLoading(true)
    imageOverlayService
      .browseFolders()
      .then((res) => {
        if (res.success && res.data) setFolders(res.data)
      })
      .catch((err) => console.error("Failed to load folders", err))
      .finally(() => setLoading(false))
  }, [canBrowse])

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
      <div>
        <h1 className="text-3xl font-bold">Image Overlays</h1>
        <p className="text-muted-foreground mt-1">Browse and use image overlays in your content. Read-only.</p>
      </div>

      {loading ? (
        <Card className="p-12 text-center mr-0 sm:mr-[26px]">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Loading folders...</p>
          </CardContent>
        </Card>
      ) : folders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <HugeiconsIcon icon={FolderIcon} className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No folders with image overlays yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Folders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folder</TableHead>
                  <TableHead className="text-center">Overlays</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {folders.map((folder) => (
                  <TableRow
                    key={folder.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/library/image-overlays/${folder.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                          <HugeiconsIcon icon={FolderIcon} className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <span className="font-medium">{folder.name}</span>
                          {folder.path && folder.path !== folder.name && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{folder.path}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{folder.image_overlay_count ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
