"use client"

import * as React from "react"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  Edit01Icon,
  Delete01Icon,
  MoreVerticalCircle01Icon,
  TagIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface PromptTemplate {
  id: string
  name: string
  description: string
  prompt: string
  tags: string[]
  createdAt: string
}

interface Tag {
  id: string
  name: string
  color: string
}

const tagColors = [
  "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "bg-green-500/10 text-green-600 border-green-500/20",
  "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "bg-pink-500/10 text-pink-600 border-pink-500/20",
  "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
]

export default function PromptTemplatesPage() {
  const [templates, setTemplates] = React.useState<PromptTemplate[]>([
    {
      id: "1",
      name: "Blog Post Introduction",
      description: "Generate engaging blog post introductions",
      prompt: "Write an engaging introduction for a blog post about {topic} that captures the reader's attention and provides context.",
      tags: ["blog", "writing"],
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Social Media Caption",
      description: "Create catchy social media captions",
      prompt: "Create a {platform} caption for {content_type} that is {tone} and includes relevant hashtags.",
      tags: ["social-media", "marketing"],
      createdAt: "2024-01-20",
    },
    {
      id: "3",
      name: "Product Description",
      description: "Write compelling product descriptions",
      prompt: "Write a compelling product description for {product_name} highlighting its key features and benefits.",
      tags: ["ecommerce", "marketing"],
      createdAt: "2024-01-25",
    },
  ])

  const [tags, setTags] = React.useState<Tag[]>([
    { id: "1", name: "blog", color: tagColors[0] },
    { id: "2", name: "writing", color: tagColors[1] },
    { id: "3", name: "social-media", color: tagColors[2] },
    { id: "4", name: "marketing", color: tagColors[3] },
    { id: "5", name: "ecommerce", color: tagColors[4] },
  ])

  const [selectedTemplates, setSelectedTemplates] = React.useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = React.useState(1)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isTagDialogOpen, setIsTagDialogOpen] = React.useState(false)
  const [editingTemplate, setEditingTemplate] = React.useState<PromptTemplate | null>(null)
  const [newTagName, setNewTagName] = React.useState("")
  const [tagError, setTagError] = React.useState("")

  const itemsPerPage = 10

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    prompt: "",
    selectedTags: [] as string[],
  })

  const filteredTemplates = React.useMemo(() => {
    return templates
  }, [templates])

  const paginatedTemplates = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredTemplates.slice(start, end)
  }, [filteredTemplates, currentPage])

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage)

  const stats = React.useMemo(() => {
    return {
      total: templates.length,
      tags: tags.length,
    }
  }, [templates, tags])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTemplates(new Set(paginatedTemplates.map((t) => t.id)))
    } else {
      setSelectedTemplates(new Set())
    }
  }

  const handleSelectTemplate = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedTemplates)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedTemplates(newSelected)
  }

  const handleDelete = (ids: string[]) => {
    setTemplates((prev) => prev.filter((t) => !ids.includes(t.id)))
    setSelectedTemplates(new Set())
    setIsDeleteDialogOpen(false)
  }

  const handleEdit = (template: PromptTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description,
      prompt: template.prompt,
      selectedTags: template.tags,
    })
    setIsSheetOpen(true)
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setFormData({
      name: "",
      description: "",
      prompt: "",
      selectedTags: [],
    })
    setIsSheetOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.prompt) return

    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? {
                ...t,
                name: formData.name,
                description: formData.description,
                prompt: formData.prompt,
                tags: formData.selectedTags,
              }
            : t
        )
      )
    } else {
      const newTemplate: PromptTemplate = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        prompt: formData.prompt,
        tags: formData.selectedTags,
        createdAt: new Date().toISOString().split("T")[0],
      }
      setTemplates((prev) => [...prev, newTemplate])
    }

    setIsSheetOpen(false)
    setFormData({
      name: "",
      description: "",
      prompt: "",
      selectedTags: [],
    })
  }

  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      setTagError("")
      return
    }

    const tagName = newTagName.trim().toLowerCase()
    if (tags.some((t) => t.name === tagName)) {
      setTagError("Tag already exists")
      return
    }

    const newTag: Tag = {
      id: Date.now().toString(),
      name: tagName,
      color: tagColors[tags.length % tagColors.length],
    }
    setTags((prev) => [...prev, newTag])
    setNewTagName("")
    setTagError("")
  }

  const toggleTag = (tagName: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagName)
        ? prev.selectedTags.filter((t) => t !== tagName)
        : [...prev.selectedTags, tagName],
    }))
  }

  const getTagColor = (tagName: string) => {
    const tag = tags.find((t) => t.name === tagName)
    return tag?.color || tagColors[0]
  }

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Prompt Templates</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage AI prompt templates for consistent, high-quality content generation across workflows
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <Button variant="outline" onClick={() => setIsTagDialogOpen(true)}>
              <HugeiconsIcon icon={TagIcon} strokeWidth={2} className="size-4" />
              Manage Tags
            </Button>
            {selectedTemplates.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-4" />
                Delete ({selectedTemplates.size})
              </Button>
            )}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button onClick={handleCreate}>
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
                  Create Template
                </Button>
              </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto flex flex-col">
                <SheetHeader className="flex-shrink-0 px-4 sm:px-6">
                  <SheetTitle className="text-lg sm:text-xl">{editingTemplate ? "Edit Template" : "Create Template"}</SheetTitle>
                  <SheetDescription className="text-sm">
                    {editingTemplate
                      ? "Update your prompt template details"
                      : "Create a new prompt template for your workflows"}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 sm:mt-6 space-y-4 flex-1 overflow-y-auto min-h-0 px-4 sm:px-6">
                  <Field>
                    <FieldLabel className="text-sm">Name *</FieldLabel>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Template name"
                      className="w-full"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-sm">Description</FieldLabel>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description"
                      className="w-full"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-sm">Prompt *</FieldLabel>
                    <Textarea
                      value={formData.prompt}
                      onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                      placeholder="Enter your prompt template. Use {variable} for dynamic values."
                      className="min-h-32 w-full resize-y"
                    />
                  </Field>
                  <Field>
                    <FieldLabel className="text-sm">Tags</FieldLabel>
                    <div className="flex flex-wrap gap-2 min-w-0">
                      {tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={formData.selectedTags.includes(tag.name) ? "default" : "outline"}
                          className={cn(
                            "cursor-pointer text-xs sm:text-xs",
                            formData.selectedTags.includes(tag.name) && tag.color
                          )}
                          onClick={() => toggleTag(tag.name)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </Field>
                </div>
                <SheetFooter className="flex-shrink-0 flex-col sm:flex-row gap-2 sm:gap-2 mt-4 sm:mt-6 pt-4 border-t px-4 sm:px-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSheetOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={!formData.name || !formData.prompt}
                    className="w-full sm:w-auto"
                  >
                    {editingTemplate ? "Update" : "Create"}
                  </Button>
                </SheetFooter>
            </SheetContent>
          </Sheet>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tags}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="w-12 p-4 text-left">
                      <input
                        type="checkbox"
                        checked={
                          paginatedTemplates.length > 0 &&
                          paginatedTemplates.every((t) => selectedTemplates.has(t.id))
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="p-4 text-left text-sm font-medium">Name</th>
                    <th className="p-4 text-left text-sm font-medium">Description</th>
                    <th className="p-4 text-left text-sm font-medium">Prompt</th>
                    <th className="p-4 text-left text-sm font-medium">Tags</th>
                    <th className="p-4 text-left text-sm font-medium">Created</th>
                    <th className="w-12 p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTemplates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No templates yet. Create your first template!
                      </td>
                    </tr>
                  ) : (
                    paginatedTemplates.map((template) => (
                      <tr key={template.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedTemplates.has(template.id)}
                            onChange={(e) => handleSelectTemplate(template.id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{template.name}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-muted-foreground max-w-md truncate">
                            {template.description || "—"}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-muted-foreground max-w-lg truncate" title={template.prompt}>
                            {template.prompt || "—"}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {template.tags.length > 0 ? (
                              template.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className={cn("text-xs", getTagColor(tag))}
                                >
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-muted-foreground">
                            {new Date(template.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                            >
                              <HugeiconsIcon icon={MoreVerticalCircle01Icon} strokeWidth={2} className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(template)}>
                                <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} className="size-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDelete([template.id])}
                              >
                                <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredTemplates.length)} of{" "}
              {filteredTemplates.length} templates
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-8"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Templates</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedTemplates.size} template(s)? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(Array.from(selectedTemplates))}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Tag Management Dialog */}
        <AlertDialog 
          open={isTagDialogOpen} 
          onOpenChange={(open) => {
            setIsTagDialogOpen(open)
            if (!open) {
              setNewTagName("")
              setTagError("")
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Manage Tags</AlertDialogTitle>
              <AlertDialogDescription>
                Create and manage tags for categorizing your prompt templates
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="New tag name"
                    value={newTagName}
                    onChange={(e) => {
                      setNewTagName(e.target.value)
                      setTagError("")
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateTag()
                      }
                    }}
                    className={tagError ? "border-destructive" : ""}
                  />
                  <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
                  </Button>
                </div>
                {tagError && (
                  <p className="text-sm text-destructive">{tagError}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className={cn("text-xs", tag.color)}>
                    {tag.name}
                    <button
                      onClick={() => {
                        setTags((prev) => prev.filter((t) => t.id !== tag.id))
                        setTemplates((prev) =>
                          prev.map((t) => ({
                            ...t,
                            tags: t.tags.filter((tagName) => tagName !== tag.name),
                          }))
                        )
                      }}
                      className="ml-1.5 hover:opacity-70"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CustomerDashboardLayout>
  )
}
