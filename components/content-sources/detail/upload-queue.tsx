"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Video01Icon,
  CheckmarkCircle01Icon,
  CancelCircleIcon,
  MoreVerticalCircle01Icon,
  DeleteIcon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { VideoFile } from "./types"

interface FolderOption {
  id: number
  name: string
}

interface UploadQueueProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  uploadQueue: VideoFile[]
  processingQueue: VideoFile[]
  completedFiles: VideoFile[]
  onRemoveFromQueue: (fileId: string) => void
  onClearQueue: () => void
  onDeleteCompleted: (fileId: string) => void
  onStartUpload?: () => void
  isUploading?: boolean
  /** For multi-folder upload: list of folders to choose from. When length > 1, show folder dropdown per file. */
  folders?: FolderOption[]
  currentFolderId?: number
  onFolderChange?: (fileId: string, folderId: number) => void
}

export function UploadQueue({
  isOpen,
  onOpenChange,
  uploadQueue,
  processingQueue,
  completedFiles,
  onRemoveFromQueue,
  onClearQueue,
  onDeleteCompleted,
  onStartUpload,
  isUploading = false,
  folders = [],
  currentFolderId,
  onFolderChange,
}: UploadQueueProps) {
  const totalQueued = uploadQueue.length
  const inProgress = processingQueue.filter((f) => f.status !== "FAILED").length
  const totalFailed = processingQueue.filter((f) => f.status === "FAILED").length
  const totalProcessing = inProgress
  const totalCompleted = completedFiles.length

  if (totalQueued === 0 && processingQueue.length === 0 && totalCompleted === 0) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upload Queue</CardTitle>
              <div className="flex items-center gap-2">
                {totalQueued > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={(e) => {
                      e.stopPropagation()
                      onClearQueue()
                    }}
                  >
                    Clear
                  </Button>
                )}
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  className={cn("size-4 transition-transform", isOpen && "rotate-180")}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Queued Files */}
            {totalQueued > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Queued ({totalQueued})</h4>
                  {onStartUpload && (
                    <Button
                      size="sm"
                      onClick={onStartUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        "Start Upload"
                      )}
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  {uploadQueue.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-2 p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <HugeiconsIcon icon={Video01Icon} className="size-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{file.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {folders.length > 1 && onFolderChange && currentFolderId !== undefined && (
                            <Select
                              value={String(file.folderId ?? currentFolderId)}
                              onValueChange={(v) => { if (v != null) onFolderChange(file.id, parseInt(v, 10)); }}
                            >
                              <SelectTrigger className="h-7 text-xs mt-1 w-full max-w-[140px]">
                                <SelectValue placeholder="Folder" />
                              </SelectTrigger>
                              <SelectContent>
                                {folders.map((f) => (
                                  <SelectItem key={f.id} value={String(f.id)} className="text-xs">
                                    {f.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {file.uploadProgress !== undefined && file.uploadProgress > 0 && (
                            <Progress value={file.uploadProgress} className="h-1 mt-1" />
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => onRemoveFromQueue(file.id)}
                      >
                        <HugeiconsIcon icon={CancelCircleIcon} className="size-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Files (in progress only) */}
            {inProgress > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Processing ({inProgress})</h4>
                <div className="space-y-2">
                  {processingQueue
                    .filter((f) => f.status !== "FAILED")
                    .map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/30"
                      >
                        <HugeiconsIcon icon={Video01Icon} className="size-4 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{file.filename}</p>
                          {file.uploadProgress !== undefined && (
                            <Progress value={file.uploadProgress} className="h-1 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Failed Files */}
            {totalFailed > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-destructive">Failed ({totalFailed})</h4>
                <div className="space-y-2">
                  {processingQueue
                    .filter((f) => f.status === "FAILED")
                    .map((file) => (
                      <div
                        key={file.id}
                        className="flex items-start gap-2 p-3 border border-destructive/50 rounded-lg bg-destructive/10"
                      >
                        <HugeiconsIcon icon={CancelCircleIcon} className="size-4 text-destructive shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{file.filename}</p>
                          <p className="text-xs text-destructive mt-1">{file.error ?? "Processing failed"}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Go to <strong>Configuration → AI Settings</strong> to add or update your API key, then remove this item and try again.
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Completed Files */}
            {totalCompleted > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Completed ({totalCompleted})</h4>
                <div className="space-y-2">
                  {completedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-2 p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <HugeiconsIcon
                          icon={CheckmarkCircle01Icon}
                          className="size-4 text-green-600 dark:text-green-400 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{file.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" />}
                        >
                          <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-3" />
                          <span className="sr-only">Options</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onDeleteCompleted(file.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <HugeiconsIcon icon={DeleteIcon} className="size-3 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
