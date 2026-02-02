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
import type { CaptionSettings } from "./types"

/** Generates a crisp, smooth text outline with rounded corners using multiple text-shadows */
function createTextOutlineCss(size: number, color: string): string {
  if (size <= 0) return "none"
  const seen = new Set<string>()
  const shadows: string[] = []
  // 16 directions per ring for smoother, rounder corners
  const dirs: [number, number][] = []
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI * 2) / 16
    dirs.push([Math.cos(angle), Math.sin(angle)])
  }
  for (let r = 1; r <= size; r++) {
    for (const [dx, dy] of dirs) {
      const x = Math.round(dx * r)
      const y = Math.round(dy * r)
      const key = `${x},${y}`
      if (!seen.has(key)) {
        seen.add(key)
        shadows.push(`${x}px ${y}px 0 ${color}`)
      }
    }
  }
  // Add arc points at outer radius for smoother corner curves
  const arcSteps = Math.max(4, Math.min(size * 2, 32))
  for (let i = 0; i < arcSteps; i++) {
    const angle = (i * Math.PI * 2) / arcSteps
    const x = Math.round(Math.cos(angle) * size)
    const y = Math.round(Math.sin(angle) * size)
    const key = `${x},${y}`
    if (!seen.has(key)) {
      seen.add(key)
      shadows.push(`${x}px ${y}px 0 ${color}`)
    }
  }
  return shadows.join(", ")
}

type PreviewOrientation = "vertical" | "horizontal"

interface CaptionPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  captionSettings: CaptionSettings
}

export function CaptionPreviewModal({
  isOpen,
  onClose,
  captionSettings,
}: CaptionPreviewModalProps) {
  const [orientation, setOrientation] = React.useState<PreviewOrientation>("vertical")

  const isVertical = orientation === "vertical"
  const aspectRatio = isVertical ? 9 / 16 : 16 / 9
  const fontScale = isVertical ? 0.8 : 0.6
  const previewWidth = isVertical ? 260 : 375

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="!max-w-[420px] !w-[420px] max-h-[90vh] flex flex-col overflow-hidden p-0" style={{ maxWidth: '420px', width: '420px' }}>
        <AlertDialogHeader className="shrink-0 px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between gap-4">
            <AlertDialogTitle>Caption Design Preview</AlertDialogTitle>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant={isVertical ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setOrientation("vertical")}
                className="h-8 px-2.5 text-xs"
              >
                Vertical
              </Button>
              <Button
                variant={!isVertical ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setOrientation("horizontal")}
                className="h-8 px-2.5 text-xs"
              >
                Horizontal
              </Button>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="flex flex-1 min-h-0 items-center justify-center p-6 bg-muted/30 overflow-hidden">
          {/* Preview Container - scales to fit without scrollbar */}
          <div
            className="relative shrink-0 max-w-full max-h-full"
            style={{
              width: `min(${previewWidth}px, 100%)`,
              aspectRatio,
              maxHeight: "min(400px, calc(90vh - 220px))",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg border-2 border-border overflow-hidden">
              {/* Preview Video Background (placeholder) */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-muted-foreground text-sm">Video Preview Area</div>
              </div>
              
              {/* Caption Preview Overlay */}
              <div
                className="absolute w-full px-4"
                style={{
                  top: captionSettings.position === "top" ? `${captionSettings.positionOffset ?? 30}px` : 
                        captionSettings.position === "center" ? "50%" : undefined,
                  bottom: captionSettings.position === "bottom" ? `${captionSettings.positionOffset ?? 30}px` : undefined,
                  transform: captionSettings.position === "center" ? "translateY(-50%)" : "none",
                }}
              >
                <div
                  className="text-center"
                  style={{
                    fontFamily: captionSettings.font,
                    fontSize: `${captionSettings.fontSize * fontScale}px`,
                    fontStyle: ["italic", "bold_italic"].includes(captionSettings.fontWeight ?? "regular") ? "italic" : "normal",
                    fontWeight: ["bold", "bold_italic"].includes(captionSettings.fontWeight ?? "regular") ? "bold" : captionSettings.fontWeight === "black" ? 900 : "normal",
                    color: captionSettings.fontColor,
                    textShadow: createTextOutlineCss(
                      captionSettings.outlineEnabled ? captionSettings.outlineSize : 0,
                      captionSettings.outlineColor
                    ),
                    backgroundColor: captionSettings.highlightStyle === "background" 
                      ? `${captionSettings.highlightColor}${Math.round(captionSettings.backgroundOpacity * 2.55).toString(16).padStart(2, '0')}`
                      : "transparent",
                    padding: captionSettings.highlightStyle === "background" ? "4px 8px" : "0",
                    borderRadius: captionSettings.highlightStyle === "background" ? "8px" : "0",
                  }}
                >
                  {/* Sample Caption Text */}
                  <div>
                    {captionSettings.wordHighlighting && captionSettings.highlightStyle === "text" ? (
                      <>
                        This is a <span style={{ color: captionSettings.highlightColor }}>sample</span> caption
                        <br />
                        with <span style={{ color: captionSettings.highlightColor }}>highlighted</span> words
                      </>
                    ) : (
                      <>
                        This is a sample caption
                        <br />
                        preview with your settings
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AlertDialogFooter className="shrink-0 px-6 pb-6 pt-4 border-t border-border">
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
