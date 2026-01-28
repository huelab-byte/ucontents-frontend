"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import { ImageIcon, Upload01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { GeneratedVideo } from "./types"

interface EditVideoDialogProps {
  video: GeneratedVideo | null
  onUpdate: (id: string, updates: Partial<GeneratedVideo>) => void
  onClose: () => void
}

export function EditVideoDialog({ video, onUpdate, onClose }: EditVideoDialogProps) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [hashtags, setHashtags] = React.useState("")
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (video) {
      setTitle(video.title)
      setDescription(video.description)
      setHashtags(video.hashtags)
      setThumbnailPreview(video.thumbnailUrl || null)
      setThumbnailFile(null)
    }
  }, [video])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (video && title.trim()) {
      const updates: Partial<GeneratedVideo> = {
        title: title.trim(),
        description: description.trim(),
        hashtags: hashtags.trim(),
      }
      
      // If a new thumbnail file was selected, create object URL for preview
      // In a real app, you would upload the file to a server here
      if (thumbnailFile) {
        updates.thumbnailUrl = thumbnailPreview || undefined
      } else if (!thumbnailPreview && video.thumbnailUrl) {
        // If thumbnail was removed
        updates.thumbnailUrl = undefined
      }
      
      onUpdate(video.id, updates)
      onClose()
    }
  }

  const handleCancel = () => {
    if (video) {
      setTitle(video.title)
      setDescription(video.description)
      setHashtags(video.hashtags)
      setThumbnailPreview(video.thumbnailUrl || null)
      setThumbnailFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
    onClose()
  }

  if (!video) return null

  return (
    <AlertDialog open={!!video} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Generated Video</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Title</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Video title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Custom Thumbnail</Label>
              </FieldLabel>
              <FieldContent>
                <div className="space-y-3">
                  {thumbnailPreview ? (
                    <div className="relative">
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-border bg-muted/30">
                      <div className="text-center">
                        <HugeiconsIcon icon={ImageIcon} className="size-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">No thumbnail</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <HugeiconsIcon icon={Upload01Icon} className="size-4" />
                      {thumbnailPreview ? "Change Thumbnail" : "Upload Thumbnail"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 16:9 aspect ratio, max 2MB (JPG, PNG)
                  </p>
                </div>
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
