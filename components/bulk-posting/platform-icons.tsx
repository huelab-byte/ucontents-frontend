"use client"

import * as React from "react"
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa"
import { cn } from "@/lib/utils"
import type { BulkPostingItem } from "./types"

interface PlatformIconsProps {
  platforms: BulkPostingItem["connectedTo"]
}

export function PlatformIcons({ platforms }: PlatformIconsProps) {
  const platformsConfig = [
    { key: "facebook" as const, label: "Facebook", color: "#1877F2", icon: FaFacebook },
    { key: "instagram" as const, label: "Instagram", color: "#E4405F", icon: FaInstagram },
    { key: "tiktok" as const, label: "TikTok", color: "#000000", icon: FaTiktok },
    { key: "youtube" as const, label: "YouTube", color: "#FF0000", icon: FaYoutube },
  ]

  return (
    <div className="flex items-center gap-2">
      {platformsConfig.map((platform) => {
        const IconComponent = platform.icon
        return (
          <div
            key={platform.key}
            className={cn(
              "size-6 rounded-full flex items-center justify-center transition-opacity",
              platforms[platform.key] ? "opacity-100" : "opacity-30"
            )}
            style={{ backgroundColor: platforms[platform.key] ? platform.color : "#9CA3AF" }}
            title={platform.label}
          >
            <IconComponent className="size-4 text-white" />
          </div>
        )
      })}
    </div>
  )
}
