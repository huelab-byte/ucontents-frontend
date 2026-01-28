"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons"
import type { TopicToVideo } from "./types"

interface PageHeaderProps {
  topic: TopicToVideo
  onBack: () => void
}

export function PageHeader({ topic, onBack }: PageHeaderProps) {
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
          <span className="sr-only">Back to Topic to Video Campaign</span>
        </Button>
        <div>
          <h1 className="text-xl font-bold">{topic.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {topic.topic}
          </p>
        </div>
      </div>
    </div>
  )
}
