"use client"

import * as React from "react"
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
import { Button } from "@/components/ui/button"
import type { MediaUploadFolder } from "@/lib/api"

interface EditFolderDialogProps {
  folder: MediaUploadFolder | null
  onClose: () => void
  onSubmit: (data: { name: string }) => Promise<void>
}

export function EditFolderDialog({ folder, onClose, onSubmit }: EditFolderDialogProps) {
  const [name, setName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (folder) {
      setName(folder.name)
    }
  }, [folder])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folder || !name.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim() })
      onClose()
    } catch (err) {
      console.error("Update folder failed:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!folder) return null

  return (
    <AlertDialog open={!!folder} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Folder</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-folder-name">Folder name</Label>
            <Input
              id="edit-folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Folder name"
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
