"use client"

import * as React from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { EyeIcon, ArrowDown01Icon, FloppyDiskIcon, Cancel01Icon } from "@hugeicons/core-free-icons"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import type { CaptionSettings, CaptionTemplate } from "./types"

interface CaptionConfigurationSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  captionSettings: CaptionSettings
  onCaptionSettingsChange: (settings: CaptionSettings) => void
  captionTemplates: CaptionTemplate[]
  availableFonts: string[]
  onPreviewClick: () => void
  onSaveAsTemplate?: (name: string) => void
  onDeleteTemplate?: (templateId: string) => void
}

export function CaptionConfigurationSection({
  isOpen,
  onOpenChange,
  captionSettings,
  onCaptionSettingsChange,
  captionTemplates,
  availableFonts,
  onPreviewClick,
  onSaveAsTemplate,
  onDeleteTemplate,
}: CaptionConfigurationSectionProps) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = React.useState(false)
  const [templateName, setTemplateName] = React.useState("")

  const handleSaveTemplate = () => {
    if (templateName.trim() && onSaveAsTemplate) {
      onSaveAsTemplate(templateName.trim())
      setTemplateName("")
      setIsSaveDialogOpen(false)
    }
  }

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
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card size="sm">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Video Caption Editing Configuration</CardTitle>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className={cn("size-4 transition-transform", isOpen && "rotate-180")}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="mb-[10px]">
            <form>
              <FieldGroup className="gap-3">
                {/* Enable Video Caption checkbox */}
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-xs shrink-0">Enable Video Caption</Label>
                  <Checkbox
                    id="enable-video-caption"
                    checked={captionSettings.enableVideoCaption}
                    onCheckedChange={(checked) =>
                      onCaptionSettingsChange({
                        ...captionSettings,
                        enableVideoCaption: checked === true,
                      })
                    }
                  />
                </div>

                {/* All caption-related settings - only shown when video caption is enabled */}
                {captionSettings.enableVideoCaption && (
                  <>
                    {/* Template Selector */}
                    <Field>
                      <FieldLabel>
                        <Label className="text-xs">Caption Template</Label>
                      </FieldLabel>
                      <FieldContent>
                        <div className="flex items-center gap-1">
                          <Select
                            value={captionSettings.templateId || ""}
                            onValueChange={(value) => handleTemplateChange(value || null)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select a template (optional)">
                                {captionSettings.templateId
                                  ? captionTemplates.find((t) => t.id === captionSettings.templateId)?.name ??
                                    undefined
                                  : undefined}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent alignItemWithTrigger={true}>
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
                          {captionSettings.templateId && onDeleteTemplate && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => onDeleteTemplate(captionSettings.templateId!)}
                              aria-label="Delete template"
                            >
                              <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Select a saved preset template or configure custom settings below
                        </p>
                      </FieldContent>
                    </Field>

                    {/* Caption word count */}
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-xs shrink-0">Caption word count</Label>
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

                    <Separator />

                    {/* Row 1: Font - 1 col */}
                    <Field>
                      <FieldLabel>
                        <Label className="text-xs">Font</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Select
                          value={captionSettings.font}
                          onValueChange={(value) =>
                            onCaptionSettingsChange({ ...captionSettings, font: value || "" })
                          }
                        >
                          <SelectTrigger className="w-full">
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
                      </FieldContent>
                    </Field>

                {/* Row 2: Font Weight | Font Size */}
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel>
                      <Label className="text-xs">Font Weight</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Select
                        value={captionSettings.fontWeight ?? "regular"}
                        onValueChange={(value) =>
                          onCaptionSettingsChange({
                            ...captionSettings,
                            fontWeight: (value || "regular") as "regular" | "bold" | "italic" | "bold_italic" | "black",
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
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
                    <FieldLabel>
                      <Label className="text-xs">Font Size</Label>
                    </FieldLabel>
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
                  <Label className="text-xs shrink-0">Color</Label>
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
                  <Label className="text-xs shrink-0">Outline</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="outline-enabled"
                      checked={captionSettings.outlineEnabled}
                      onCheckedChange={(checked) =>
                        onCaptionSettingsChange({
                          ...captionSettings,
                          outlineEnabled: checked === true,
                          outlineSize: checked ? (captionSettings.outlineSize || 3) : 0,
                        })
                      }
                    />
                    <Label htmlFor="outline-enabled" className="text-xs cursor-pointer font-normal">
                      Enable
                    </Label>
                  </div>
                </div>

                {/* Row 5: Outline Size | Outline Color (when outline checked) */}
                {captionSettings.outlineEnabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field orientation="verticalEnd">
                      <FieldLabel>
                        <Label className="text-xs justify-start items-end">Outline Size</Label>
                      </FieldLabel>
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
                      <FieldLabel>
                        <Label className="text-xs justify-start items-end">Outline Color</Label>
                      </FieldLabel>
                      <FieldContent>
                        <Input
                          type="color"
                          value={captionSettings.outlineColor}
                          onChange={(e) =>
                            onCaptionSettingsChange({
                              ...captionSettings,
                              outlineColor: e.target.value,
                            })
                          }
                          className="h-9 w-14 cursor-pointer p-1 border border-input rounded-md"
                        />
                      </FieldContent>
                    </Field>
                  </div>
                )}

                {/* Row 6: Position */}
                <Field>
                  <FieldLabel>
                    <Label className="text-xs">Position</Label>
                  </FieldLabel>
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
                        <RadioGroupItem value="top" id="position-top" />
                        <Label htmlFor="position-top" className="text-xs cursor-pointer font-normal">Top</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="bottom" id="position-bottom" />
                        <Label htmlFor="position-bottom" className="text-xs cursor-pointer font-normal">Bottom</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="center" id="position-center" />
                        <Label htmlFor="position-center" className="text-xs cursor-pointer font-normal">Center</Label>
                      </div>
                    </RadioGroup>
                  </FieldContent>
                </Field>

                    {/* Row 7: Distance from edge (when top or bottom) */}
                    {(captionSettings.position === "top" || captionSettings.position === "bottom") && (
                      <div className="flex items-center justify-between gap-4">
                        <Label className="text-xs shrink-0">Distance from edge (px)</Label>
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
                  </>
                )}

                <Separator />

                {/* Video Playback Settings */}
                {/* Row: Video Loop - left text, right number input */}
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-xs shrink-0">Video Loop</Label>
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
                <div className="flex items-center justify-between gap-4 pb-[11px]">
                  <Label className="text-xs shrink-0">Reverse Play</Label>
                  {captionSettings.loopCount <= 1 ? (
                    <Checkbox
                      id="reverse-play"
                      checked={captionSettings.enableAlternatingLoop}
                      onCheckedChange={(checked) =>
                        onCaptionSettingsChange({
                          ...captionSettings,
                          enableAlternatingLoop: checked === true,
                        })
                      }
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">Only when loop is 1</p>
                  )}
                </div>
              </FieldGroup>
            </form>
          </CardContent>
          {captionSettings.enableVideoCaption && (
            <CardFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onPreviewClick}
              >
                <HugeiconsIcon icon={EyeIcon} className="size-4 mr-2" />
                Preview
              </Button>
              {onSaveAsTemplate && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsSaveDialogOpen(true)}
                >
                  <HugeiconsIcon icon={FloppyDiskIcon} className="size-4 mr-2" />
                  Save as Template
                </Button>
              )}
            </CardFooter>
          )}
        </CollapsibleContent>
      </Card>

      {/* Save as Template Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Enter a name for your caption template. This will save the current settings as a reusable template.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Field>
              <FieldLabel>
                <Label className="text-sm">Template Name</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name..."
                  className="w-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && templateName.trim()) {
                      handleSaveTemplate()
                    }
                  }}
                />
              </FieldContent>
            </Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTemplateName("")
                setIsSaveDialogOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveTemplate}
              disabled={!templateName.trim()}
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Collapsible>
  )
}
