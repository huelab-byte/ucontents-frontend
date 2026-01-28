"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  startIndex: number
  endIndex: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  startIndex,
  endIndex,
  onPageChange,
}: PaginationProps) {
  // Generate page numbers to display - optimized for thousands of pages
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 15 // Show up to 15 page numbers before using ellipsis

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 6) {
        // Near the beginning: show 1, 2, 3, 4, 5, 6, 7, 8, ..., last
        for (let i = 2; i <= 8; i++) {
          pages.push(i)
        }
        if (totalPages > 8) {
          pages.push("...")
          pages.push(totalPages)
        }
      } else if (currentPage >= totalPages - 5) {
        // Near the end: show 1, ..., last-7, last-6, last-5, last-4, last-3, last-2, last-1, last
        pages.push("...")
        for (let i = totalPages - 6; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle: show 1, ..., current-3, current-2, current-1, current, current+1, current+2, current+3, ..., last
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

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border mt-4">
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        Showing {(startIndex + 1).toLocaleString()} to {Math.min(endIndex, totalItems).toLocaleString()} of {totalItems.toLocaleString()} users
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
  )
}
