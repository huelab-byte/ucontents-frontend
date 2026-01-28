"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons"
import type { ContentSource } from "./types"

interface PageHeaderProps {
  source: ContentSource
  onBack: () => void
}

export function PageHeader({ source, onBack }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-7 w-7"
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} className="size-3.5" />
          <span className="sr-only">Back to Content Sources</span>
        </Button>
        <div>
          <h1 className="text-xl font-bold">{source.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload and manage video files for this content source
          </p>
        </div>
      </div>
    </div>
  )
}
