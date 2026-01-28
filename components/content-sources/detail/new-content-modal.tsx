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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { CancelCircleIcon, Upload01Icon, FolderOpenIcon, EyeIcon } from "@hugeicons/core-free-icons"
import type { CaptionSettings, CaptionTemplate } from "./types"

interface NewContentModalProps {
  isOpen: boolean
  onClose: () => void
  captionSettings: CaptionSettings
  onCaptionSettingsChange: (settings: CaptionSettings) => void
  captionTemplates: CaptionTemplate[]
  availableFonts: string[]
  onFileUpload: (files: FileList | null) => void
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
}

export function NewContentModal({
  isOpen,
  onClose,
  captionSettings,
  onCaptionSettingsChange,
  captionTemplates,
  availableFonts,
  onFileUpload,
  onDrop,
  onDragOver,
}: NewContentModalProps) {
  const handleTemplateChange = (templateId: string | null) => {
    if (templateId) {
      const template = captionTemplates.find((t) => t.id === templateId)
      if (template) {
        onCaptionSettingsChange({
          templateId,
          font: template.font,
          fontSize: template.fontSize,
          fontColor: template.fontColor,
          outlineColor: template.outlineColor,
          outlineSize: template.outlineSize,
          position: template.position,
          wordsPerCaption: template.wordsPerCaption,
          wordHighlighting: template.wordHighlighting,
          highlightColor: template.highlightColor,
          highlightStyle: template.highlightStyle,
          backgroundOpacity: template.backgroundOpacity,
          enableAlternatingLoop: captionSettings.enableAlternatingLoop,
          loopCount: captionSettings.loopCount,
        })
      }
    } else {
      onCaptionSettingsChange({ ...captionSettings, templateId: null })
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="!max-w-[1000px] !w-[1000px] max-h-[95vh] p-0" style={{ width: '1000px', maxWidth: '1000px' }}>
        <AlertDialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <AlertDialogTitle>Create New Content</AlertDialogTitle>
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
        <div className="flex gap-0 max-h-[calc(95vh-140px)]">
          {/* Left Panel - Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              {/* Video Caption Editing Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Video Caption Editing Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <form>
                    <FieldGroup className="gap-6">
                      {/* Template Selector */}
                      <Field>
                        <FieldLabel>
                          <Label>Caption Template</Label>
                        </FieldLabel>
                        <FieldContent>
                          <Select
                            value={captionSettings.templateId || ""}
                            onValueChange={(value) => handleTemplateChange(value || null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a template (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="">None (Custom Settings)</SelectItem>
                                {captionTemplates.map((template) => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1.5">
                            Select a saved preset template or configure custom settings below
                          </p>
                        </FieldContent>
                      </Field>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Subtitle Font */}
                        <Field>
                          <FieldLabel>
                            <Label>Subtitle Font</Label>
                          </FieldLabel>
                          <FieldContent>
                            <Select
                              value={captionSettings.font}
                              onValueChange={(value) =>
                                onCaptionSettingsChange({ ...captionSettings, font: value || "" })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {availableFonts.map((font) => (
                                    <SelectItem key={font} value={font}>
                                      {font}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1.5">
                              Add your own .ttf or .otf fonts to the font folder
                            </p>
                          </FieldContent>
                        </Field>

                        {/* Font Color */}
                        <Field>
                          <FieldLabel>
                            <Label>Font Color</Label>
                          </FieldLabel>
                          <FieldContent>
                            <div className="flex items-center gap-2">
                              <Input
                                type="color"
                                value={captionSettings.fontColor}
                                onChange={(e) =>
                                  onCaptionSettingsChange({ ...captionSettings, fontColor: e.target.value })
                                }
                                className="w-16 h-10 cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={captionSettings.fontColor}
                                onChange={(e) =>
                                  onCaptionSettingsChange({ ...captionSettings, fontColor: e.target.value })
                                }
                                className="font-mono"
                                placeholder="#FFFFFF"
                              />
                            </div>
                          </FieldContent>
                        </Field>

                        {/* Font Size */}
                        <Field>
                          <FieldLabel>
                            <Label>Font Size: {captionSettings.fontSize}px</Label>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              type="range"
                              min="12"
                              max="100"
                              value={captionSettings.fontSize}
                              onChange={(e) =>
                                onCaptionSettingsChange({
                                  ...captionSettings,
                                  fontSize: parseInt(e.target.value),
                                })
                              }
                              className="w-full"
                            />
                          </FieldContent>
                        </Field>

                        {/* Outline Color */}
                        <Field>
                          <FieldLabel>
                            <Label>Outline Color</Label>
                          </FieldLabel>
                          <FieldContent>
                            <div className="flex items-center gap-2">
                              <Input
                                type="color"
                                value={captionSettings.outlineColor}
                                onChange={(e) =>
                                  onCaptionSettingsChange({
                                    ...captionSettings,
                                    outlineColor: e.target.value,
                                  })
                                }
                                className="w-16 h-10 cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={captionSettings.outlineColor}
                                onChange={(e) =>
                                  onCaptionSettingsChange({
                                    ...captionSettings,
                                    outlineColor: e.target.value,
                                  })
                                }
                                className="font-mono"
                                placeholder="#000000"
                              />
                            </div>
                          </FieldContent>
                        </Field>

                        {/* Outline Size */}
                        <Field>
                          <FieldLabel>
                            <Label>Outline Size: {captionSettings.outlineSize}px</Label>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              type="range"
                              min="0"
                              max="20"
                              value={captionSettings.outlineSize}
                              onChange={(e) =>
                                onCaptionSettingsChange({
                                  ...captionSettings,
                                  outlineSize: parseInt(e.target.value),
                                })
                              }
                              className="w-full"
                            />
                          </FieldContent>
                        </Field>

                        {/* Caption Position */}
                        <Field>
                          <FieldLabel>
                            <Label>Caption Position</Label>
                          </FieldLabel>
                          <FieldContent>
                            <div className="flex flex-wrap gap-3">
                              {[
                                { value: "top", label: "Top" },
                                { value: "center", label: "Center" },
                                { value: "bottom", label: "Bottom" },
                                { value: "instagram", label: "Instagram Style" },
                              ].map((option) => (
                                <Label
                                  key={option.value}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <input
                                    type="radio"
                                    name="caption-position"
                                    value={option.value}
                                    checked={captionSettings.position === option.value}
                                    onChange={(e) =>
                                      onCaptionSettingsChange({
                                        ...captionSettings,
                                        position: e.target.value as CaptionSettings["position"],
                                      })
                                    }
                                    className="rounded border-border"
                                  />
                                  {option.label}
                                </Label>
                              ))}
                            </div>
                          </FieldContent>
                        </Field>

                        {/* Words Per Caption */}
                        <Field>
                          <FieldLabel>
                            <Label>Words Per Caption</Label>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              type="number"
                              min="1"
                              max="20"
                              value={captionSettings.wordsPerCaption}
                              onChange={(e) =>
                                onCaptionSettingsChange({
                                  ...captionSettings,
                                  wordsPerCaption: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-full"
                            />
                          </FieldContent>
                        </Field>
                      </div>
                    </FieldGroup>
                  </form>
                </CardContent>
              </Card>

              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Video Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30 relative"
                    onClick={() => document.getElementById("video-upload-modal")?.click()}
                  >
                    <HugeiconsIcon icon={Upload01Icon} className="size-8 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Drag & drop video files here</p>
                    <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => onFileUpload(e.target.files)}
                      className="hidden"
                      id="video-upload-modal"
                    />
                    <label htmlFor="video-upload-modal" className="inline-block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          document.getElementById("video-upload-modal")?.click()
                        }}
                      >
                        <HugeiconsIcon icon={FolderOpenIcon} className="size-3.5 mr-1.5" />
                        Select Videos
                      </Button>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Panel - Sticky Settings Summary */}
          <div className="w-64 border-l border-border bg-muted/30 px-4 py-4 sticky top-0 self-start">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Settings Summary</h3>
              <div className="space-y-4">
                <div className="p-3 bg-background rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Template</div>
                  <div className="text-sm font-medium">
                    {captionSettings.templateId
                      ? captionTemplates.find((t) => t.id === captionSettings.templateId)?.name || "Custom"
                      : "None (Custom)"}
                  </div>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Font</div>
                  <div className="text-sm font-medium">{captionSettings.font}</div>
                  <div className="text-xs text-muted-foreground mt-1">{captionSettings.fontSize}px</div>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Colors</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: captionSettings.fontColor }} />
                    <span className="text-xs font-mono">{captionSettings.fontColor}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: captionSettings.outlineColor }} />
                    <span className="text-xs font-mono">{captionSettings.outlineColor}</span>
                  </div>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Position</div>
                  <div className="text-sm font-medium capitalize">{captionSettings.position === "instagram" ? "Instagram Style" : captionSettings.position}</div>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Words per Caption</div>
                  <div className="text-sm font-medium">{captionSettings.wordsPerCaption}</div>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Outline Size</div>
                  <div className="text-sm font-medium">{captionSettings.outlineSize}px</div>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Preview functionality can be added here
                  }}
                >
                  <HugeiconsIcon icon={EyeIcon} className="size-4 mr-2" />
                  Preview
                </Button>
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
