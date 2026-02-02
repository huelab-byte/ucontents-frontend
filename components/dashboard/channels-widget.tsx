"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link01Icon } from "@hugeicons/core-free-icons"
import { Skeleton } from "@/components/ui/skeleton"
import type { SocialChannel } from "@/lib/api"

interface ChannelsWidgetProps {
  channels: SocialChannel[]
  isLoading?: boolean
}

function channelLabel(ch: SocialChannel): string {
  switch (ch.type) {
    case "facebook_page":
      return "Facebook"
    case "facebook_profile":
      return "Facebook"
    case "instagram_business":
      return "Instagram"
    case "youtube_channel":
      return "YouTube"
    case "tiktok_profile":
      return "TikTok"
    default:
      return ch.provider
  }
}

function avatarFallback(name: string): string {
  return name?.slice(0, 1).toUpperCase() || "C"
}

export function ChannelsWidget({
  channels,
  isLoading = false,
}: ChannelsWidgetProps) {
  const activeChannels = channels.filter((c) => c.is_active)
  const previewChannels = activeChannels.slice(0, 4)

  if (isLoading) {
    return (
      <Card className="mr-0 sm:mr-[26px]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HugeiconsIcon icon={Link01Icon} className="size-4" />
            Connected Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-20 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mr-0 sm:mr-[26px]">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <HugeiconsIcon icon={Link01Icon} className="size-4" />
          Connected Channels
        </CardTitle>
        <span className="text-2xl font-bold">{activeChannels.length}</span>
      </CardHeader>
      <CardContent>
        {previewChannels.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-4">Connect your first channel to start posting.</p>
        ) : (
          <ul className="space-y-3 mb-4">
            {previewChannels.map((ch) => (
              <li key={ch.id} className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={ch.avatar_url ?? undefined} alt={ch.name} />
                  <AvatarFallback>{avatarFallback(ch.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{ch.name}</p>
                  <p className="text-xs text-muted-foreground">{channelLabel(ch)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link 
          href="/connection"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium h-7 gap-1 px-2.5 w-full border border-border bg-background hover:bg-muted hover:text-foreground"
        >
          Connect more
        </Link>
      </CardContent>
    </Card>
  )
}
