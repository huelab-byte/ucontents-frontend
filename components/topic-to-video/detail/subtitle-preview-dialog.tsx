"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { CancelCircleIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface SubtitlePreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  aspectRatio: "9:16" | "16:9"
  subtitleSettings: {
    font: string
    fontColor: string
    fontSize: number
    outlineColor: string
    outlineSize: number
    captionPosition: string
    enableWordHighlighting: boolean
    backgroundOpacity: number
    highlightColor: string
    highlightStyle: string
  }
}

export function SubtitlePreviewDialog({
  isOpen,
  onClose,
  aspectRatio,
  subtitleSettings,
}: SubtitlePreviewDialogProps) {
  // Calculate preview dimensions based on aspect ratio
  const isPortrait = aspectRatio === "9:16"
  const previewWidth = isPortrait ? 375 : 640
  const previewHeight = isPortrait ? 667 : 360
  

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent 
        className={cn(
          "max-h-[95vh] p-0",
          isPortrait ? "!max-w-[420px] !w-[420px]" : "!max-w-[720px] !w-[720px]"
        )} 
        style={{ 
          maxWidth: isPortrait ? '420px' : '720px', 
          width: isPortrait ? '420px' : '720px' 
        }}
      >
        <AlertDialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <AlertDialogTitle>Subtitle Design Preview</AlertDialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </AlertDialogHeader>
        <div className="flex items-center justify-center p-6 bg-muted/30">
          {/* Preview Container */}
          <div 
            className="relative w-full bg-black/50 rounded-lg border-2 border-border overflow-hidden"
            style={{ 
              width: `${previewWidth}px`, 
              aspectRatio: aspectRatio === "9:16" ? "9/16" : "16/9",
              maxWidth: "100%"
            }}
          >
            {/* Preview Video Background (placeholder) */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
              <div className="text-muted-foreground text-xs opacity-50">Video Preview Area</div>
            </div>
            
            {/* Subtitle Preview Overlay */}
            <div
              className="absolute w-full px-4"
              style={{
                top: subtitleSettings.captionPosition === "top" ? "10%" : 
                      subtitleSettings.captionPosition === "center" ? "50%" : 
                      subtitleSettings.captionPosition === "instagram-style" ? "75%" : "85%",
                transform: subtitleSettings.captionPosition === "center" ? "translateY(-50%)" : "none",
                bottom: subtitleSettings.captionPosition === "bottom" ? "10%" : "auto",
              }}
            >
              <div
                className="text-center"
                style={{
                  fontFamily: subtitleSettings.font,
                  fontSize: `${Math.max(subtitleSettings.fontSize * (isPortrait ? 0.8 : 0.6), 12)}px`,
                  color: subtitleSettings.highlightStyle === "text-color" && subtitleSettings.enableWordHighlighting
                    ? subtitleSettings.highlightColor
                    : subtitleSettings.fontColor,
                  textShadow: `${subtitleSettings.outlineSize}px ${subtitleSettings.outlineSize}px 0 ${subtitleSettings.outlineColor}, 
                              -${subtitleSettings.outlineSize}px -${subtitleSettings.outlineSize}px 0 ${subtitleSettings.outlineColor}, 
                              ${subtitleSettings.outlineSize}px -${subtitleSettings.outlineSize}px 0 ${subtitleSettings.outlineColor}, 
                              -${subtitleSettings.outlineSize}px ${subtitleSettings.outlineSize}px 0 ${subtitleSettings.outlineColor}`,
                  backgroundColor: subtitleSettings.highlightStyle === "background" && subtitleSettings.enableWordHighlighting
                    ? `${subtitleSettings.highlightColor}${Math.round(subtitleSettings.backgroundOpacity * 2.55).toString(16).padStart(2, '0')}`
                    : subtitleSettings.highlightStyle === "background"
                    ? `rgba(0, 0, 0, ${subtitleSettings.backgroundOpacity / 100})`
                    : "transparent",
                  padding: subtitleSettings.highlightStyle === "background" ? "4px 8px" : "0",
                  borderRadius: subtitleSettings.highlightStyle === "background" ? "4px" : "0",
                }}
              >
                {/* Sample Subtitle Text */}
                <div>
                  {subtitleSettings.enableWordHighlighting && subtitleSettings.highlightStyle === "text-color" ? (
                    <>
                      This is a <span style={{ color: subtitleSettings.highlightColor }}>sample</span> subtitle
                      <br />
                      with <span style={{ color: subtitleSettings.highlightColor }}>highlighted</span> words
                    </>
                  ) : (
                    <>
                      This is a sample subtitle
                      <br />
                      preview with your settings
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <AlertDialogFooter className="px-6 pb-6 pt-4 border-t border-border">
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}