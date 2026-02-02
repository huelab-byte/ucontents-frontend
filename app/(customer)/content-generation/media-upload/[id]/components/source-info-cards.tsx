"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { Video01Icon, ClockIcon } from "@hugeicons/core-free-icons"
import type { ContentSource } from "./types"

interface SourceInfoCardsProps {
  source: ContentSource
}

export function SourceInfoCards({ source }: SourceInfoCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <Card size="sm">
        <CardHeader className="pb-1.5 px-3 pt-3">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Format
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2.5">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-xs py-0.5">
              {source.aspectRatio}
            </Badge>
            <Badge variant="secondary" className="text-xs py-0.5">
              {source.orientation.charAt(0).toUpperCase() + source.orientation.slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="pb-1.5 px-3 pt-3">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Videos
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2.5">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Video01Icon} className="size-3.5 text-muted-foreground" />
            <div className="text-xl font-bold">{source.totalVideos.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="pb-1.5 px-3 pt-3">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Created
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2.5">
          <div className="flex items-center gap-1.5 text-xs">
            <HugeiconsIcon icon={ClockIcon} className="size-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {new Date(source.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
