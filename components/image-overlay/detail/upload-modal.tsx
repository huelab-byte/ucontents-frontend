"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Upload01Icon,
  FolderOpenIcon,
  CheckmarkCircle01Icon,
  Refresh01Icon,
  Delete01Icon,
  AlertCircleIcon,
  Image01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { imageOverlayService } from "@/lib/api/services/image-overlay.service"
import { toast } from "@/lib/api"

export interface UploadFile {
  id: string
  file: File
  status: "queued" | "uploading" | "processing" | "completed" | "failed"
  progress: number
  error?: string
  previewUrl?: string
}

interface UploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderId: number
  onUploadComplete?: () => void
}

const MAX_FILES = 1000
const CONCURRENT_UPLOADS = 5
// Only formats that support transparency
const ALLOWED_TYPES = ['image/png', 'image/gif', 'image/webp']
const ALLOWED_EXTENSIONS = ['.png', '.gif', '.webp']

export function UploadModal({
  open,
  onOpenChange,
  folderId,
  onUploadComplete,
}: UploadModalProps) {
  const [files, setFiles] = React.useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const abortControllersRef = React.useRef<Map<string, AbortController>>(new Map())

  // Calculate statistics
  const totalFiles = files.length
  const completedFiles = files.filter((f) => f.status === "completed").length
  const failedFiles = files.filter((f) => f.status === "failed").length
  const uploadingFiles = files.filter((f) => f.status === "uploading").length
  const queuedFiles = files.filter((f) => f.status === "queued").length
  const overallProgress = totalFiles > 0 
    ? Math.round((completedFiles / totalFiles) * 100) 
    : 0

  // Check if file is allowed format
  const isAllowedFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension)
  }

  // Add files to the queue
  const addFiles = React.useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    const imageFiles = fileArray.filter((f) => f.type.startsWith("image/"))
    const allowedFiles = imageFiles.filter(isAllowedFile)
    
    if (imageFiles.length === 0) {
      toast.error("Please select image files only")
      return
    }

    if (allowedFiles.length === 0) {
      toast.error("Only PNG, GIF, and WebP formats are allowed (formats that support transparency)")
      return
    }

    if (allowedFiles.length < imageFiles.length) {
      toast.warning(`${imageFiles.length - allowedFiles.length} file(s) were skipped. Only PNG, GIF, and WebP formats are allowed.`)
    }

    const remainingSlots = MAX_FILES - files.length
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_FILES} files allowed`)
      return
    }

    const filesToAdd = allowedFiles.slice(0, remainingSlots)
    if (filesToAdd.length < allowedFiles.length) {
      toast.warning(`Only ${filesToAdd.length} files added. Maximum ${MAX_FILES} files allowed.`)
    }

    const newUploadFiles: UploadFile[] = filesToAdd.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`,
      file,
      status: "queued",
      progress: 0,
      previewUrl: URL.createObjectURL(file),
    }))

    setFiles((prev) => [...prev, ...newUploadFiles])
  }, [files.length])

  // Remove a file from the queue
  const removeFile = React.useCallback((fileId: string) => {
    const controller = abortControllersRef.current.get(fileId)
    if (controller) {
      controller.abort()
      abortControllersRef.current.delete(fileId)
    }
    setFiles((prev) => {
      const fileToRemove = prev.find(f => f.id === fileId)
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl)
      }
      return prev.filter((f) => f.id !== fileId)
    })
  }, [])

  // Clear all files
  const clearAll = React.useCallback(() => {
    abortControllersRef.current.forEach((controller) => controller.abort())
    abortControllersRef.current.clear()
    files.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl)
      }
    })
    setFiles([])
    setIsUploading(false)
  }, [files])

  // Upload a single file
  const uploadFile = React.useCallback(
    async (uploadFile: UploadFile): Promise<boolean> => {
      const controller = new AbortController()
      abortControllersRef.current.set(uploadFile.id, controller)

      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "uploading", progress: 0 } : f
          )
        )

        const response = await imageOverlayService.uploadImageOverlay(
          uploadFile.file,
          {
            folder_id: folderId,
            title: uploadFile.file.name.replace(/\.[^/.]+$/, ""),
          },
          (progress) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, progress } : f
              )
            )
          }
        )

        if (response.success) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: "completed", progress: 100 }
                : f
            )
          )
          return true
        } else {
          throw new Error(response.message || "Upload failed")
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return false
        }
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: "failed",
                  error: error instanceof Error ? error.message : "Upload failed",
                }
              : f
          )
        )
        return false
      } finally {
        abortControllersRef.current.delete(uploadFile.id)
      }
    },
    [folderId]
  )

  // Process upload queue with concurrency limit
  const processQueue = React.useCallback(async () => {
    if (isUploading) return

    const queuedItems = files.filter((f) => f.status === "queued")
    if (queuedItems.length === 0) return

    setIsUploading(true)

    for (let i = 0; i < queuedItems.length; i += CONCURRENT_UPLOADS) {
      const batch = queuedItems.slice(i, i + CONCURRENT_UPLOADS)
      await Promise.all(batch.map((file) => uploadFile(file)))
    }

    setIsUploading(false)
    onUploadComplete?.()
  }, [files, isUploading, uploadFile, onUploadComplete])

  // Start upload
  const startUpload = React.useCallback(() => {
    processQueue()
  }, [processQueue])

  // Retry failed uploads
  const retryFailed = React.useCallback(() => {
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "failed" ? { ...f, status: "queued", progress: 0, error: undefined } : f
      )
    )
  }, [])

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
    }
    e.target.value = ""
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files)
    }
  }

  // Get status badge
  const getStatusBadge = (status: UploadFile["status"]) => {
    switch (status) {
      case "queued":
        return <Badge variant="secondary">Queued</Badge>
      case "uploading":
        return <Badge variant="default">Uploading</Badge>
      case "processing":
        return <Badge variant="default" className="bg-yellow-500">Processing</Badge>
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
    }
  }

  // Get status icon
  const getStatusIcon = (file: UploadFile) => {
    switch (file.status) {
      case "queued":
        return <HugeiconsIcon icon={Image01Icon} className="size-4 text-muted-foreground" />
      case "uploading":
        return <HugeiconsIcon icon={Refresh01Icon} className="size-4 text-primary animate-spin" />
      case "processing":
        return <HugeiconsIcon icon={Refresh01Icon} className="size-4 text-yellow-500 animate-spin" />
      case "completed":
        return <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-green-500" />
      case "failed":
        return <HugeiconsIcon icon={AlertCircleIcon} className="size-4 text-destructive" />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  // Truncate filename
  const truncateFileName = (name: string, maxWords: number = 8) => {
    const nameWithoutExt = name.replace(/\.[^/.]+$/, "")
    const ext = name.match(/\.[^/.]+$/)?.[0] || ""
    const words = nameWithoutExt.split(/[\s_-]+/)
    
    if (words.length <= maxWords) {
      return name
    }
    
    return words.slice(0, maxWords).join(" ") + "..." + ext
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent style={{ maxWidth: 585 }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Upload Image Overlays</AlertDialogTitle>
          <AlertDialogDescription>
            Upload up to {MAX_FILES} image overlay files (PNG, GIF, or WebP only - formats that support transparency). Files will be processed in batches of {CONCURRENT_UPLOADS}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-4">
          {/* Drop Zone */}
          {!isUploading && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-muted/30"
              )}
            >
              <HugeiconsIcon icon={Upload01Icon} className="size-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Drag & drop image files here</p>
              <p className="text-xs text-muted-foreground mb-3">
                or click to browse (PNG, GIF, WebP only - max {MAX_FILES} files)
              </p>
              <Button variant="outline" size="sm" type="button">
                <HugeiconsIcon icon={FolderOpenIcon} className="size-4 mr-2" />
                Select Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/gif,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}

          {/* Progress Overview */}
          {files.length > 0 && (
            <div className="space-y-2 bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {completedFiles} of {totalFiles} completed
                  {failedFiles > 0 && (
                    <span className="text-destructive ml-2">({failedFiles} failed)</span>
                  )}
                </span>
                <span className="text-muted-foreground">
                  {uploadingFiles} uploading, {queuedFiles} queued
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <ScrollArea className="h-[200px] border rounded-lg">
              <div className="p-2 space-y-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 group"
                  >
                    {file.previewUrl ? (
                      <div className="size-8 relative rounded overflow-hidden flex-shrink-0">
                        <img
                          src={file.previewUrl}
                          alt={file.file.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      getStatusIcon(file)
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate max-w-[300px]" title={file.file.name}>
                          {truncateFileName(file.file.name)}
                        </span>
                        {getStatusBadge(file.status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.file.size)}</span>
                        {file.status === "uploading" && (
                          <span>{file.progress}%</span>
                        )}
                        {file.error && (
                          <span className="text-destructive">{file.error}</span>
                        )}
                      </div>
                      {file.status === "uploading" && (
                        <Progress value={file.progress} className="h-1 mt-1" />
                      )}
                    </div>
                    {(file.status === "queued" || file.status === "failed") && !isUploading && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(file.id)}
                      >
                        <HugeiconsIcon icon={Delete01Icon} className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        <AlertDialogFooter>
          <div className="flex items-center gap-2 mr-auto">
            {files.length > 0 && !isUploading && (
              <Button variant="outline" size="sm" onClick={clearAll}>
                <HugeiconsIcon icon={Delete01Icon} className="size-4 mr-2" />
                Clear All
              </Button>
            )}
            {failedFiles > 0 && !isUploading && (
              <Button variant="outline" size="sm" onClick={retryFailed}>
                <HugeiconsIcon icon={Refresh01Icon} className="size-4 mr-2" />
                Retry Failed
              </Button>
            )}
          </div>
          <AlertDialogCancel disabled={isUploading}>
            {isUploading ? "Uploading..." : "Close"}
          </AlertDialogCancel>
          {queuedFiles > 0 && (
            <Button onClick={startUpload} disabled={isUploading}>
              {isUploading ? (
                <>
                  <HugeiconsIcon icon={Refresh01Icon} className="size-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Upload01Icon} className="size-4 mr-2" />
                  Start Upload ({queuedFiles} files)
                </>
              )}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
