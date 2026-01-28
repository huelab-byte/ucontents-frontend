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
import { Badge } from "@/components/ui/badge"
import { TopicToVideo, Category } from "./types"
import { cn } from "@/lib/utils"

interface EditTopicDialogProps {
  topic: TopicToVideo | null
  categories: Category[]
  onUpdate: (id: string, updates: Partial<Omit<TopicToVideo, "id" | "createdAt" | "videosGenerated">>) => void
  onClose: () => void
}

export function EditTopicDialog({ topic, categories, onUpdate, onClose }: EditTopicDialogProps) {
  const [name, setName] = React.useState("")
  const [aspectRatio, setAspectRatio] = React.useState<"9:16" | "16:9">("9:16")
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])

  // Auto-determine orientation based on aspect ratio
  const orientation = aspectRatio === "9:16" ? "vertical" : "landscape"

  React.useEffect(() => {
    if (topic) {
      setName(topic.name)
      setAspectRatio(topic.aspectRatio)
      setSelectedCategories(topic.categories || [])
    }
  }, [topic])

  const handleToggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic && name.trim()) {
      onUpdate(topic.id, {
        name: name.trim(),
        topic: topic.topic || "",
        aspectRatio,
        orientation,
        status: topic.status,
        categories: selectedCategories,
      })
      onClose()
    }
  }

  const handleCancel = () => {
    if (topic) {
      setName(topic.name)
      setAspectRatio(topic.aspectRatio)
    }
    onClose()
  }

  if (!topic) return null

  return (
    <AlertDialog open={!!topic} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md w-full mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Topic to Video Campaign</AlertDialogTitle>
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

            {categories.length > 0 && (
              <Field>
                <FieldLabel>
                  <Label>Categories</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="flex flex-wrap gap-2 p-3 border border-border rounded-md min-h-[60px]">
                    {categories.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No categories available</p>
                    ) : (
                      categories.map((category) => {
                        const isSelected = selectedCategories.includes(category.name)
                        return (
                          <label
                            key={category.id}
                            className={cn(
                              "cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors",
                              isSelected
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-background border-border hover:bg-muted"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleCategory(category.name)}
                              className="rounded border-border cursor-pointer"
                            />
                            <Badge
                              variant="secondary"
                              className={cn(
                                "font-medium border-0",
                                category.color || "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              )}
                            >
                              {category.name}
                            </Badge>
                          </label>
                        )
                      })
                    )}
                  </div>
                </FieldContent>
              </Field>
            )}
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
