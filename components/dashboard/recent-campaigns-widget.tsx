"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatusBadge, BrandDisplay } from "@/components/bulk-posting"
import { HugeiconsIcon } from "@hugeicons/react"
import { Queue01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Skeleton } from "@/components/ui/skeleton"
import type { BulkPostingCampaign } from "@/lib/api"

interface RecentCampaignsWidgetProps {
  campaigns: BulkPostingCampaign[]
  isLoading?: boolean
}

export function RecentCampaignsWidget({
  campaigns,
  isLoading = false,
}: RecentCampaignsWidgetProps) {
  const statusOrder: Record<string, number> = { running: 0, paused: 1, draft: 2, completed: 3, failed: 4 }
  const sorted = [...campaigns].sort((a, b) => {
    const orderA = statusOrder[a.status] ?? 5
    const orderB = statusOrder[b.status] ?? 5
    if (orderA !== orderB) return orderA - orderB
    const aDate = a.startedDate ? new Date(a.startedDate).getTime() : 0
    const bDate = b.startedDate ? new Date(b.startedDate).getTime() : 0
    return bDate - aDate
  })
  const recent = sorted.slice(0, 5)

  if (isLoading) {
    return (
      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Queue01Icon} className="size-4" />
            Recent Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-2 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mr-0 sm:mr-[26px]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <HugeiconsIcon icon={Queue01Icon} className="size-4" />
          Recent Campaigns
        </CardTitle>
        <Link 
          href="/social-automation/bulk-posting" 
          className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium h-7 gap-1 px-2.5 hover:bg-muted hover:text-foreground"
        >
          View all
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">No campaigns yet. Create your first campaign to get started.</p>
            <Link 
              href="/social-automation/bulk-posting"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium h-7 gap-1 px-2.5 bg-primary text-primary-foreground hover:bg-primary/80"
            >
              Create campaign
            </Link>
          </>
        ) : (
          <ul className="space-y-4">
            {recent.map((campaign) => {
              const total = campaign.totalPost || 1
              const posted = campaign.postedAmount ?? 0
              const progress = total > 0 ? Math.min((posted / total) * 100, 100) : 0
              return (
                <li key={campaign.id}>
                  <Link
                    href={`/social-automation/bulk-posting/${campaign.id}`}
                    className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <BrandDisplay brand={campaign.brand} />
                      <StatusBadge status={campaign.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{posted} / {total} posted</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
