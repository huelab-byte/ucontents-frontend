"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { Video01Icon, ClockIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { TopicToVideo, GeneratedVideo } from "./types"

interface TopicInfoCardsProps {
  topic: TopicToVideo
  videos?: GeneratedVideo[]
}

export function TopicInfoCards({ topic, videos = [] }: TopicInfoCardsProps) {
  const draftCount = videos.filter((video) => video.status === "draft").length

  const getStatusBadge = () => {
    switch (topic.status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
            Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
            Processing
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400">
            Failed
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="secondary" className="bg-gray-500/10 text-gray-600 dark:text-gray-400">
            Draft
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
      <Card size="sm">
        <CardHeader className="pb-1.5 px-3 pt-3">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Status
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2.5">
          {getStatusBadge()}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="pb-1.5 px-3 pt-3">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Videos Generated
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2.5">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Video01Icon} className="size-3.5 text-muted-foreground" />
            <div className="text-xl font-bold">{topic.videosGenerated.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader className="pb-1.5 px-3 pt-3">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            Total Draft Video
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2.5">
          <div className="flex items-center gap-1.5">
            <HugeiconsIcon icon={Video01Icon} className="size-3.5 text-muted-foreground" />
            <div className="text-xl font-bold">{draftCount.toLocaleString()}</div>
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
              {new Date(topic.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
