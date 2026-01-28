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
  onUpdate: (id: string, updates: Partial<Omit<Library, "id" | "lastUpdated">>) => void
  onClose: () => void
}

export function EditLibraryDialog({ library, onUpdate, onClose }: EditLibraryDialogProps) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  React.useEffect(() => {
    if (library) {
      setName(library.name)
      setDescription(library.description)
    }
  }, [library])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (library && name.trim() && description.trim()) {
      onUpdate(library.id, {
        name: name.trim(),
        description: description.trim(),
      })
      onClose()
    }
  }

  const handleCancel = () => {
    if (library) {
      setName(library.name)
      setDescription(library.description)
    }
    onClose()
  }

  if (!library) return null

  return (
    <AlertDialog open={!!library} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Library</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <LibraryForm
            name={name}
            description={description}
            onNameChange={setName}
            onDescriptionChange={setDescription}
          />
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit">Save Changes</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
