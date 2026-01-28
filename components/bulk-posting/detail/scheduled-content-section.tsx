"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  DeleteIcon,
  PlayIcon,
  ImageIcon,
  Video01Icon,
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { ScheduledContent } from "../types"

interface ScheduledContentSectionProps {
  campaignId: string
  scheduledContent: ScheduledContent[]
  setScheduledContent: React.Dispatch<React.SetStateAction<ScheduledContent[]>>
}

export function ScheduledContentSection({
  campaignId,
  scheduledContent,
  setScheduledContent,
}: ScheduledContentSectionProps) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set())
  const itemsPerPage = 50

  const totalPages = Math.ceil(scheduledContent.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = scheduledContent.slice(startIndex, endIndex)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(currentItems.map((item) => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedItems(newSelected)
  }

  const handleBatchDelete = () => {
    if (selectedItems.size === 0) return
    
    setScheduledContent((prev) => {
      const remaining = prev.filter((item) => !selectedItems.has(item.id))
      
      const newTotalPages = Math.ceil(remaining.length / itemsPerPage)
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      } else if (remaining.length === 0) {
        setCurrentPage(1)
      }
      
      return remaining
    })
    
    setSelectedItems(new Set())
  }

  const isAllSelected = currentItems.length > 0 && currentItems.every((item) => selectedItems.has(item.id))
  const isIndeterminate = currentItems.some((item) => selectedItems.has(item.id)) && !isAllSelected

  const formatDateDisplay = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const getPlatformIcon = (platform: "facebook" | "instagram" | "tiktok" | "youtube") => {
    const icons = {
      facebook: FacebookIcon,
      instagram: InstagramIcon,
      tiktok: TiktokIcon,
      youtube: YoutubeIcon,
    }
    return icons[platform]
  }

  const getPlatformColor = (platform: "facebook" | "instagram" | "tiktok" | "youtube") => {
    const colors = {
      facebook: "#1877F2",
      instagram: "#E4405F",
      tiktok: "#000000",
      youtube: "#FF0000",
    }
    return colors[platform]
  }

  const getStatusBadge = (status: ScheduledContent["status"]) => {
    const config = {
      scheduled: { label: "Scheduled", variant: "default" as const, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      published: { label: "Published", variant: "secondary" as const, className: "bg-green-500/10 text-green-600 dark:text-green-400" },
      error: { label: "Error", variant: "destructive" as const, className: "bg-red-500/10 text-red-600 dark:text-red-400" },
    }
    const statusConfig = config[status]
    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        {statusConfig.label}
      </Badge>
    )
  }

  return (
    <Card className="text-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs">Scheduled Content</CardTitle>
          {selectedItems.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
            >
              <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
              Delete ({selectedItems.size})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 w-12">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Post</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Networks</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selectedItems.has(item.id)}
                      onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium">{formatDateDisplay(item.date)}</span>
                      <span className="text-[10px] text-muted-foreground">{item.time}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="size-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {item.type === "video" ? (
                          <div className="relative w-full h-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                            <HugeiconsIcon 
                              icon={PlayIcon} 
                              className="size-6 text-primary absolute inset-0 m-auto" 
                            />
                          </div>
                        ) : item.type === "image" ? (
                          <HugeiconsIcon icon={ImageIcon} className="size-6 text-muted-foreground" />
                        ) : (
                          <HugeiconsIcon icon={Video01Icon} className="size-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-2">{item.contentText || item.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {item.platforms.map((platform) => {
                        const Icon = getPlatformIcon(platform)
                        const platformName = platform.charAt(0).toUpperCase() + platform.slice(1)
                        const statusText = item.status === "published" ? "Published" : item.status === "scheduled" ? "Scheduled" : "Error"
                        const tooltipText = `${statusText} on ${platformName}`
                        return (
                          <div
                            key={platform}
                            className="size-8 rounded-full flex items-center justify-center text-white cursor-help relative group"
                            style={{ backgroundColor: getPlatformColor(platform) }}
                            title={tooltipText}
                          >
                            <HugeiconsIcon icon={Icon} className="size-4" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                              {tooltipText}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-2 rounded-full",
                          item.status === "published" && "bg-green-500",
                          item.status === "scheduled" && "bg-blue-500",
                          item.status === "error" && "bg-red-500"
                        )}
                      />
                      <span className="text-xs capitalize">{item.status}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="text-xs text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, scheduledContent.length)} of {scheduledContent.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="min-w-[2.5rem]"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <HugeiconsIcon icon={ArrowRight02Icon} className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
