"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Queue01Icon, ClockIcon, CheckmarkCircle01Icon, CalendarIcon } from "@hugeicons/core-free-icons"
import type { BulkPostingItem } from "./types"

interface StatisticsCardsProps {
  items: BulkPostingItem[]
}

export function StatisticsCards({ items }: StatisticsCardsProps) {
  const totalCampaigns = items.length
  const runningCampaigns = items.filter((item) => item.status === "running").length
  const completedCampaigns = items.filter((item) => item.status === "completed").length
  const draftCampaigns = items.filter((item) => item.status === "draft").length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Queue01Icon} className="size-4" />
            Total Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalCampaigns}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={ClockIcon} className="size-4" />
            Running Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{runningCampaigns}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />
            Completed Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{completedCampaigns}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={CalendarIcon} className="size-4" />
            Draft Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{draftCampaigns}</div>
        </CardContent>
      </Card>
    </div>
  )
}
