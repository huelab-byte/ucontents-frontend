"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  FolderIcon,
  ClockIcon,
  Upload01Icon,
  DeleteIcon,
  CancelCircleIcon,
  FolderOpenIcon,
  MoreVerticalCircle01Icon,
  EditIcon,
  PlusSignIcon,
  ImageIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface ImageOverlay {
  id: string
  filename: string
  fileSize: string
  lastUpdated: string
  status?: "READY" | "NEW" | "PROCESSING"
  uploadProgress?: number
  url?: string
}

interface Library {
  id: string
  name: string
  description: string
  overlays: ImageOverlay[]
}

const libraryData: Record<string, Library> = {
  particles: {
    id: "particles",
    name: "Particles",
    description: "Static dust, light specks, or abstract particle textures",
    overlays: [
      {
        id: "1",
        filename: "dust_texture_001.png",
        fileSize: "2.5 MB",
        lastUpdated: "2 days ago",
        status: "READY",
      },
      {
        id: "2",
        filename: "light_specs_002.png",
        fileSize: "3.1 MB",
        lastUpdated: "1 week ago",
        status: "READY",
      },
      {
        id: "3",
        filename: "particle_texture_003.png",
        fileSize: "2.8 MB",
        lastUpdated: "3 days ago",
        status: "READY",
      },
    ],
  },
  vignette: {
    id: "vignette",
    name: "Vignette",
    description: "Soft edge shading to enhance focus and contrast",
    overlays: [
      {
        id: "1",
        filename: "vignette_soft_001.png",
        fileSize: "1.8 MB",
        lastUpdated: "5 days ago",
        status: "READY",
      },
      {
        id: "2",
        filename: "vignette_dark_002.png",
        fileSize: "2.2 MB",
        lastUpdated: "1 week ago",
        status: "READY",
      },
    ],
  },
}

function EditLibraryDialog({
  library,
  onUpdate,
  onClose,
}: {
  library: Library | null
  onUpdate: (updates: Partial<Omit<Library, "id">>) => void
  onClose: () => void
}) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  React.useEffect(() => {
    if (library) {
      setName(library.name)
      setDescription(library.description)
    }
  }, [library])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (library && name.trim() && description.trim()) {
      onUpdate({
        name: name.trim(),
        description: description.trim(),
      })
      onClose()
    }
  }

  const handleCancel = () => {
    if (library) {
      setName(library.name)
      setDescription(library.description)
    }
    onClose()
  }

  if (!library) return null

  return (
    <AlertDialog open={!!library} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Library</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Library Name</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Library Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Description</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit">Save Changes</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function ImageOverlaysLibraryPage() {
  const params = useParams()
  const router = useRouter()
  const libraryId = params.folderId as string
  const [overlays, setOverlays] = React.useState<ImageOverlay[]>(
    libraryData[libraryId]?.overlays || libraryData.particles.overlays
  )
  const [library, setLibrary] = React.useState<Library>(
    libraryData[libraryId] || libraryData.particles
  )
  const [selectedOverlays, setSelectedOverlays] = React.useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 8
  const [uploadQueue, setUploadQueue] = React.useState<File[]>([])
  const [processingBatch, setProcessingBatch] = React.useState(false)
  const batchSize = 10
  const [editingLibrary, setEditingLibrary] = React.useState<Library | null>(null)
  const objectUrlsRef = React.useRef<Map<string, string>>(new Map())

  // Pagination
  const totalPages = Math.ceil(overlays.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOverlays = overlays.slice(startIndex, endIndex)

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

  // Handle overlay selection
  const handleToggleSelection = (overlayId: string) => {
    setSelectedOverlays((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(overlayId)) {
        newSet.delete(overlayId)
      } else {
        newSet.add(overlayId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedOverlays.size === currentOverlays.length) {
      setSelectedOverlays(new Set())
    } else {
      setSelectedOverlays(new Set(currentOverlays.map((o) => o.id)))
    }
  }

  const handleDeleteSelected = () => {
    // Clean up object URLs for selected overlays
    selectedOverlays.forEach((id) => {
      const objectUrl = objectUrlsRef.current.get(id)
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrlsRef.current.delete(id)
      }
    })
    setOverlays((prev) => prev.filter((overlay) => !selectedOverlays.has(overlay.id)))
    setSelectedOverlays(new Set())
  }

  // File upload handlers
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const newOverlays: ImageOverlay[] = fileArray.map((file, index) => {
      const overlayId = `new-${Date.now()}-${index}`
      const objectUrl = URL.createObjectURL(file)
      objectUrlsRef.current.set(overlayId, objectUrl)
      return {
        id: overlayId,
        filename: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        lastUpdated: "Just now",
        status: "NEW" as const,
        uploadProgress: 0,
        url: objectUrl,
      }
    })

    setOverlays((prev) => [...newOverlays, ...prev])

    // Simulate upload progress
    newOverlays.forEach((overlay) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setOverlays((prev) =>
            prev.map((o) =>
              o.id === overlay.id
                ? { ...o, uploadProgress: 100, status: "PROCESSING" as const }
                : o
            )
          )
          setTimeout(() => {
            setOverlays((prev) =>
              prev.map((o) => (o.id === overlay.id ? { ...o, status: "READY" as const, uploadProgress: undefined } : o))
            )
          }, 2000)
        } else {
          setOverlays((prev) =>
            prev.map((o) => (o.id === overlay.id ? { ...o, uploadProgress: progress } : o))
          )
        }
      }, 200)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDeleteOverlay = (id: string) => {
    // Clean up object URL if it exists
    const objectUrl = objectUrlsRef.current.get(id)
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrlsRef.current.delete(id)
    }
    setOverlays((prev) => prev.filter((overlay) => overlay.id !== id))
  }

  const handleUpdateLibrary = (updates: Partial<Omit<Library, "id">>) => {
    setLibrary((prev) => ({ ...prev, ...updates }))
    setEditingLibrary(null)
  }

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url)
      })
      objectUrlsRef.current.clear()
    }
  }, [])

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/footage-library/image-overlays")}
              className="h-8 w-8"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
              <span className="sr-only">Back to Image Overlays Library</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{library.name}</h1>
              <p className="text-muted-foreground mt-2">{library.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingLibrary(library)}
            >
              <HugeiconsIcon icon={EditIcon} className="size-4 mr-2" />
              Edit Library
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Overlays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={ImageIcon} className="size-5 text-muted-foreground" />
                <div className="text-3xl font-bold">{overlays.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Last Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <HugeiconsIcon icon={ClockIcon} className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {overlays[0]?.lastUpdated || "Never"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Images Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadQueue.length > 0 && (
              <div className="px-4 pb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>
                    {uploadQueue.length} file{uploadQueue.length !== 1 ? "s" : ""} queued
                    {processingBatch && " • Processing batch..."}
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    100,
                    Math.max(0, ((overlays.length - uploadQueue.length) / (overlays.length + uploadQueue.length)) * 100)
                  )}
                  className="h-1"
                />
              </div>
            )}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30 relative"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <HugeiconsIcon icon={Upload01Icon} className="size-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs font-medium mb-1">drag & drop image files</p>
              <p className="text-xs text-muted-foreground mb-2">or click to browse</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    document.getElementById("image-upload")?.click()
                  }}
                >
                  <HugeiconsIcon icon={FolderOpenIcon} className="size-3.5 mr-1.5" />
                  Import Images
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Gallery */}
        {overlays.length > 0 ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Image Gallery</CardTitle>
              {selectedOverlays.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                >
                  <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
                  Delete Selected ({selectedOverlays.size})
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedOverlays.size === currentOverlays.length && currentOverlays.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
                <Label className="text-sm text-muted-foreground">
                  Select all on this page
                </Label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {currentOverlays.map((overlay) => (
                  <Card
                    key={overlay.id}
                    className={cn(
                      "cursor-pointer hover:border-primary transition-colors overflow-hidden relative group",
                      selectedOverlays.has(overlay.id) && "border-primary ring-2 ring-primary"
                    )}
                    onClick={() => handleToggleSelection(overlay.id)}
                  >
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {overlay.url ? (
                        <img
                          src={overlay.url}
                          alt={overlay.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HugeiconsIcon icon={FolderIcon} className="size-12 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <input
                          type="checkbox"
                          checked={selectedOverlays.has(overlay.id)}
                          onChange={() => handleToggleSelection(overlay.id)}
                          className="rounded border-border"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {overlay.status === "PROCESSING" && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <div className="text-xs font-medium">Processing...</div>
                        </div>
                      )}
                      {overlay.status === "NEW" && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="text-xs font-medium text-primary">New</div>
                        </div>
                      )}
                      {overlay.uploadProgress !== undefined && overlay.uploadProgress < 100 && (
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <Progress value={overlay.uploadProgress} className="h-1" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium text-xs truncate mb-1">
                        {overlay.filename}
                      </p>
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon" className="h-6 w-6" />}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-3" />
                            <span className="sr-only">Options</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteOverlay(overlay.id)
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border mt-4">
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    Showing {(startIndex + 1).toLocaleString()} to{" "}
                    {Math.min(endIndex, overlays.length).toLocaleString()} of {overlays.length.toLocaleString()} images
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 shrink-0"
                    >
                      <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
                      <span className="sr-only">Previous page</span>
                    </Button>
                    <div className="flex items-center gap-1 flex-wrap justify-center max-w-full">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          onClick={() => handlePageChange(page)}
                          className={cn(
                            "h-8 min-w-8 px-2 shrink-0 text-xs sm:text-sm",
                            currentPage === page && "bg-primary text-primary-foreground"
                          )}
                        >
                          {page.toLocaleString()}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 shrink-0"
                    >
                      <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
                      <span className="sr-only">Next page</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <CardContent className="pt-6">
              <HugeiconsIcon icon={FolderIcon} className="size-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No images yet</CardTitle>
              <p className="text-muted-foreground mb-4">Upload your first image to get started.</p>
            </CardContent>
          </Card>
        )}

        {/* Selection Bar */}
        {selectedOverlays.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedOverlays.size} image{selectedOverlays.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select all
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                  <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedOverlays(new Set())}
                  className="h-8 w-8"
                >
                  <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
                  <span className="sr-only">Clear selection</span>
                </Button>
              </div>
            </div>
          </div>
        )}

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
