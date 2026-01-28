"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"

interface VideoPreviewModalProps {
  videoUrl: string | null
  videoTitle?: string
  onClose: () => void
}

export function VideoPreviewModal({ videoUrl, videoTitle, onClose }: VideoPreviewModalProps) {
  if (!videoUrl) return null

  return (
    <AlertDialog open={!!videoUrl} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-5xl w-full mx-4 p-0">
        <AlertDialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="text-lg">
              {videoTitle || "Video Preview"}
            </AlertDialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </AlertDialogHeader>
        <div className="px-6 pb-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            <video
              src={videoUrl}
              controls
              className="w-full h-full"
              autoPlay
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
