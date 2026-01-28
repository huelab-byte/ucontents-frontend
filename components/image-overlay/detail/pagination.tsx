"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon, ArrowRight02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  startIndex: number
  endIndex: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 mr-0 sm:mr-[26px] px-[18px]">
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        Showing {(startIndex + 1).toLocaleString()} to {Math.min(endIndex, totalItems).toLocaleString()} of {totalItems.toLocaleString()} image overlays
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(page)}
              className={cn(
                "h-8 min-w-8 px-2 shrink-0 text-xs sm:text-sm",
                currentPage === page && "bg-primary text-primary-foreground"
              )}
            >
              {page.toLocaleString()}
            </Button>
          ))}
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
