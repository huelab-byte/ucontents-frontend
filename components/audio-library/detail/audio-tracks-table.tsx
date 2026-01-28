"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FolderIcon,
  MoreVerticalCircle01Icon,
  DeleteIcon,
  PlayIcon,
  PauseIcon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { AudioTrack } from "../types"

interface AudioTracksTableProps {
  tracks: AudioTrack[]
  selectedTracks: Set<string>
  currentPage: number
  itemsPerPage: number
  totalPages: number
  playingTrackId: string | null
  onPageChange: (page: number) => void
  onToggleSelection: (trackId: string) => void
  onSelectAll: (currentPageItems: AudioTrack[]) => void
  onPlayPause: (track: AudioTrack) => void
  onDelete: (id: string) => void
}

export function AudioTracksTable({
  tracks,
  selectedTracks,
  currentPage,
  itemsPerPage,
  totalPages,
  playingTrackId,
  onPageChange,
  onToggleSelection,
  onSelectAll,
  onPlayPause,
  onDelete,
}: AudioTracksTableProps) {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTracks = tracks.slice(startIndex, endIndex)

  if (tracks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CardContent className="pt-6">
          <HugeiconsIcon icon={FolderIcon} className="size-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No tracks yet</CardTitle>
          <p className="text-muted-foreground mb-4">Upload your first track to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Tracks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectedTracks.size === currentTracks.length && currentTracks.length > 0}
                    onChange={() => onSelectAll(currentTracks)}
                    className="rounded border-border"
                  />
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 w-12">
                  Play
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Filename
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Duration
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Status
                </th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3 w-12">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTracks.map((track) => (
                <tr
                  key={track.id}
                  className={cn(
                    "border-b border-border hover:bg-muted/50 transition-colors",
                    selectedTracks.has(track.id) && "bg-muted/30"
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedTracks.has(track.id)}
                      onChange={() => onToggleSelection(track.id)}
                      className="rounded border-border"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {track.url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          onPlayPause(track)
                        }}
                      >
                        <HugeiconsIcon
                          icon={playingTrackId === track.id ? PauseIcon : PlayIcon}
                          className="size-4"
                        />
                        <span className="sr-only">{playingTrackId === track.id ? "Pause" : "Play"}</span>
                      </Button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{track.filename}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{track.duration}</td>
                  <td className="px-4 py-3">
                    {track.status === "PROCESSING" ? (
                      <span className="text-xs font-medium text-muted-foreground">Processing...</span>
                    ) : track.status === "NEW" ? (
                      <span className="text-xs font-medium text-primary">New</span>
                    ) : (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">Ready</span>
                    )}
                    {track.uploadProgress !== undefined && (
                      <Progress value={track.uploadProgress} className="h-1 mt-1 w-20" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                        <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
                        <span className="sr-only">Options</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onDelete(track.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <HugeiconsIcon icon={DeleteIcon} className="size-4 mr-2" />
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
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Showing {(startIndex + 1).toLocaleString()} to{" "}
              {Math.min(endIndex, tracks.length).toLocaleString()} of {tracks.length.toLocaleString()} tracks
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 shrink-0"
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <div className="flex items-center gap-1 flex-wrap justify-center max-w-full">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => onPageChange(page)}
                    className={cn(
                      "h-8 min-w-8 px-2 shrink-0 text-xs sm:text-sm",
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
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 shrink-0"
              >
                <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
