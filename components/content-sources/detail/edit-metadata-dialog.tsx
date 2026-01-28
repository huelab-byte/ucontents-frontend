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
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const [videoUrl, setVideoUrl] = React.useState(metadata?.videoUrl || "")
  const [status, setStatus] = React.useState<"draft" | "published" | "scheduled">(
    metadata?.status || "draft"
  )

  React.useEffect(() => {
    if (metadata) {
      setYoutubeHeadline(metadata.youtubeHeadline)
      setPostCaption(metadata.postCaption)
      setHashtags(metadata.hashtags)
      setVideoUrl(metadata.videoUrl || "")
      setStatus(metadata.status || "draft")
    }
  }, [metadata])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (metadata && youtubeHeadline.trim() && postCaption.trim()) {
      onUpdate(metadata.id, {
        youtubeHeadline: youtubeHeadline.trim(),
        postCaption: postCaption.trim(),
        hashtags: hashtags.trim(),
        videoUrl: videoUrl.trim() || undefined,
        status,
      })
      onClose()
    }
  }

  const handleCancel = () => {
    if (metadata) {
      setYoutubeHeadline(metadata.youtubeHeadline)
      setPostCaption(metadata.postCaption)
      setHashtags(metadata.hashtags)
      setVideoUrl(metadata.videoUrl || "")
      setStatus(metadata.status || "draft")
    }
    onClose()
  }

  if (!metadata) return null

  return (
    <AlertDialog open={!!metadata} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Content Metadata</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>YouTube Headline</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Enter YouTube headline"
                  value={youtubeHeadline}
                  onChange={(e) => setYoutubeHeadline(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Post Caption</Label>
              </FieldLabel>
              <FieldContent>
                <Textarea
                  placeholder="Enter post caption"
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                  rows={4}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Video URL (Optional)</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  type="url"
                  placeholder="https://example.com/video.mp4"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Status</Label>
              </FieldLabel>
              <FieldContent>
                <Select value={status} onValueChange={(value) => setStatus((value || "draft") as typeof status)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Ready to Publish</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </FieldGroup>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit">Save Changes</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
