"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Queue01Icon,
  ClockIcon,
  CheckmarkCircle01Icon,
  CalendarIcon,
} from "@hugeicons/core-free-icons"
import { Skeleton } from "@/components/ui/skeleton"
import type { BulkPostingCampaign } from "@/lib/api"

interface CampaignStatsWidgetProps {
  campaigns: BulkPostingCampaign[]
  isLoading?: boolean
}

export function CampaignStatsWidget({
  campaigns,
  isLoading = false,
}: CampaignStatsWidgetProps) {
  const total = campaigns.length
  const running = campaigns.filter((c) => c.status === "running").length
  const completed = campaigns.filter((c) => c.status === "completed").length
  const draft = campaigns.filter((c) => c.status === "draft").length

  const stats = [
    { label: "Total Campaigns", value: total, icon: Queue01Icon },
    { label: "Running", value: running, icon: ClockIcon },
    { label: "Completed", value: completed, icon: CheckmarkCircle01Icon },
    { label: "Draft", value: draft, icon: CalendarIcon },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="mr-0 sm:mr-[26px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <HugeiconsIcon icon={s.icon} className="size-4" />
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <Card key={s.label} className="mr-0 sm:mr-[26px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <HugeiconsIcon icon={Icon} className="size-4" />
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
