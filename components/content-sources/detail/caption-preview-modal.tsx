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
import type { CaptionSettings } from "./types"

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
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="!max-w-[420px] !w-[420px] max-h-[95vh] p-0" style={{ maxWidth: '420px', width: '420px' }}>
        <AlertDialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <AlertDialogTitle>Caption Design Preview</AlertDialogTitle>
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
          {/* 9:16 Aspect Ratio Preview Container - Mobile Size */}
          <div className="relative w-full" style={{ width: '375px', aspectRatio: '9/16' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg border-2 border-border overflow-hidden">
              {/* Preview Video Background (placeholder) */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-muted-foreground text-sm">Video Preview Area</div>
              </div>
              
              {/* Caption Preview Overlay */}
              <div
                className="absolute w-full px-4"
                style={{
                  top: captionSettings.position === "top" ? "10%" : 
                        captionSettings.position === "center" ? "50%" : 
                        captionSettings.position === "instagram" ? "75%" : "85%",
                  transform: captionSettings.position === "center" ? "translateY(-50%)" : "none",
                }}
              >
                <div
                  className="text-center"
                  style={{
                    fontFamily: captionSettings.font,
                    fontSize: `${captionSettings.fontSize * 0.8}px`, // Scaled for preview
                    color: captionSettings.fontColor,
                    textShadow: `${captionSettings.outlineSize}px ${captionSettings.outlineSize}px 0 ${captionSettings.outlineColor}, 
                                -${captionSettings.outlineSize}px -${captionSettings.outlineSize}px 0 ${captionSettings.outlineColor}, 
                                ${captionSettings.outlineSize}px -${captionSettings.outlineSize}px 0 ${captionSettings.outlineColor}, 
                                -${captionSettings.outlineSize}px ${captionSettings.outlineSize}px 0 ${captionSettings.outlineColor}`,
                    backgroundColor: captionSettings.highlightStyle === "background" 
                      ? `${captionSettings.highlightColor}${Math.round(captionSettings.backgroundOpacity * 2.55).toString(16).padStart(2, '0')}`
                      : "transparent",
                    padding: captionSettings.highlightStyle === "background" ? "4px 8px" : "0",
                    borderRadius: captionSettings.highlightStyle === "background" ? "4px" : "0",
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
        <AlertDialogFooter className="px-6 pb-6 pt-4 border-t border-border">
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
