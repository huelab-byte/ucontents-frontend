"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
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
  Video01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface VideoOverlay {
  id: string
  filename: string
  duration: string
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
  overlays: VideoOverlay[]
}

const libraryData: Record<string, Library> = {
  texture: {
    id: "texture",
    name: "Texture",
    description: "Film grain, dust, noise, and organic surface effects",
    overlays: [
      {
        id: "1",
        filename: "ffqrod68b52cac6bdeaa3b3aha8f3d59eb3dgfhdgxim.mp4",
        duration: "0:30",
        fileSize: "12.5 MB",
        lastUpdated: "2 days ago",
        status: "READY",
        url: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/bts_haunted/in_queue/ffqrod68b52cac6bdeaa3b3aha8f3d59eb3dgfhdgxim.mp4",
      },
      {
        id: "2",
        filename: "ffbh6sq8b53f34a9d56a3b3b3992de97b6h292d2orwo.mp4",
        duration: "0:45",
        fileSize: "15.2 MB",
        lastUpdated: "1 week ago",
        status: "READY",
        url: "https://n8n-flow.blr1.cdn.digitaloceanspaces.com/shorts_automation/bts_haunted/in_queue/ffbh6sq8b53f34a9d56a3b3b3992de97b6h292d2orwo.mp4",
      },
    ],
  },
  lighting: {
    id: "lighting",
    name: "Lighting",
    description: "Light leaks, flares, glow, and shadow overlays",
    overlays: [
      {
        id: "1",
        filename: "light_leak_001.mp4",
        duration: "0:35",
        fileSize: "14.8 MB",
        lastUpdated: "1 week ago",
        status: "READY",
      },
      {
        id: "2",
        filename: "lens_flare_002.mp4",
        duration: "0:40",
        fileSize: "16.1 MB",
        lastUpdated: "2 days ago",
        status: "READY",
      },
    ],
  },
  motion: {
    id: "motion",
    name: "Motion",
    description: "Subtle movement overlays to add life and flow",
    overlays: [
      {
        id: "1",
        filename: "subtle_motion_001.mp4",
        duration: "0:25",
        fileSize: "11.3 MB",
        lastUpdated: "3 days ago",
        status: "READY",
      },
    ],
  },
  cinematic: {
    id: "cinematic",
    name: "Cinematic",
    description: "Film-style overlays for dramatic and premium looks",
    overlays: [
      {
        id: "1",
        filename: "film_style_001.mp4",
        duration: "0:50",
        fileSize: "18.5 MB",
        lastUpdated: "5 days ago",
        status: "READY",
      },
    ],
  },
  ui_fx: {
    id: "ui_fx",
    name: "UI FX",
    description: "HUD, interface lines, digital indicators, and tech effects",
    overlays: [
      {
        id: "1",
        filename: "hud_overlay_001.mp4",
        duration: "0:30",
        fileSize: "13.2 MB",
        lastUpdated: "1 week ago",
        status: "READY",
      },
    ],
  },
  glitch_fx: {
    id: "glitch_fx",
    name: "Glitch FX",
    description: "Digital distortion, RGB split, error, and glitch visuals",
    overlays: [
      {
        id: "1",
        filename: "glitch_effect_001.mp4",
        duration: "0:35",
        fileSize: "14.7 MB",
        lastUpdated: "4 days ago",
        status: "READY",
      },
    ],
  },
  particles: {
    id: "particles",
    name: "Particles",
    description: "Floating dust, sparks, smoke, or abstract particles",
    overlays: [
      {
        id: "1",
        filename: "particles_001.mp4",
        duration: "0:45",
        fileSize: "16.8 MB",
        lastUpdated: "2 days ago",
        status: "READY",
      },
    ],
  },
  vignette: {
    id: "vignette",
    name: "Vignette",
    description: "Edge darkening to focus attention on the center",
    overlays: [
      {
        id: "1",
        filename: "vignette_001.mp4",
        duration: "1:00",
        fileSize: "9.2 MB",
        lastUpdated: "6 days ago",
        status: "READY",
      },
    ],
  },
  branding: {
    id: "branding",
    name: "Branding",
    description: "Logo reveals, watermarks, and identity overlays",
    overlays: [
      {
        id: "1",
        filename: "logo_reveal_001.mp4",
        duration: "0:40",
        fileSize: "15.5 MB",
        lastUpdated: "3 days ago",
        status: "READY",
      },
    ],
  },
}

export default function VideoOverlaysLibraryPage() {
  const params = useParams()
  const router = useRouter()
  const libraryId = params.folderId as string
  const [overlays, setOverlays] = React.useState<VideoOverlay[]>(
    libraryData[libraryId]?.overlays || libraryData.texture.overlays
  )
  const [uploadQueue, setUploadQueue] = React.useState<File[]>([])
  const [processingBatch, setProcessingBatch] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 8
  const [selectedOverlays, setSelectedOverlays] = React.useState<Set<string>>(new Set())
  const objectUrlsRef = React.useRef<Map<string, string>>(new Map())

  const library = libraryData[libraryId] || libraryData.texture

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
    const newOverlays: VideoOverlay[] = fileArray.map((file, index) => {
      const overlayId = `new-${Date.now()}-${index}`
      const objectUrl = URL.createObjectURL(file)
      objectUrlsRef.current.set(overlayId, objectUrl)
      return {
        id: overlayId,
        filename: file.name,
        duration: "0:00",
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/footage-library/video-overlays")}
            className="h-8 w-8"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
            <span className="sr-only">Back to Video Overlays Library</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{library.name}</h1>
            <p className="text-muted-foreground mt-2">{library.description}</p>
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
                <HugeiconsIcon icon={Video01Icon} className="size-5 text-muted-foreground" />
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

        {/* Upload Videos Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Overlay Footage</CardTitle>
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
              onClick={() => document.getElementById("video-upload")?.click()}
            >
              <HugeiconsIcon icon={Upload01Icon} className="size-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs font-medium mb-1">drag & drop video files</p>
              <p className="text-xs text-muted-foreground mb-2">or click to browse</p>
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload" className="inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    document.getElementById("video-upload")?.click()
                  }}
                >
                  <HugeiconsIcon icon={FolderOpenIcon} className="size-3.5 mr-1.5" />
                  Import Videos
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Videos Gallery */}
        {overlays.length > 0 ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Video Overlays</CardTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentOverlays.map((overlay) => (
                  <Card
                    key={overlay.id}
                    className={cn(
                      "cursor-pointer hover:border-primary transition-colors overflow-hidden relative",
                      selectedOverlays.has(overlay.id) && "border-primary ring-2 ring-primary"
                    )}
                    onClick={() => handleToggleSelection(overlay.id)}
                  >
                    <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedOverlays.has(overlay.id)}
                          onChange={() => handleToggleSelection(overlay.id)}
                          className="rounded border-border"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {overlay.url ? (
                        <video
                          src={overlay.url}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HugeiconsIcon
                            icon={Video01Icon}
                            className="size-12 text-muted-foreground/50"
                          />
                        </div>
                      )}
                      {overlay.status === "PROCESSING" && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <div className="text-xs font-medium">Processing...</div>
                        </div>
                      )}
                      {overlay.status === "NEW" && (
                        <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                          New
                        </div>
                      )}
                      {overlay.uploadProgress !== undefined && overlay.uploadProgress < 100 && (
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/80">
                          <Progress value={overlay.uploadProgress} className="h-1" />
                        </div>
                      )}
                      {overlay.duration && (
                        <div className="absolute top-2 right-2 bg-background/80 px-2 py-1 rounded text-xs font-medium">
                          {overlay.duration}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {overlay.filename}
                        </p>
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
                    {Math.min(endIndex, overlays.length).toLocaleString()} of {overlays.length.toLocaleString()} videos
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
              <HugeiconsIcon
                icon={FolderIcon}
                className="size-12 mx-auto text-muted-foreground mb-4"
              />
              <CardTitle className="mb-2">No overlays yet</CardTitle>
              <p className="text-muted-foreground">
                Overlays will appear here once they are uploaded.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Selection Bar */}
        {selectedOverlays.size > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedOverlays.size} video{selectedOverlays.size !== 1 ? "s" : ""} selected
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
      </div>
    </AdminDashboardLayout>
  )
}
