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
  MoreVerticalCircle01Icon,
  EditIcon,
  DeleteIcon,
  CalendarIcon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  PauseIcon,
  PlayIcon,
} from "@hugeicons/core-free-icons"
import { BrandDisplay } from "./brand-display"
import { PlatformIcons } from "./platform-icons"
import { StatusBadge } from "./status-badge"
import { formatDate } from "./utils"
import { cn } from "@/lib/utils"
import type { ManualPostingItem } from "./types"

interface ManualPostingTableProps {
  items: ManualPostingItem[]
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onPause: (id: string) => void
}

export function ManualPostingTable({
  items,
  currentPage,
  itemsPerPage,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onPause,
}: ManualPostingTableProps) {
  const totalPages = Math.ceil(items.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = items.slice(startIndex, endIndex)

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

  if (items.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Posting Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Brand</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Connected To</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Total Content</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Remaining New Content</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Started Date</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3 w-12">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onView(item.id)}>
                    <BrandDisplay brand={item.brand} />
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onView(item.id)}>
                    <PlatformIcons platforms={item.connectedTo} />
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onView(item.id)}>
                    <span className="text-sm font-medium">{item.totalPost}</span>
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onView(item.id)}>
                    <span className="text-sm font-medium">{item.remainingContent}</span>
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onView(item.id)}>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HugeiconsIcon icon={CalendarIcon} className="size-4" />
                      <span>{formatDate(item.startedDate)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onView(item.id)}>
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                        <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
                        <span className="sr-only">Options</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(item.status === "running" || item.status === "paused") && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              onPause(item.id)
                            }}
                          >
                            <HugeiconsIcon
                              icon={item.status === "running" ? PauseIcon : PlayIcon}
                              className="size-4 mr-2"
                            />
                            {item.status === "running" ? "Pause" : "Resume"}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit(item.id)
                          }}
                        >
                          <HugeiconsIcon icon={EditIcon} className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(item.id)
                          }}
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
              Showing {(startIndex + 1).toLocaleString()} to {Math.min(endIndex, items.length).toLocaleString()} of{" "}
              {items.length.toLocaleString()} posts
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
