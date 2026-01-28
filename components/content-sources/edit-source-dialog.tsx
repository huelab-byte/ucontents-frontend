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
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ContentSource } from "./types"

interface EditSourceDialogProps {
  source: ContentSource | null
  onUpdate: (id: string, updates: Partial<Omit<ContentSource, "id" | "createdAt" | "campaigns" | "totalVideos">>) => void
  onClose: () => void
}

export function EditSourceDialog({ source, onUpdate, onClose }: EditSourceDialogProps) {
  const [name, setName] = React.useState("")
  const [aspectRatio, setAspectRatio] = React.useState<"9:16" | "16:9">("9:16")
  const [schedulerEnabled, setSchedulerEnabled] = React.useState(false)

  // Auto-determine orientation based on aspect ratio
  const orientation = aspectRatio === "9:16" ? "vertical" : "landscape"

  React.useEffect(() => {
    if (source) {
      setName(source.name)
      setAspectRatio(source.aspectRatio)
      setSchedulerEnabled(source.schedulerEnabled)
    }
  }, [source])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (source && name.trim()) {
      onUpdate(source.id, {
        name: name.trim(),
        aspectRatio,
        orientation,
        schedulerEnabled,
      })
      onClose()
    }
  }

  const handleCancel = () => {
    if (source) {
      setName(source.name)
      setAspectRatio(source.aspectRatio)
      setSchedulerEnabled(source.schedulerEnabled)
    }
    onClose()
  }

  if (!source) return null

  return (
    <AlertDialog open={!!source} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Content Source</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Source Name</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Enter source name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Aspect Ratio</Label>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={aspectRatio}
                  onValueChange={(value) => setAspectRatio((value || "9:16") as "9:16" | "16:9")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                      <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
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
