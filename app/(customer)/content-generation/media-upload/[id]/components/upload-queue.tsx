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

interface UploadQueueProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  uploadQueue: VideoFile[]
  processingQueue: VideoFile[]
  completedFiles: VideoFile[]
  onRemoveFromQueue: (fileId: string) => void
  onClearQueue: () => void
  onDeleteCompleted: (fileId: string) => void
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
}: UploadQueueProps) {
  const totalQueued = uploadQueue.length
  const totalProcessing = processingQueue.length
  const totalCompleted = completedFiles.length

  if (totalQueued === 0 && totalProcessing === 0 && totalCompleted === 0) {
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
                <h4 className="text-sm font-medium">Queued ({totalQueued})</h4>
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

            {/* Processing Files */}
            {totalProcessing > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Processing ({totalProcessing})</h4>
                <div className="space-y-2">
                  {processingQueue.map((file) => (
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
