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
import { LibraryForm } from "./library-form"
import type { Library } from "./types"

interface EditLibraryDialogProps {
  library: Library | null
  onUpdate: (id: number, updates: Pick<Library, "name" | "parent_id">) => Promise<boolean> | boolean
  onClose: () => void
}

export function EditLibraryDialog({ library, onUpdate, onClose }: EditLibraryDialogProps) {
  const [name, setName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (library) {
      setName(library.name)
    }
  }, [library])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!library || !name.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      const success = await onUpdate(library.id, { name: name.trim() })
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error("Failed to update folder:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (library) {
      setName(library.name)
    }
    onClose()
  }

  if (!library) return null

  return (
    <AlertDialog open={!!library} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Folder</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <LibraryForm
            name={name}
            onNameChange={setName}
          />
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
