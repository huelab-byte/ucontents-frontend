"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Video01Icon,
  ClockIcon,
} from "@hugeicons/core-free-icons"

interface DetailStatisticsCardsProps {
  totalClips: number
  lastUpdated?: string | null
}

export function DetailStatisticsCards({
  totalClips,
  lastUpdated,
}: DetailStatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3 pl-[18px] pr-[18px]">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Overlays
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-[18px] pr-[18px]">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Video01Icon} className="size-5 text-muted-foreground" />
            <div className="text-3xl font-bold">{totalClips.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3 pl-[18px] pr-[18px]">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Last Updated
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-[18px] pr-[18px]">
          <div className="flex items-center gap-2 text-sm">
            <HugeiconsIcon icon={ClockIcon} className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">{lastUpdated || "-"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
