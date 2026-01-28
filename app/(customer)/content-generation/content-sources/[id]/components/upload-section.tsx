"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Upload01Icon, FolderOpenIcon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

interface UploadSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onFileUpload: (files: FileList | null) => void
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  uploadInputId?: string
}

export function UploadSection({
  isOpen,
  onOpenChange,
  onFileUpload,
  onDrop,
  onDragOver,
  uploadInputId = "video-upload-sidebar",
}: UploadSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upload Video Files</CardTitle>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className={cn("size-4 transition-transform", isOpen && "rotate-180")}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30 relative"
              onClick={() => document.getElementById(uploadInputId)?.click()}
            >
              <HugeiconsIcon icon={Upload01Icon} className="size-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs font-medium mb-1">Drag & drop video files here</p>
              <p className="text-xs text-muted-foreground mb-3">or click to browse</p>
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => onFileUpload(e.target.files)}
                className="hidden"
                id={uploadInputId}
              />
              <label htmlFor={uploadInputId} className="inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer text-xs"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    document.getElementById(uploadInputId)?.click()
                  }}
                >
                  <HugeiconsIcon icon={FolderOpenIcon} className="size-3 mr-1.5" />
                  Select Videos
                </Button>
              </label>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
