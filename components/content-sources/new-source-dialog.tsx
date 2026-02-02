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
  AlertDialogTrigger,
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
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { ContentSource } from "./types"

interface NewSourceDialogProps {
  onCreate: (source: Omit<ContentSource, "id" | "createdAt" | "campaigns" | "totalVideos">) => void
}

export function NewSourceDialog({ onCreate }: NewSourceDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [aspectRatio, setAspectRatio] = React.useState<"9:16" | "16:9" | "">("9:16")
  const [schedulerEnabled, setSchedulerEnabled] = React.useState(false)

  // Auto-determine orientation based on aspect ratio
  const orientation = aspectRatio === "9:16" ? "vertical" : aspectRatio === "16:9" ? "landscape" : ""

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && aspectRatio) {
      onCreate({
        name: name.trim(),
        aspectRatio: aspectRatio as "9:16" | "16:9",
        orientation: orientation as "vertical" | "landscape",
        schedulerEnabled,
      })
      setName("")
      setAspectRatio("")
      setSchedulerEnabled(false)
      setOpen(false)
    }
  }

  const handleCancel = () => {
    setName("")
    setAspectRatio("")
    setSchedulerEnabled(false)
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button className="flex items-center gap-2" />}>
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
        New Folder
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Media Source</AlertDialogTitle>
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
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select aspect ratio" />
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
            <Button type="submit">Create Source</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
