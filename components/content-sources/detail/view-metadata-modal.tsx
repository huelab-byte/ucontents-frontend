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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { ContentMetadata } from "./types"

interface ViewMetadataModalProps {
  metadata: ContentMetadata | null
  onClose: () => void
}

export function ViewMetadataModal({ metadata, onClose }: ViewMetadataModalProps) {
  return (
    <AlertDialog open={!!metadata} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="!max-w-3xl w-full mx-4" style={{ maxWidth: '768px' }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Content Details</AlertDialogTitle>
        </AlertDialogHeader>
        
        {metadata && (
          <div className="space-y-4 mt-2">
            {/* YouTube Headline */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">YouTube Headline</Label>
              <p className="text-sm font-medium leading-relaxed">{metadata.youtubeHeadline || "—"}</p>
            </div>

            {/* Post Caption */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Post Caption</Label>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{metadata.postCaption || "—"}</p>
            </div>

            {/* Hashtags */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Hashtags</Label>
              <div className="flex flex-wrap gap-1.5">
                {metadata.hashtags ? (
                  metadata.hashtags.split(/\s+/).filter(Boolean).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </div>

            {/* Video */}
            {metadata.videoUrl && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Video</Label>
                <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                  <video
                    src={metadata.videoUrl}
                    controls
                    className="w-full h-full"
                    title="Video Preview"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
