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
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; parent_id?: number | null }) => Promise<string | null>
  trigger: React.ReactNode
}

export function CreateFolderDialog({ open, onOpenChange, onSubmit, trigger }: CreateFolderDialogProps) {
  const [name, setName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!name.trim()) return
    setIsSubmitting(true)
    setError(null)
    
    let errorMessage: string | null = null
    try {
      errorMessage = await onSubmit({ name: name.trim() })
    } catch (err: unknown) {
      const error = err as { message?: string }
      errorMessage = error.message || "Failed to create folder"
    }
    
    setIsSubmitting(false)
    
    if (errorMessage) {
      setError(errorMessage)
    } else {
      setName("")
      setError(null)
      onOpenChange(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setName("")
      setError(null)
    }
    onOpenChange(isOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <button
        type="button"
        className={buttonVariants({ variant: "default", size: "sm" })}
        onClick={() => onOpenChange(true)}
      >
        {trigger}
      </button>
      <AlertDialogContent>
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Folder</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="folder-name">Folder name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(null)
              }}
              placeholder="My Videos"
              className={`mt-2 ${error ? 'border-destructive' : ''}`}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
