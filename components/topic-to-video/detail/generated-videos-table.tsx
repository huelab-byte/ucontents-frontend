"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  DeleteIcon,
  FileIcon,
  MoreVerticalCircle01Icon,
  PlayIcon,
  ClockIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { GeneratedVideo } from "./types"

interface GeneratedVideosTableProps {
  videos: GeneratedVideo[]
  selectedVideoIds: Set<string>
  onToggleSelection: (id: string) => void
  onSelectAll: (currentPageItems: GeneratedVideo[]) => void
  onEdit: (item: GeneratedVideo) => void
  onDelete: (id: string) => void
  onBatchDelete: () => void
  onWatchVideo: (url: string, title?: string) => void
  itemsPerPage?: number
}

export function GeneratedVideosTable({
  videos,
  selectedVideoIds,
  onToggleSelection,
  onSelectAll,
  onEdit,
  onDelete,
  onBatchDelete,
  onWatchVideo,
  itemsPerPage = 50,
}: GeneratedVideosTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const totalPages = Math.ceil(videos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVideos = videos.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  const allSelected = currentVideos.length > 0 && currentVideos.every((item) => selectedVideoIds.has(item.id))

  const handleSelectAll = () => {
    onSelectAll(currentVideos)
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs">
            Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
            Processing
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="secondary" className="bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
            Failed
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="secondary" className="bg-gray-500/10 text-gray-600 dark:text-gray-400 text-xs">
            Draft
          </Badge>
        )
      default:
        return null
    }
  }

  if (videos.length === 0) {
    return (
      <Card size="sm" className="p-6 text-center">
        <CardContent className="pt-3">
          <HugeiconsIcon icon={FileIcon} className="size-8 mx-auto text-muted-foreground mb-2" />
          <CardTitle className="mb-1 text-sm">No videos generated yet</CardTitle>
          <p className="text-xs text-muted-foreground mb-2">
            Generated videos will appear here once the topic is processed.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card size="sm">
      <CardHeader className="px-3 py-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Generated Videos</CardTitle>
          {selectedVideoIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onBatchDelete}
              className="h-7 text-xs"
            >
              <HugeiconsIcon icon={DeleteIcon} className="size-3 mr-1.5" />
              Delete Selected ({selectedVideoIds.size})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs table-auto">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 w-10 sticky left-0 bg-card z-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="rounded border-border cursor-pointer"
                  />
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5">
                  Title
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 min-w-[150px]">
                  Post Caption
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 min-w-[100px]">
                  Hashtags
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 min-w-[100px]">
                  Template
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 min-w-[100px]">
                  Video Type
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 min-w-[100px]">
                  Transitions
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 min-w-[100px]">
                  BGM
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 min-w-[80px]">
                  Subtitles
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 min-w-[80px]">
                  Voice/TTS
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 min-w-[100px]">
                  Footage
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 min-w-[100px]">
                  Thumbnail
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 min-w-[60px]">
                  Video
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 min-w-[80px]">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 min-w-[100px]">
                  Created
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-2 py-1.5 w-10 sticky right-0 bg-card z-10">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentVideos.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b border-border hover:bg-muted/50 transition-colors",
                    selectedVideoIds.has(item.id) && "bg-muted/30"
                  )}
                >
                  <td className="px-2 py-1.5 sticky left-0 bg-inherit z-10">
                    <input
                      type="checkbox"
                      checked={selectedVideoIds.has(item.id)}
                      onChange={() => onToggleSelection(item.id)}
                      className="rounded border-border cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-2 py-1.5" style={{ whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: 'none' }}>
                    <div className="font-medium text-xs" style={{ whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'visible', textOverflow: 'clip' }}>{item.title}</div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="text-xs text-muted-foreground max-w-[150px] truncate">
                      {item.description}
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="text-xs text-muted-foreground max-w-[100px] truncate">
                      {item.hashtags}
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="text-xs text-muted-foreground">
                      {item.settings?.template || "-"}
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="text-xs text-muted-foreground">
                      {item.settings?.videoType || "-"}
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="text-xs text-muted-foreground max-w-[100px] truncate">
                      {item.settings?.transitions || "-"}
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    {item.settings?.backgroundMusic ? (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs">
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    {item.settings?.subtitles ? (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs">
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    {item.settings?.voiceTts ? (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs">
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="text-xs text-muted-foreground max-w-[100px] truncate">
                      {item.settings?.footageLibrary || "-"}
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="text-xs text-muted-foreground max-w-[100px] truncate">
                      {item.settings?.thumbnail || "-"}
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    {item.videoUrl ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          onWatchVideo(item.videoUrl!, item.title)
                        }}
                        title="Watch video"
                      >
                        <HugeiconsIcon icon={PlayIcon} className="size-3" />
                        <span className="sr-only">Watch video</span>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <HugeiconsIcon icon={ClockIcon} className="size-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-right sticky right-0 bg-inherit z-10" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" className="h-6 w-6" />}
                      >
                        <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-3" />
                        <span className="sr-only">Options</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <HugeiconsIcon icon={FileIcon} className="size-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(item.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <HugeiconsIcon icon={DeleteIcon} className="size-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border mt-4">
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              Showing {(startIndex + 1).toLocaleString()} to{" "}
              {Math.min(endIndex, videos.length).toLocaleString()} of {videos.length.toLocaleString()} videos
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-7 w-7 shrink-0"
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} className="size-3" />
                <span className="sr-only">Previous page</span>
              </Button>
              <div className="flex items-center gap-1 flex-wrap justify-center max-w-full">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      "h-7 min-w-7 px-2 shrink-0 text-xs",
                      currentPage === page && "bg-primary text-primary-foreground"
                    )}
                  >
                    {page.toLocaleString()}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-7 w-7 shrink-0"
              >
                <HugeiconsIcon icon={ArrowRight02Icon} className="size-3" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
