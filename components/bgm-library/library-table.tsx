"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FolderIcon,
  MoreVerticalCircle01Icon,
  ClockIcon,
  EditIcon,
  DeleteIcon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { Library } from "./types"
import { NewLibraryDialog } from "./new-library-dialog"

interface LibraryTableProps {
  libraries: Library[]
  currentPage: number
  itemsPerPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onView: (id: number) => void
  onEdit: (library: Library) => void
  onDelete: (library: Library) => void
  onCreate: (library: Pick<Library, "name" | "parent_id">) => Promise<boolean> | boolean
}

export function LibraryTable({
  libraries,
  currentPage,
  itemsPerPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onCreate,
}: LibraryTableProps) {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLibraries = libraries.slice(startIndex, endIndex)

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

  const formatDate = (value?: string) => {
    if (!value) return "-"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "-"
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  if (libraries.length === 0) {
    return null
  }

  return (
    <Card className="mr-0 sm:mr-[26px] pl-[18px] pr-[18px]">
      <CardHeader className="pl-0 pr-0 flex flex-row items-center justify-between">
        <CardTitle>Folders</CardTitle>
        <NewLibraryDialog onCreate={onCreate} />
      </CardHeader>
      <CardContent className="pl-0 pr-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Folder
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Total BGM</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Last Updated</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3 w-12">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentLibraries.map((library) => {
                return (
                  <tr
                    key={library.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => onView(library.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <HugeiconsIcon
                            icon={FolderIcon}
                            className="size-8 text-muted-foreground"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{library.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {(library.bgm_count ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <HugeiconsIcon icon={ClockIcon} className="size-4" />
                        <span>{formatDate(library.updated_at)}</span>
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
                          <DropdownMenuItem onClick={() => onEdit(library)}>
                            <HugeiconsIcon icon={EditIcon} className="size-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(library)}
                            className="text-destructive focus:text-destructive"
                          >
                            <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border mt-4">
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Showing {(startIndex + 1).toLocaleString()} to {Math.min(endIndex, libraries.length).toLocaleString()} of {libraries.length.toLocaleString()} folders
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
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
                      onClick={() => onPageChange(pageNum)}
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
                onClick={() => onPageChange(currentPage + 1)}
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
  )
}
