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

interface VideoPreviewModalProps {
  videoUrl: string | null
  onClose: () => void
}

export function VideoPreviewModal({ videoUrl, onClose }: VideoPreviewModalProps) {
  return (
    <AlertDialog open={!!videoUrl} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-4xl w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Video Preview</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="mt-2">
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
