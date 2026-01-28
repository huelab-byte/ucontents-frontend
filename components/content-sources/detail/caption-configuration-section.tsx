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
import { EyeIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
}

export function CaptionConfigurationSection({
  isOpen,
  onOpenChange,
  captionSettings,
  onCaptionSettingsChange,
  captionTemplates,
  availableFonts,
  onPreviewClick,
}: CaptionConfigurationSectionProps) {
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
                {/* Template Selector */}
                <Field>
                  <FieldLabel>
                    <Label className="text-xs">Caption Template</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={captionSettings.templateId || ""}
                      onValueChange={(value) => handleTemplateChange(value || null)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a template (optional)" />
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
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Select a saved preset template or configure custom settings below
                    </p>
                  </FieldContent>
                </Field>

                {/* Subtitle Font */}
                <Field>
                  <FieldLabel>
                    <Label className="text-xs">Subtitle Font</Label>
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

                {/* Font Color */}
                <Field>
                  <FieldLabel>
                    <Label className="text-xs">Font Color</Label>
                  </FieldLabel>
                  <FieldContent>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={captionSettings.fontColor}
                        onChange={(e) =>
                          onCaptionSettingsChange({ ...captionSettings, fontColor: e.target.value })
                        }
                        className="w-12 h-8 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={captionSettings.fontColor}
                        onChange={(e) =>
                          onCaptionSettingsChange({ ...captionSettings, fontColor: e.target.value })
                        }
                        className="font-mono text-xs flex-1"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </FieldContent>
                </Field>

                {/* Font Size */}
                <Field>
                  <FieldLabel>
                    <Label className="text-xs">Font Size: {captionSettings.fontSize}px</Label>
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
                    <Label className="text-xs">Outline Color</Label>
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
                        className="w-12 h-8 cursor-pointer"
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
                        className="font-mono text-xs flex-1"
                        placeholder="#000000"
                      />
                    </div>
                  </FieldContent>
                </Field>

                {/* Outline Size */}
                <Field>
                  <FieldLabel>
                    <Label className="text-xs">Outline Size: {captionSettings.outlineSize}px</Label>
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
                    <Label className="text-xs">Caption Position</Label>
                  </FieldLabel>
                  <FieldContent>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "top", label: "Top" },
                        { value: "center", label: "Center" },
                        { value: "bottom", label: "Bottom" },
                        { value: "instagram", label: "Instagram" },
                      ].map((option) => (
                        <Label
                          key={option.value}
                          className="flex items-center gap-1.5 cursor-pointer text-xs"
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
                    <Label className="text-xs">Words Per Caption</Label>
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

                {/* Loop Count */}
                <Field>
                  <FieldLabel>
                    <Label className="text-xs">How Many Times Loop</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={captionSettings.loopCount}
                      onChange={(e) =>
                        onCaptionSettingsChange({
                          ...captionSettings,
                          loopCount: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full"
                    />
                  </FieldContent>
                </Field>

                {/* Regular Play with Reverse */}
                <Field>
                  <FieldLabel>
                    <Label className="text-xs">Regular Play with Reverse One Time</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Label className="flex items-center gap-2 cursor-pointer text-xs font-normal">
                      <input
                        type="checkbox"
                        checked={captionSettings.enableAlternatingLoop}
                        onChange={(e) =>
                          onCaptionSettingsChange({
                            ...captionSettings,
                            enableAlternatingLoop: e.target.checked,
                          })
                        }
                        className="rounded border-border"
                      />
                      Enable
                    </Label>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onPreviewClick}
            >
              <HugeiconsIcon icon={EyeIcon} className="size-4 mr-2" />
              Preview Caption Design
            </Button>
          </CardFooter>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
