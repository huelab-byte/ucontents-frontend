"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import { FolderIcon, FileIcon, CheckmarkCircle01Icon, Refresh01Icon, UserIcon } from "@hugeicons/core-free-icons"
import type { BgmStats } from "@/lib/api/services/bgm-library.service"

interface StatisticsCardsProps {
  totalFolders: number
  stats: BgmStats | null
}

export function StatisticsCards({ totalFolders, stats }: StatisticsCardsProps) {
  const totalBgm = stats?.total_bgm ?? 0
  const readyBgm = stats?.ready_bgm ?? 0
  const processingBgm = stats?.processing_bgm ?? 0

  const assetsProgress = totalBgm > 0 ? Math.min((totalBgm / 500) * 100, 100) : 0

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
          <div className="text-3xl font-bold">{totalBgm.toLocaleString()}</div>
          <Progress value={assetsProgress} className="h-2" />
        </CardContent>
      </Card>

      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3 pl-[18px] pr-[18px]">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />
            Ready BGM
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-[18px] pr-[18px]">
          <div className="text-3xl font-bold">{readyBgm.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3 pl-[18px] pr-[18px]">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
            Processing BGM
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-[18px] pr-[18px]">
          <div className="text-3xl font-bold">{processingBgm.toLocaleString()}</div>
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
