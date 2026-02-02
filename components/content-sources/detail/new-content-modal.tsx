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
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
        const outlineSize = template.outlineSize ?? 3
        onCaptionSettingsChange({
          templateId,
          enableVideoCaption: captionSettings.enableVideoCaption,
          font: template.font,
          fontSize: template.fontSize,
          fontWeight: template.fontWeight ?? "regular",
          fontColor: template.fontColor,
          outlineEnabled: outlineSize > 0,
          outlineColor: template.outlineColor,
          outlineSize,
          position: ((template.position as string) === "instagram" ? "bottom" : template.position) as "top" | "center" | "bottom",
          positionOffset: template.positionOffset ?? 30,
          wordsPerCaption: template.wordsPerCaption,
          wordHighlighting: template.wordHighlighting,
          highlightColor: template.highlightColor,
          highlightStyle: template.highlightStyle,
          backgroundOpacity: template.backgroundOpacity,
          enableAlternatingLoop: template.enableAlternatingLoop ?? captionSettings.enableAlternatingLoop,
          loopCount: template.loopCount ?? captionSettings.loopCount,
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

                      {/* Row 1: Font - 1 col */}
                      <Field>
                        <FieldLabel><Label>Font</Label></FieldLabel>
                        <FieldContent>
                          <Select
                            value={captionSettings.font}
                            onValueChange={(value) =>
                              onCaptionSettingsChange({ ...captionSettings, font: value || "" })
                            }
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {availableFonts.map((font) => (
                                  <SelectItem key={font} value={font}>{font}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FieldContent>
                      </Field>

                      {/* Row 2: Font Weight | Font Size */}
                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel><Label>Font Weight</Label></FieldLabel>
                          <FieldContent>
                            <Select
                              value={captionSettings.fontWeight ?? "regular"}
                              onValueChange={(value) =>
                                onCaptionSettingsChange({
                                  ...captionSettings,
                                  fontWeight: (value || "regular") as CaptionSettings["fontWeight"],
                                })
                              }
                            >
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="regular">Regular</SelectItem>
                                  <SelectItem value="bold">Bold</SelectItem>
                                  <SelectItem value="italic">Italic</SelectItem>
                                  <SelectItem value="bold_italic">Bold Italic</SelectItem>
                                  <SelectItem value="black">Black</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FieldContent>
                        </Field>
                        <Field>
                          <FieldLabel><Label>Font Size</Label></FieldLabel>
                          <FieldContent>
                            <Input
                              type="number"
                              value={captionSettings.fontSize}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10);
                                onCaptionSettingsChange({
                                  ...captionSettings,
                                  fontSize: isNaN(v) ? captionSettings.fontSize : v,
                                });
                              }}
                              className="w-full"
                              placeholder="px"
                            />
                          </FieldContent>
                        </Field>
                      </div>

                      {/* Row 3: Color - text left, picker right */}
                      <div className="flex items-center justify-between gap-4">
                        <Label className="text-sm shrink-0">Color</Label>
                        <Input
                          type="color"
                          value={captionSettings.fontColor}
                          onChange={(e) =>
                            onCaptionSettingsChange({ ...captionSettings, fontColor: e.target.value })
                          }
                          className="h-9 w-14 cursor-pointer p-1 border border-input rounded-md"
                        />
                      </div>

                      {/* Row 4: Outline - text left, checkbox right */}
                      <div className="flex items-center justify-between gap-4">
                        <Label className="text-sm shrink-0">Outline</Label>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="modal-outline-enabled"
                            checked={captionSettings.outlineEnabled}
                            onCheckedChange={(checked) =>
                              onCaptionSettingsChange({
                                ...captionSettings,
                                outlineEnabled: checked === true,
                                outlineSize: checked ? (captionSettings.outlineSize || 3) : 0,
                              })
                            }
                          />
                          <Label htmlFor="modal-outline-enabled" className="text-sm cursor-pointer font-normal">Enable</Label>
                        </div>
                      </div>

                      {/* Row 5: Outline Size | Outline Color (when outline checked) */}
                      {captionSettings.outlineEnabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <Field orientation="verticalEnd">
                            <FieldLabel><Label className="justify-start items-end">Outline Size</Label></FieldLabel>
                            <FieldContent>
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                value={captionSettings.outlineSize}
                                onChange={(e) =>
                                  onCaptionSettingsChange({
                                    ...captionSettings,
                                    outlineSize: Math.min(20, Math.max(0, parseInt(e.target.value) || 0)),
                                  })
                                }
                                className="w-full"
                                placeholder="px"
                              />
                            </FieldContent>
                          </Field>
                          <Field orientation="verticalEnd">
                            <FieldLabel><Label className="justify-start items-end">Outline Color</Label></FieldLabel>
                            <FieldContent>
                              <Input
                                type="color"
                                value={captionSettings.outlineColor}
                                onChange={(e) =>
                                  onCaptionSettingsChange({ ...captionSettings, outlineColor: e.target.value })
                                }
                                className="h-9 w-14 cursor-pointer p-1 border border-input rounded-md"
                              />
                            </FieldContent>
                          </Field>
                        </div>
                      )}

                      {/* Row 6: Position */}
                      <Field>
                        <FieldLabel><Label>Position</Label></FieldLabel>
                        <FieldContent>
                          <RadioGroup
                            value={captionSettings.position}
                            onValueChange={(value) =>
                              onCaptionSettingsChange({
                                ...captionSettings,
                                position: value as CaptionSettings["position"],
                              })
                            }
                            className="flex flex-wrap gap-4"
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="top" id="modal-position-top" />
                              <Label htmlFor="modal-position-top" className="text-sm cursor-pointer font-normal">Top</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="bottom" id="modal-position-bottom" />
                              <Label htmlFor="modal-position-bottom" className="text-sm cursor-pointer font-normal">Bottom</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="center" id="modal-position-center" />
                              <Label htmlFor="modal-position-center" className="text-sm cursor-pointer font-normal">Center</Label>
                            </div>
                          </RadioGroup>
                        </FieldContent>
                      </Field>

                      {/* Row 7: Distance from edge (when top or bottom) */}
                      {(captionSettings.position === "top" || captionSettings.position === "bottom") && (
                        <div className="flex items-center justify-between gap-4">
                          <Label className="text-sm shrink-0">Distance from edge (px)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="500"
                            value={captionSettings.positionOffset}
                            onChange={(e) =>
                              onCaptionSettingsChange({
                                ...captionSettings,
                                positionOffset: Math.max(0, parseInt(e.target.value) || 0),
                              })
                            }
                            className="w-24"
                          />
                        </div>
                      )}

                      <Separator />

                      {/* Caption and Video Playback */}
                      {/* Row: Caption word count - left text, right number input (default 3) */}
                      <div className="flex items-center justify-between gap-4">
                        <Label className="text-sm shrink-0">Caption word count</Label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={captionSettings.wordsPerCaption}
                          onChange={(e) =>
                            onCaptionSettingsChange({
                              ...captionSettings,
                              wordsPerCaption: Math.min(20, Math.max(1, parseInt(e.target.value) || 1)),
                            })
                          }
                          className="w-24"
                        />
                      </div>
                      {/* Row: Video Loop - left text, right number input */}
                      <div className="flex items-center justify-between gap-4">
                        <Label className="text-sm shrink-0">Video Loop</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={captionSettings.loopCount}
                          onChange={(e) =>
                            onCaptionSettingsChange({
                              ...captionSettings,
                              loopCount: Math.min(10, Math.max(1, parseInt(e.target.value) || 1)),
                            })
                          }
                          className="w-24"
                        />
                      </div>
                      {/* Row: Reverse Play - left text, right checkbox */}
                      <div className="flex items-center justify-between gap-4">
                        <Label className="text-sm shrink-0">Reverse Play</Label>
                        {captionSettings.loopCount <= 1 ? (
                          <Checkbox
                            id="modal-reverse-play"
                            checked={captionSettings.enableAlternatingLoop}
                            onCheckedChange={(checked) =>
                              onCaptionSettingsChange({
                                ...captionSettings,
                                enableAlternatingLoop: checked === true,
                              })
                            }
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">Only when loop is 1</p>
                        )}
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
                    <div className="w-5 h-5 rounded border border-border shrink-0" style={{ backgroundColor: captionSettings.fontColor }} title={captionSettings.fontColor} />
                    <span className="text-xs">Text</span>
                  </div>
                  {captionSettings.outlineEnabled && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded border border-border shrink-0" style={{ backgroundColor: captionSettings.outlineColor }} title={captionSettings.outlineColor} />
                      <span className="text-xs">Outline</span>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Position</div>
                  <div className="text-sm font-medium capitalize">{(captionSettings.position as string) === "instagram" ? "Instagram Style" : captionSettings.position}</div>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Words per Caption</div>
                  <div className="text-sm font-medium">{captionSettings.wordsPerCaption}</div>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Outline</div>
                  <div className="text-sm font-medium">
                    {captionSettings.outlineEnabled ? `${captionSettings.outlineSize}px` : "Off"}
                  </div>
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
