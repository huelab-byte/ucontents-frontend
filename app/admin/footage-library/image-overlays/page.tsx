"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FolderIcon,
  PlusSignIcon,
  MoreVerticalCircle01Icon,
  ClockIcon,
  EditIcon,
  DeleteIcon,
  StarIcon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ImageIcon,
  CalculatorIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface Library {
  id: string
  name: string
  description: string
  itemCount: number
  lastUpdated: string
  isStarred?: boolean
}

const demoLibraries: Library[] = [
  {
    id: "particles",
    name: "Particles",
    description: "Static dust, light specks, or abstract particle textures",
    itemCount: 134,
    lastUpdated: "2 days ago",
    isStarred: true,
  },
  {
    id: "vignette",
    name: "Vignette",
    description: "Soft edge shading to enhance focus and contrast",
    itemCount: 87,
    lastUpdated: "5 days ago",
    isStarred: false,
  },
]

function NewLibraryDialog({ onCreate }: { onCreate: (library: Omit<Library, "id" | "lastUpdated">) => void }) {
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
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Library Name</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Library Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Description</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit">Create Library</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function EditLibraryDialog({
  library,
  onUpdate,
  onClose,
}: {
  library: Library | null
  onUpdate: (id: string, updates: Partial<Omit<Library, "id" | "lastUpdated">>) => void
  onClose: () => void
}) {
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
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel>
                <Label>Library Name</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Library Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel>
                <Label>Description</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </FieldContent>
            </Field>
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

export default function ImageOverlaysLibraryPage() {
  const router = useRouter()
  const [libraries, setLibraries] = React.useState<Library[]>(demoLibraries)
  const [editingLibrary, setEditingLibrary] = React.useState<Library | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  const totalItems = libraries.reduce((sum, library) => sum + library.itemCount, 0)
  const totalPages = Math.ceil(libraries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLibraries = libraries.slice(startIndex, endIndex)

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleCreateLibrary = (library: Omit<Library, "id" | "lastUpdated">) => {
    const newLibrary: Library = {
      ...library,
      id: Date.now().toString(),
      lastUpdated: "Just now",
    }
    setLibraries([newLibrary, ...libraries])
  }

  const handleUpdateLibrary = (id: string, updates: Partial<Omit<Library, "id" | "lastUpdated">>) => {
    setLibraries(
      libraries.map((library) => {
        if (library.id === id) {
          return { ...library, ...updates, lastUpdated: "Just now" }
        }
        return library
      })
    )
    setEditingLibrary(null)
  }

  const handleDeleteLibrary = (id: string) => {
    setLibraries(libraries.filter((library) => library.id !== id))
  }

  const handleToggleStar = (id: string) => {
    setLibraries(libraries.map((library) => (library.id === id ? { ...library, isStarred: !library.isStarred } : library)))
  }

  const handleEditLibrary = (library: Library) => {
    setEditingLibrary(library)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 15

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (currentPage <= 6) {
        for (let i = 2; i <= 8; i++) {
          pages.push(i)
        }
        if (totalPages > 8) {
          pages.push("...")
          pages.push(totalPages)
        }
      } else if (currentPage >= totalPages - 5) {
        pages.push("...")
        for (let i = totalPages - 6; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push("...")
        for (let i = currentPage - 3; i <= currentPage + 3; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }
    return pages
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Image Overlays Library</h1>
          <p className="text-muted-foreground mt-2">
            Static overlay assets used for video, and non-moving visuals to add depth and focus.
          </p>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <HugeiconsIcon icon={FolderIcon} className="size-4" />
                Total Libraries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{libraries.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
                <HugeiconsIcon icon={ImageIcon} className="size-4" />
                Total Overlays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalItems.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <HugeiconsIcon icon={CalculatorIcon} className="size-4" />
                Average per Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {libraries.length > 0 ? Math.round(totalItems / libraries.length) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Libraries Table */}
        {libraries.length > 0 ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Libraries</CardTitle>
              <NewLibraryDialog onCreate={handleCreateLibrary} />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                        Library
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                        Description
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                        Overlay Count
                      </th>
                      <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                        Last Updated
                      </th>
                      <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3 w-12">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLibraries.map((library) => (
                      <tr
                        key={library.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/footage-library/image-overlays/${library.id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <HugeiconsIcon
                                icon={FolderIcon}
                                className={cn(
                                  "size-8",
                                  library.isStarred ? "text-primary" : "text-muted-foreground"
                                )}
                              />
                              {library.isStarred && (
                                <div className="absolute -top-1 -left-1 bg-background rounded-full p-0.5">
                                  <HugeiconsIcon
                                    icon={StarIcon}
                                    className="size-3 text-primary fill-primary"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{library.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-muted-foreground max-w-md truncate">
                            {library.description}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {library.itemCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <HugeiconsIcon icon={ClockIcon} className="size-4" />
                            <span>{library.lastUpdated}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                              <HugeiconsIcon
                                icon={MoreVerticalCircle01Icon}
                                className="size-4"
                              />
                              <span className="sr-only">Options</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleToggleStar(library.id)}>
                                <HugeiconsIcon icon={StarIcon} className="size-4 mr-2" />
                                {library.isStarred ? "Remove Star" : "Star Library"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditLibrary(library)}>
                                <HugeiconsIcon icon={EditIcon} className="size-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteLibrary(library.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border mt-4">
                  <div className="text-sm text-muted-foreground whitespace-nowrap">
                    Showing {(startIndex + 1).toLocaleString()} to {Math.min(endIndex, libraries.length).toLocaleString()} of {libraries.length.toLocaleString()} libraries
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 shrink-0"
                    >
                      <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
                      <span className="sr-only">Previous page</span>
                    </Button>
                    <div className="flex items-center gap-1 flex-wrap justify-center max-w-full">
                      {getPageNumbers().map((page, index) => {
                        if (page === "...") {
                          return (
                            <span key={`ellipsis-${index}`} className="px-1 sm:px-2 text-muted-foreground shrink-0">
                              ...
                            </span>
                          )
                        }
                        const pageNum = page as number
                        return (
                          <Button
                            key={page}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="icon"
                            onClick={() => handlePageChange(pageNum)}
                            className={cn(
                              "h-8 min-w-8 px-2 shrink-0 text-xs sm:text-sm",
                              currentPage === pageNum && "bg-primary text-primary-foreground"
                            )}
                          >
                            {pageNum.toLocaleString()}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 shrink-0"
                    >
                      <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
                      <span className="sr-only">Next page</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <CardContent className="pt-6">
              <HugeiconsIcon
                icon={FolderIcon}
                className="size-12 mx-auto text-muted-foreground mb-4"
              />
              <CardTitle className="mb-2">No libraries yet</CardTitle>
              <p className="text-muted-foreground mb-4">
                Create your first library to organize your image overlays.
              </p>
              <NewLibraryDialog onCreate={handleCreateLibrary} />
            </CardContent>
          </Card>
        )}

        {/* Edit Library Dialog */}
        <EditLibraryDialog
          library={editingLibrary}
          onUpdate={handleUpdateLibrary}
          onClose={() => setEditingLibrary(null)}
        />
      </div>
    </AdminDashboardLayout>
  )
}
