"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { FolderIcon, Video01Icon, CalendarIcon } from "@hugeicons/core-free-icons"
import { TopicToVideo } from "./types"
import { NewTopicDialog } from "./new-topic-dialog"

interface TopicToVideoStatsProps {
  topics: TopicToVideo[]
  onCreateTopic: (topic: Omit<TopicToVideo, "id" | "createdAt" | "videosGenerated">) => void
}

export function TopicToVideoStats({ topics, onCreateTopic }: TopicToVideoStatsProps) {
  const totalTopics = topics.length
  const totalVideos = topics.reduce((sum, topic) => sum + (topic.videosGenerated ?? 0), 0)
  const activeSchedulers = topics.filter((topic) => topic.schedulerEnabled).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={FolderIcon} className="size-4" />
            Total Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalTopics}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Video01Icon} className="size-4" />
            Videos Generated
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
            Active Scheduler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{activeSchedulers}</div>
        </CardContent>
      </Card>

      <div className="flex items-end">
        <NewTopicDialog onCreate={onCreateTopic} />
      </div>
    </div>
  )
}
