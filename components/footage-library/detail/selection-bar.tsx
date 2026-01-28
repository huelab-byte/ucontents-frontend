"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete01Icon, Cancel01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"

interface SelectionBarProps {
  selectedCount: number
  onSelectAll: () => void
  onDelete: () => void
  onClear: () => void
}

export function SelectionBar({
  selectedCount,
  onSelectAll,
  onDelete,
  onClear,
}: SelectionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4">
        <span className="text-sm font-medium">
          {selectedCount} selected
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAll}>
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 mr-2" />
            Select All
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <HugeiconsIcon icon={Delete01Icon} className="size-4 mr-2" />
            Delete Selected
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={onClear}>
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
