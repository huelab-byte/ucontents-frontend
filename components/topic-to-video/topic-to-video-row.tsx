"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalCircle01Icon,
  EditIcon,
  DeleteIcon,
  ClockIcon,
  Video01Icon,
  CalendarIcon,
} from "@hugeicons/core-free-icons"
import { TopicToVideo } from "./types"
import { formatDate } from "./utils"
import { cn } from "@/lib/utils"

interface TopicToVideoRowProps {
  topic: TopicToVideo
  onEdit: (topic: TopicToVideo) => void
  onDelete: (id: string) => void
  onNavigate: (id: string) => void
}

export function TopicToVideoRow({ topic, onEdit, onDelete, onNavigate }: TopicToVideoRowProps) {
  const getStatusBadge = () => {
    switch (topic.status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400">
            Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400">
            Processing
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400">
            Failed
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="secondary" className="bg-gray-500/10 text-gray-600 dark:text-gray-400">
            Draft
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <tr
      onClick={() => onNavigate(topic.id)}
      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <HugeiconsIcon
            icon={Video01Icon}
            className="size-6 text-primary"
          />
          <div>
            <div>
              <span className="font-medium text-left">
                {topic.name}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {topic.aspectRatio}
          </Badge>
          <Badge variant="secondary">
            {topic.orientation.charAt(0).toUpperCase() +
              topic.orientation.slice(1)}
          </Badge>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {topic.categories && topic.categories.length > 0 ? (
            topic.categories.map((category, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs font-medium"
              >
                {category}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Video01Icon} className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {topic.videosGenerated.toLocaleString()}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {topic.schedulerEnabled ? (
            <>
              <HugeiconsIcon
                icon={CalendarIcon}
                className="size-5 text-primary"
              />
              <span className="text-sm text-muted-foreground">Enabled</span>
            </>
          ) : (
            <>
              <HugeiconsIcon
                icon={CalendarIcon}
                className="size-5 text-muted-foreground opacity-50"
              />
              <span className="text-sm text-muted-foreground">Disabled</span>
            </>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HugeiconsIcon icon={ClockIcon} className="size-4" />
          <span>{formatDate(topic.createdAt)}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
          >
            <HugeiconsIcon
              icon={MoreVerticalCircle01Icon}
              className="size-4"
            />
            <span className="sr-only">Options</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(topic)}>
              <HugeiconsIcon icon={EditIcon} className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(topic.id)}
              className="text-destructive focus:text-destructive"
            >
              <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}
