"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import type { ManualPostingItem } from "./types"

interface StatusBadgeProps {
  status: ManualPostingItem["status"]
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    draft: { label: "Draft", variant: "outline" as const, className: "text-muted-foreground" },
    running: { label: "Running", variant: "default" as const, className: "text-primary-foreground" },
    completed: { label: "Completed", variant: "secondary" as const, className: "text-secondary-foreground" },
    paused: { label: "Paused", variant: "outline" as const, className: "text-orange-600 dark:text-orange-400" },
    failed: { label: "Failed", variant: "destructive" as const, className: "text-destructive" },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  )
}
