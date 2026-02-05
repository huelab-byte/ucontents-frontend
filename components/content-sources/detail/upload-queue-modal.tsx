"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Video01Icon,
  CheckmarkCircle01Icon,
  CancelCircleIcon,
  MoreVerticalCircle01Icon,
  DeleteIcon,
} from "@hugeicons/core-free-icons"
import type { VideoFile } from "./types"

interface UploadQueueModalProps {
  isOpen: boolean
  onClose: () => void
  uploadQueue: VideoFile[]
  processingQueue: VideoFile[]
  completedFiles: VideoFile[]
  onRemoveFromQueue: (fileId: string) => void
  onClearQueue: () => void
  onDeleteCompleted: (fileId: string) => void
}

export function UploadQueueModal({
  isOpen,
  onClose,
  uploadQueue,
  processingQueue,
  completedFiles,
  onRemoveFromQueue,
  onClearQueue,
  onDeleteCompleted,
}: UploadQueueModalProps) {
  const totalQueued = uploadQueue.length
  const totalProcessing = processingQueue.length
  const totalCompleted = completedFiles.length

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="!max-w-[1000px] !w-[1000px] max-h-[95vh] p-0" style={{ maxWidth: '1000px', width: '1000px' }}>
        <AlertDialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <AlertDialogTitle>Upload Queue & Completed Files</AlertDialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </AlertDialogHeader>
        <div className="flex gap-0 max-h-[calc(95vh-140px)]">
          {/* Left Panel - Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Upload Queue Section */}
              {(totalQueued > 0 || totalProcessing > 0) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold">Upload Queue</h3>
                    {totalQueued > 0 && (
                      <Button variant="outline" size="sm" onClick={onClearQueue}>
                        Clear Queue
                      </Button>
                    )}
                  </div>

                  {/* Queued Files */}
                  {totalQueued > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Queued Files ({totalQueued})</h4>
                      <div className="space-y-2">
                        {uploadQueue.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors w-full"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <HugeiconsIcon icon={Video01Icon} className="size-5 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.filename}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                </p>
                                {file.uploadProgress !== undefined && file.uploadProgress > 0 && (
                                  <Progress value={file.uploadProgress} className="h-1 mt-1" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="outline" className="shrink-0">Queued</Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => onRemoveFromQueue(file.id)}
                              >
                                <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
                                <span className="sr-only">Remove from queue</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Processing Files */}
                  {totalProcessing > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Processing ({totalProcessing})</h4>
                      <div className="space-y-2">
                        {processingQueue.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between gap-2 p-3 border border-border rounded-lg bg-muted/30 w-full"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <HugeiconsIcon icon={Video01Icon} className="size-5 text-primary shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.filename}</p>
                                {file.uploadProgress !== undefined && (
                                  <Progress value={file.uploadProgress} className="h-1 mt-1" />
                                )}
                              </div>
                            </div>
                            <Badge variant="default" className="shrink-0">
                              {file.status === "UPLOADING" ? "Uploading" : "Processing"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Completed Files Section */}
              {totalCompleted > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Completed Uploads ({totalCompleted})</h3>
                  <div className="space-y-2">
                    {completedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors w-full"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <HugeiconsIcon
                            icon={CheckmarkCircle01Icon}
                            className="size-5 text-green-600 dark:text-green-400 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.filename}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 shrink-0">
                            Completed
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" />}
                            >
                              <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
                              <span className="sr-only">Options</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => onDeleteCompleted(file.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Sticky Stats */}
          <div className="w-64 border-l border-border bg-muted/30 px-4 py-4 sticky top-0 self-start">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Statistics</h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1 p-4 bg-background rounded-lg border border-border">
                  <div className="text-3xl font-bold">{totalQueued}</div>
                  <div className="text-sm text-muted-foreground">Queued</div>
                </div>
                <div className="flex flex-col gap-1 p-4 bg-background rounded-lg border border-border">
                  <div className="text-3xl font-bold">{totalProcessing}</div>
                  <div className="text-sm text-muted-foreground">Processing</div>
                </div>
                <div className="flex flex-col gap-1 p-4 bg-background rounded-lg border border-border">
                  <div className="text-3xl font-bold">{totalCompleted}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex flex-col gap-1">
                  <div className="text-2xl font-bold">{totalQueued + totalProcessing + totalCompleted}</div>
                  <div className="text-sm text-muted-foreground">Total Files</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AlertDialogFooter className="px-6 pb-6 pt-4 border-t border-border">
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
