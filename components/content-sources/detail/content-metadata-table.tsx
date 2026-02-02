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
  ViewIcon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { ContentMetadata } from "./types"

interface ContentMetadataTableProps {
  contentMetadata: ContentMetadata[]
  selectedMetadataIds: Set<string>
  onToggleSelection: (id: string) => void
  onSelectAll: (currentPageItems: ContentMetadata[]) => void
  onView: (item: ContentMetadata) => void
  onEdit: (item: ContentMetadata) => void
  onDelete: (id: string) => void
  onBatchDelete: () => void
  onWatchVideo: (url: string) => void
  itemsPerPage?: number
}

export function ContentMetadataTable({
  contentMetadata,
  selectedMetadataIds,
  onToggleSelection,
  onSelectAll,
  onView,
  onEdit,
  onDelete,
  onBatchDelete,
  onWatchVideo,
  itemsPerPage = 10,
}: ContentMetadataTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1)
  const totalPages = Math.ceil(contentMetadata.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMetadata = contentMetadata.slice(startIndex, endIndex)

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

  const allSelected = currentMetadata.length > 0 && currentMetadata.every((item) => selectedMetadataIds.has(item.id))

  const handleSelectAll = () => {
    onSelectAll(currentMetadata)
  }

  if (contentMetadata.length === 0) {
    return (
      <Card size="sm" className="p-6 text-center">
        <CardContent className="pt-3">
          <HugeiconsIcon icon={FileIcon} className="size-8 mx-auto text-muted-foreground mb-2" />
          <CardTitle className="mb-1 text-sm">No content metadata yet</CardTitle>
          <p className="text-xs text-muted-foreground mb-2">
            Content metadata will appear here once videos are processed and metadata is generated.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card size="sm">
      <CardHeader className="px-3 py-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Content Metadata</CardTitle>
          {selectedMetadataIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onBatchDelete}
              className="h-7 text-xs"
            >
              <HugeiconsIcon icon={DeleteIcon} className="size-3 mr-1.5" />
              Delete Selected ({selectedMetadataIds.size})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="rounded border-border cursor-pointer"
                  />
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5">
                  YouTube Headline
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5">
                  Post Caption
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5">
                  Hashtags
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5">
                  Video
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-2 py-1.5">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-2 py-1.5 w-10">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentMetadata.map((item, index) => (
                <tr
                  key={`${item.id}-${startIndex + index}`}
                  className={cn(
                    "border-b border-border hover:bg-muted/50 transition-colors",
                    selectedMetadataIds.has(item.id) && "bg-muted/30"
                  )}
                >
                  <td className="px-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={selectedMetadataIds.has(item.id)}
                      onChange={() => onToggleSelection(item.id)}
                      className="rounded border-border cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-1.5" style={{ whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: 'none' }}>
                    <div className="font-medium text-xs" style={{ whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'visible', textOverflow: 'clip' }}>{item.youtubeHeadline}</div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="text-xs text-muted-foreground max-w-[250px] line-clamp-1">
                      {item.postCaption}
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="text-xs text-muted-foreground max-w-[150px] truncate">
                      {item.hashtags}
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    {item.videoUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onWatchVideo(item.videoUrl!)}
                        className="h-6 text-xs px-2"
                      >
                        <HugeiconsIcon icon={PlayIcon} className="size-3 mr-1" />
                        Watch
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">No video</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    <Badge
                      variant={
                        item.status === "published"
                          ? "default"
                          : item.status === "scheduled"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs py-0"
                    >
                      {item.status === "published"
                        ? "Published"
                        : item.status === "scheduled"
                          ? "Processing"
                          : item.status === "draft"
                            ? "Ready"
                            : ""}
                    </Badge>
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" className="h-6 w-6" />}
                      >
                        <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-3.5" />
                        <span className="sr-only">Options</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(item)}>
                          <HugeiconsIcon icon={ViewIcon} className="size-3.5 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(item.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <HugeiconsIcon icon={DeleteIcon} className="size-3.5 mr-2" />
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-2 border-t border-border mt-2">
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              Showing {(startIndex + 1).toLocaleString()} to{" "}
              {Math.min(endIndex, contentMetadata.length).toLocaleString()} of{" "}
              {contentMetadata.length.toLocaleString()} entries
            </div>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-6 w-6 shrink-0"
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} className="size-3" />
                <span className="sr-only">Previous page</span>
              </Button>
              <div className="flex items-center gap-0.5 flex-wrap justify-center max-w-full">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                    className={cn(
                      "h-6 min-w-6 px-1.5 shrink-0 text-xs",
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
                className="h-6 w-6 shrink-0"
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
