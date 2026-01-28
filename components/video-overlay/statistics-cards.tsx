"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import { FolderIcon, FileIcon, CheckmarkCircle01Icon, Refresh01Icon, UserIcon } from "@hugeicons/core-free-icons"
import type { VideoOverlayStats } from "@/lib/api/services/video-overlay.service"

interface StatisticsCardsProps {
  totalFolders: number
  stats: VideoOverlayStats | null
}

export function StatisticsCards({ totalFolders, stats }: StatisticsCardsProps) {
  const totalVideoOverlays = stats?.total_video_overlay ?? 0
  const readyVideoOverlays = stats?.ready_video_overlay ?? 0
  const processingVideoOverlays = stats?.processing_video_overlay ?? 0

  const assetsProgress = totalVideoOverlays > 0 ? Math.min((totalVideoOverlays / 500) * 100, 100) : 0

  const totalUsers = stats?.total_users_with_uploads ?? 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3 pl-[18px] pr-[18px]">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={FolderIcon} className="size-4" />
            Total Folders
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-[18px] pr-[18px]">
          <div className="text-3xl font-bold">{totalFolders}</div>
        </CardContent>
      </Card>

      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3 pl-[18px] pr-[18px]">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
            <HugeiconsIcon icon={FileIcon} className="size-4" />
            Total Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pl-[18px] pr-[18px]">
          <div className="text-3xl font-bold">{totalVideoOverlays.toLocaleString()}</div>
          <Progress value={assetsProgress} className="h-2" />
        </CardContent>
      </Card>

      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3 pl-[18px] pr-[18px]">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />
            Ready Overlays
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-[18px] pr-[18px]">
          <div className="text-3xl font-bold">{readyVideoOverlays.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3 pl-[18px] pr-[18px]">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
            Processing Overlays
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-[18px] pr-[18px]">
          <div className="text-3xl font-bold">{processingVideoOverlays.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3 pl-[18px] pr-[18px]">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={UserIcon} className="size-4" />
            Active Users
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-[18px] pr-[18px]">
          <div className="text-3xl font-bold">{totalUsers.toLocaleString()}</div>
        </CardContent>
      </Card>
    </div>
  )
}
