"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FolderIcon,
  CheckmarkCircle01Icon,
  Refresh01Icon,
  MusicNote01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { AudioClip } from "../types"

interface AudioClipGridProps {
  clips: AudioClip[]
  selectedClips: Set<string>
  onToggleSelection: (clipId: string) => void
  showSelection?: boolean
}

export function AudioClipGrid({ clips, selectedClips, onToggleSelection, showSelection = true }: AudioClipGridProps) {
  if (clips.length === 0) {
    return (
      <Card className="mr-0 sm:mr-[26px] p-12 text-center">
        <CardContent className="pt-6">
          <HugeiconsIcon icon={FolderIcon} className="size-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No BGM files yet</h3>
          <p className="text-muted-foreground mb-4">Upload your first BGM file to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {clips.map((clip) => (
        <Card
          key={clip.id}
          className={cn(
            "mr-0 sm:mr-[26px] transition-all flex flex-col overflow-hidden py-0",
            showSelection && "cursor-pointer hover:ring-2 hover:ring-primary/50",
            showSelection && selectedClips.has(clip.id) && "ring-2 ring-primary"
          )}
          onClick={showSelection ? () => onToggleSelection(clip.id) : undefined}
        >
          <div className="relative flex-1 flex flex-col">
            {/* Audio Player */}
            <div className="aspect-video bg-muted rounded-t-xl relative overflow-hidden flex items-center justify-center flex-shrink-0">
              {clip.status === "processing" || clip.status === "pending" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                  <HugeiconsIcon icon={Refresh01Icon} className="size-8 animate-spin text-primary" />
                </div>
              ) : clip.audioUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <HugeiconsIcon icon={MusicNote01Icon} className="size-12 text-primary/60 mb-3" />
                  <audio
                    className="w-full"
                    src={clip.audioUrl}
                    controls
                    preload="metadata"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <HugeiconsIcon icon={MusicNote01Icon} className="size-12 text-muted-foreground/50" />
                </div>
              )}
              {showSelection && (
                <div className="absolute top-2 right-2 z-10">
                  {selectedClips.has(clip.id) ? (
                    <div className="size-5 rounded bg-primary flex items-center justify-center">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="size-5 rounded border-2 border-background bg-background/50" />
                  )}
                </div>
              )}
              {/* Upload Progress Bar */}
              {clip.uploadProgress !== undefined && (
                <div className="absolute bottom-0 left-0 right-0 z-20 p-2">
                  <Progress value={clip.uploadProgress} className="h-1" />
                </div>
              )}
            </div>
            <CardContent className="p-3 flex-shrink-0">
              <p className="font-medium text-sm truncate text-foreground">{clip.filename}</p>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  )
}
