"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, Link01Icon, Queue01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"

interface WelcomeWidgetProps {
  userName?: string | null
  hasChannels?: boolean
  hasCampaigns?: boolean
  isLoading?: boolean
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export function WelcomeWidget({
  userName,
  hasChannels = false,
  hasCampaigns = false,
  isLoading = false,
}: WelcomeWidgetProps) {
  const checklistItems = [
    {
      done: hasChannels,
      label: "Connect a social channel",
      href: "/connection",
      icon: Link01Icon,
    },
    {
      done: hasCampaigns,
      label: "Create your first campaign",
      href: "/social-automation/bulk-posting",
      icon: Queue01Icon,
    },
  ]
  const allDone = checklistItems.every((item) => item.done)

  if (isLoading) {
    return (
      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mr-0 sm:mr-[26px]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <HugeiconsIcon icon={UserIcon} className="size-4" />
          {getGreeting()}, {userName || "there"}!
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allDone ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-primary" />
            <span>You're all set. Head to your campaigns to get started.</span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">Get started:</p>
            <ul className="space-y-2">
              {checklistItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.label}>
                    <Link href={item.href}>
                      <Button variant="ghost" size="sm" className="h-auto py-2 px-3 -mx-2 justify-start gap-2 w-full">
                        {item.done ? (
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-primary shrink-0" />
                        ) : (
                          <span className="size-4 rounded-full border-2 border-muted-foreground shrink-0" />
                        )}
                        <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.label}</span>
                        <HugeiconsIcon icon={Icon} className="size-3.5 ml-auto text-muted-foreground" />
                      </Button>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
