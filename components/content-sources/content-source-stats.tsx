"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { FolderIcon, Video01Icon, CalendarIcon } from "@hugeicons/core-free-icons"
import { ContentSource } from "./types"
import { NewSourceDialog } from "./new-source-dialog"

interface ContentSourceStatsProps {
  sources: ContentSource[]
  onCreateSource: (source: Omit<ContentSource, "id" | "createdAt" | "campaigns" | "totalVideos">) => void
}

export function ContentSourceStats({ sources, onCreateSource }: ContentSourceStatsProps) {
  const totalSources = sources.length
  const totalVideos = sources.reduce((sum, source) => sum + (source.totalVideos ?? 0), 0)
  const activeSchedulers = sources.filter((source) => source.schedulerEnabled).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={FolderIcon} className="size-4" />
            Total Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalSources}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Video01Icon} className="size-4" />
            Total Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalVideos.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={CalendarIcon} className="size-4" />
            Active Schedulers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{activeSchedulers}</div>
        </CardContent>
      </Card>

      <div className="flex items-end">
        <NewSourceDialog onCreate={onCreateSource} />
      </div>
    </div>
  )
}
