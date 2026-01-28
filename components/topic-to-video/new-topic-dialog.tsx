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
import { TopicToVideo } from "./types"

interface NewTopicDialogProps {
  onCreate: (topic: Omit<TopicToVideo, "id" | "createdAt" | "videosGenerated">) => void
}

export function NewTopicDialog({ onCreate }: NewTopicDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [aspectRatio, setAspectRatio] = React.useState<"9:16" | "16:9">("9:16")
  const [status, setStatus] = React.useState<"draft" | "processing" | "completed" | "failed">("draft")

  // Auto-determine orientation based on aspect ratio
  const orientation = aspectRatio === "9:16" ? "vertical" : "landscape"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreate({
        name: name.trim(),
        topic: "",
        aspectRatio,
        orientation,
        status,
      })
      setName("")
      setAspectRatio("9:16")
      setStatus("draft")
      setOpen(false)
    }
  }

  const handleCancel = () => {
    setName("")
    setAspectRatio("9:16")
    setStatus("draft")
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button className="flex items-center gap-2" />}>
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
        New Campaign
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Topic to Video Campaign</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Campaign Name</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Enter campaign name"
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
            <Button type="submit">Create Campaign</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
