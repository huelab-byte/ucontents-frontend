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
  CalendarIcon,
  Video01Icon,
} from "@hugeicons/core-free-icons"
import { ContentSource } from "./types"
import { formatDate } from "./utils"

interface ContentSourceRowProps {
  source: ContentSource
  onEdit: (source: ContentSource) => void
  onDelete: (id: string) => void
  onNavigate: (id: string) => void
}

export function ContentSourceRow({ source, onEdit, onDelete, onNavigate }: ContentSourceRowProps) {
  return (
    <tr
      onClick={() => onNavigate(source.id)}
      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <HugeiconsIcon
            icon={Video01Icon}
            className="size-6 text-primary"
          />
          <div>
            <span className="font-medium text-left">
              {source.name}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {source.aspectRatio}
          </Badge>
          <Badge variant="secondary">
            {source.orientation.charAt(0).toUpperCase() +
              source.orientation.slice(1)}
          </Badge>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Video01Icon} className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {source.totalVideos.toLocaleString()}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {source.schedulerEnabled ? (
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
          <span>{formatDate(source.createdAt)}</span>
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
            <DropdownMenuItem onClick={() => onEdit(source)}>
              <HugeiconsIcon icon={EditIcon} className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(source.id)}
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
