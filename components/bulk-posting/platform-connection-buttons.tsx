"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa"
import { cn } from "@/lib/utils"
import type { BulkPostingItem } from "./types"

interface PlatformConnectionButtonsProps {
  connectedTo: BulkPostingItem["connectedTo"]
  onPlatformConnection: (platform: keyof BulkPostingItem["connectedTo"]) => void
}

export function PlatformConnectionButtons({
  connectedTo,
  onPlatformConnection,
}: PlatformConnectionButtonsProps) {
  const platforms = [
    {
      key: "facebook" as const,
      label: "Facebook",
      connectedLabel: "Facebook Connected",
      color: "#1877F2",
      hoverColor: "#166FE5",
      icon: FaFacebook,
    },
    {
      key: "instagram" as const,
      label: "Instagram",
      connectedLabel: "Instagram Connected",
      color: "#E4405F",
      hoverColor: "#D32A4A",
      icon: FaInstagram,
    },
    {
      key: "tiktok" as const,
      label: "TikTok",
      connectedLabel: "TikTok Connected",
      color: "#000000",
      hoverColor: "#1A1A1A",
      icon: FaTiktok,
    },
    {
      key: "youtube" as const,
      label: "YouTube",
      connectedLabel: "YouTube Connected",
      color: "#FF0000",
      hoverColor: "#E60000",
      icon: FaYoutube,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {platforms.map((platform) => {
        const IconComponent = platform.icon
        const isConnected = connectedTo[platform.key]

        return (
          <Button
            key={platform.key}
            type="button"
            variant="outline"
            onClick={() => onPlatformConnection(platform.key)}
            style={
              isConnected
                ? { backgroundColor: platform.color, borderColor: platform.color, color: "#FFFFFF" }
                : { borderColor: platform.color }
            }
            onMouseEnter={(e) => {
              if (isConnected) {
                e.currentTarget.style.backgroundColor = platform.hoverColor
                e.currentTarget.style.borderColor = platform.hoverColor
              } else {
                e.currentTarget.style.backgroundColor = `${platform.color}1A`
              }
            }}
            onMouseLeave={(e) => {
              if (isConnected) {
                e.currentTarget.style.backgroundColor = platform.color
                e.currentTarget.style.borderColor = platform.color
              } else {
                e.currentTarget.style.backgroundColor = ""
              }
            }}
            className={cn("w-full justify-start relative h-14 px-4 text-base transition-colors")}
          >
            {isConnected ? (
              <>
                <IconComponent className="size-5 mr-3" />
                <span>{platform.connectedLabel}</span>
              </>
            ) : (
              <>
                <IconComponent className="size-5 mr-3 text-muted-foreground" />
                <span>{platform.label}</span>
              </>
            )}
          </Button>
        )
      })}
    </div>
  )
}
