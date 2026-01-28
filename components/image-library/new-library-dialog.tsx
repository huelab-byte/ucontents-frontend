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
  onCreate: (library: Pick<Library, "name" | "parent_id">) => Promise<boolean> | boolean
}

export function NewLibraryDialog({ onCreate }: NewLibraryDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      const success = await onCreate({ name: name.trim() })
      if (success) {
        setName("")
        setOpen(false)
      }
    } catch (error) {
      console.error("Failed to create folder:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setName("")
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
          <AlertDialogTitle>Create New Folder</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <LibraryForm
            name={name}
            onNameChange={setName}
          />
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Folder"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
