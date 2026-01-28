"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SmartPhone01Icon,
  ComputerIcon,
  Video01Icon,
  ClockIcon,
} from "@hugeicons/core-free-icons"

interface DetailStatisticsCardsProps {
  verticalCount: number
  landscapeCount: number
  totalClips: number
  lastUpdated?: string | null
  showVertical?: boolean
  showLandscape?: boolean
  onVerticalChange?: (checked: boolean) => void
  onLandscapeChange?: (checked: boolean) => void
}

export function DetailStatisticsCards({
  verticalCount,
  landscapeCount,
  totalClips,
  lastUpdated,
  showVertical,
  showLandscape,
  onVerticalChange,
  onLandscapeChange,
}: DetailStatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card 
        className={`mr-0 sm:mr-[26px] cursor-pointer transition-colors ${
          showVertical ? "ring-2 ring-primary" : ""
        }`}
        onClick={() => onVerticalChange?.(!showVertical)}
      >
        <CardHeader className="pb-3 pl-[18px] pr-[18px]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              VERTICAL (9:16)
            </CardTitle>
            {onVerticalChange && (
              <Checkbox
                checked={showVertical}
                onCheckedChange={(checked) => onVerticalChange(checked === true)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="pl-[18px] pr-[18px]">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={SmartPhone01Icon} className="size-5 text-muted-foreground" />
            <div className="text-3xl font-bold">{verticalCount.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className={`mr-0 sm:mr-[26px] cursor-pointer transition-colors ${
          showLandscape ? "ring-2 ring-primary" : ""
        }`}
        onClick={() => onLandscapeChange?.(!showLandscape)}
      >
        <CardHeader className="pb-3 pl-[18px] pr-[18px]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              LANDSCAPE (16:9)
            </CardTitle>
            {onLandscapeChange && (
              <Checkbox
                checked={showLandscape}
                onCheckedChange={(checked) => onLandscapeChange(checked === true)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="pl-[18px] pr-[18px]">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={ComputerIcon} className="size-5 text-muted-foreground" />
            <div className="text-3xl font-bold">{landscapeCount.toLocaleString()}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3 pl-[18px] pr-[18px]">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Clips
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
