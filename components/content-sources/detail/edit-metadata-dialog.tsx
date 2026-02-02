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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ContentMetadata } from "./types"

interface EditMetadataDialogProps {
  metadata: ContentMetadata | null
  onUpdate: (id: string, updates: Partial<ContentMetadata>) => void
  onClose: () => void
}

export function EditMetadataDialog({
  metadata,
  onUpdate,
  onClose,
}: EditMetadataDialogProps) {
  const [youtubeHeadline, setYoutubeHeadline] = React.useState(metadata?.youtubeHeadline || "")
  const [postCaption, setPostCaption] = React.useState(metadata?.postCaption || "")
  const [hashtags, setHashtags] = React.useState(metadata?.hashtags || "")

  React.useEffect(() => {
    if (metadata) {
      setYoutubeHeadline(metadata.youtubeHeadline)
      setPostCaption(metadata.postCaption)
      setHashtags(metadata.hashtags)
    }
  }, [metadata])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (metadata) {
      onUpdate(metadata.id, {
        youtubeHeadline: youtubeHeadline.trim(),
        postCaption: postCaption.trim(),
        hashtags: hashtags.trim(),
      })
      onClose()
    }
  }

  const handleCancel = () => {
    if (metadata) {
      setYoutubeHeadline(metadata.youtubeHeadline)
      setPostCaption(metadata.postCaption)
      setHashtags(metadata.hashtags)
    }
    onClose()
  }

  if (!metadata) return null

  return (
    <AlertDialog open={!!metadata} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent className="!max-w-3xl w-full mx-4" style={{ maxWidth: '768px' }}>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Content</AlertDialogTitle>
        </AlertDialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mt-2">
            {/* YouTube Headline */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">YouTube Headline</Label>
              <Input
                placeholder="Enter YouTube headline"
                value={youtubeHeadline}
                onChange={(e) => setYoutubeHeadline(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Post Caption */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Post Caption</Label>
              <Textarea
                placeholder="Enter post caption"
                value={postCaption}
                onChange={(e) => setPostCaption(e.target.value)}
                rows={5}
                className="text-sm resize-none"
              />
            </div>

            {/* Hashtags */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Hashtags</Label>
              <Input
                placeholder="#hashtag1 #hashtag2 #hashtag3"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">Separate hashtags with spaces</p>
            </div>

            {/* Video Preview (read-only) */}
            {metadata.videoUrl && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Video Preview</Label>
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

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit">Save Changes</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
