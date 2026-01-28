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
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { LibraryForm } from "./library-form"
import type { Library } from "./types"

interface NewLibraryDialogProps {
  onCreate: (library: Omit<Library, "id" | "lastUpdated">) => void
}

export function NewLibraryDialog({ onCreate }: NewLibraryDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && description.trim()) {
      onCreate({
        name: name.trim(),
        description: description.trim(),
        itemCount: 0,
        isStarred: false,
      })
      setName("")
      setDescription("")
      setOpen(false)
    }
  }

  const handleCancel = () => {
    setName("")
    setDescription("")
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button className="flex items-center gap-2" />}>
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
        New Library
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Library</AlertDialogTitle>
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
            <Button type="submit">Create Library</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
