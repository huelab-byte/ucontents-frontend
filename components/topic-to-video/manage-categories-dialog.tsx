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
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, DeleteIcon, EditIcon } from "@hugeicons/core-free-icons"
import { Category } from "./types"
import { cn } from "@/lib/utils"

interface ManageCategoriesDialogProps {
  open: boolean
  categories: Category[]
  onClose: () => void
  onSave: (categories: Category[]) => void
}

const defaultColors = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-green-500/10 text-green-600 dark:text-green-400",
  "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
]

export function ManageCategoriesDialog({
  open,
  categories,
  onClose,
  onSave,
}: ManageCategoriesDialogProps) {
  const [localCategories, setLocalCategories] = React.useState<Category[]>(categories)
  const [newCategoryName, setNewCategoryName] = React.useState("")
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editingName, setEditingName] = React.useState("")

  React.useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return

    const newCategory: Category = {
      id: `category-${Date.now()}`,
      name: newCategoryName.trim(),
      color: defaultColors[localCategories.length % defaultColors.length],
    }

    setLocalCategories([...localCategories, newCategory])
    setNewCategoryName("")
  }

  const handleDeleteCategory = (id: string) => {
    setLocalCategories(localCategories.filter((cat) => cat.id !== id))
  }

  const handleStartEdit = (category: Category) => {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  const handleSaveEdit = () => {
    if (!editingId || !editingName.trim()) return

    setLocalCategories(
      localCategories.map((cat) =>
        cat.id === editingId ? { ...cat, name: editingName.trim() } : cat
      )
    )
    setEditingId(null)
    setEditingName("")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  const handleSave = () => {
    onSave(localCategories)
    onClose()
  }

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Manage Categories</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Add New Category */}
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Add New Category</Label>
              </FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddCategory()
                      }
                    }}
                  />
                  <Button onClick={handleAddCategory} type="button">
                    <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                    Add
                  </Button>
                </div>
              </FieldContent>
            </Field>
          </FieldGroup>

          {/* Categories List */}
          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="border border-border rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
              {localCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No categories yet. Add one above to get started.
                </p>
              ) : (
                localCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    {editingId === category.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit()
                            } else if (e.key === "Escape") {
                              handleCancelEdit()
                            }
                          }}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSaveEdit}
                          type="button"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          type="button"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "font-medium",
                            category.color || defaultColors[0]
                          )}
                        >
                          {category.name}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(category)}
                            className="h-7 w-7 p-0"
                            type="button"
                          >
                            <HugeiconsIcon icon={EditIcon} className="size-3" />
                            <span className="sr-only">Edit category</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            type="button"
                          >
                            <HugeiconsIcon icon={DeleteIcon} className="size-3" />
                            <span className="sr-only">Delete category</span>
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <Button onClick={handleSave}>Save Changes</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
