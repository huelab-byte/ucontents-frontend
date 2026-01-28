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
import { HugeiconsIcon } from "@hugeicons/react"
import { CancelCircleIcon } from "@hugeicons/core-free-icons"

interface VideoPreviewModalProps {
  videoUrl: string | null
  onClose: () => void
}

export function VideoPreviewModal({ videoUrl, onClose }: VideoPreviewModalProps) {
  return (
    <AlertDialog open={!!videoUrl} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-4xl w-full mx-4">
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle>Video Preview</AlertDialogTitle>
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
        <div className="mt-4">
          {videoUrl && (
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
              <video
                src={videoUrl}
                controls
                className="w-full h-full"
                title="Video Preview"
              />
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
