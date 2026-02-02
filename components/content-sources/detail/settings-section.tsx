"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { PromptSettings, PromptTemplate, ContentSourceType } from "./types"

interface SettingsSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  promptSettings: PromptSettings
  onPromptSettingsChange: (settings: PromptSettings) => void
  promptTemplates: PromptTemplate[]
}

export function SettingsSection({
  isOpen,
  onOpenChange,
  promptSettings,
  onPromptSettingsChange,
  promptTemplates,
}: SettingsSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card size="sm">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Settings</CardTitle>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className={cn("size-4 transition-transform", isOpen && "rotate-180")}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <FieldGroup className="gap-3">
              {/* Content Source Type - same style as Position in caption config */}
              <Field>
                <FieldLabel>
                  <Label className="text-xs">Content Source</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="flex flex-col gap-2">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="content-source-type"
                        value="prompt"
                        checked={promptSettings.contentSourceType === "prompt"}
                        onChange={() =>
                          onPromptSettingsChange({
                            ...promptSettings,
                            contentSourceType:
                              promptSettings.contentSourceType === "prompt" ? null : "prompt",
                            contentFromFrameExtract: false,
                          })
                        }
                        className="rounded-full border-border"
                      />
                      <span className="text-xs">Content generation prompt</span>
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="content-source-type"
                        value="frame_extract"
                        checked={promptSettings.contentSourceType === "frame_extract"}
                        onChange={() =>
                          onPromptSettingsChange({
                            ...promptSettings,
                            contentSourceType:
                              promptSettings.contentSourceType === "frame_extract"
                                ? null
                                : "frame_extract",
                            contentFromFrameExtract:
                              promptSettings.contentSourceType === "frame_extract" ? false : true,
                          })
                        }
                        className="rounded-full border-border"
                      />
                      <span className="text-xs">Extract content from video frames</span>
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="content-source-type"
                        value="video_title"
                        checked={promptSettings.contentSourceType === "video_title"}
                        onChange={() =>
                          onPromptSettingsChange({
                            ...promptSettings,
                            contentSourceType:
                              promptSettings.contentSourceType === "video_title" ? null : "video_title",
                            contentFromFrameExtract: false,
                          })
                        }
                        className="rounded-full border-border"
                      />
                      <span className="text-xs">Generate from video title</span>
                    </Label>
                  </div>
                </FieldContent>
              </Field>

              {/* Prompt Template Selector - shown only when "Content generation prompt" is selected */}
              {promptSettings.contentSourceType === "prompt" && (
                <Field>
                  <FieldLabel>
                    <Label className="text-xs">Select Prompt Template</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={promptSettings.templateId || ""}
                      onValueChange={(value) =>
                        onPromptSettingsChange({
                          ...promptSettings,
                          templateId: value || null,
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a prompt template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {promptTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {promptSettings.templateId === "custom" && (
                      <div className="mt-3">
                        <Label className="text-xs mb-2 block">Custom Prompt</Label>
                        <Textarea
                          value={promptSettings.customPrompt}
                          onChange={(e) =>
                            onPromptSettingsChange({
                              ...promptSettings,
                              customPrompt: e.target.value,
                            })
                          }
                          placeholder="Enter your custom prompt here..."
                          className="min-h-[100px] text-sm"
                        />
                      </div>
                    )}
                  </FieldContent>
                </Field>
              )}

              {/* Content generation parameters - same row layout as Caption word count, Video Loop */}
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <Label className="text-xs shrink-0">Heading length</Label>
                <Input
                  type="number"
                  value={promptSettings.headingLength}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    const val = Number.isNaN(v) ? promptSettings.headingLength : Math.max(0, v)
                    onPromptSettingsChange({
                      ...promptSettings,
                      headingLength: val,
                    })
                  }}
                  className="w-24"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-xs shrink-0">Post caption length</Label>
                <Input
                  type="number"
                  value={promptSettings.postCaptionLength}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    const val = Number.isNaN(v) ? promptSettings.postCaptionLength : Math.max(0, v)
                    onPromptSettingsChange({
                      ...promptSettings,
                      postCaptionLength: val,
                    })
                  }}
                  className="w-24"
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Label className="text-xs shrink-0">Hashtags count</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={promptSettings.hashtagsCount}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    const clamped = Number.isNaN(v)
                      ? promptSettings.hashtagsCount
                      : Math.min(30, Math.max(1, v))
                    onPromptSettingsChange({
                      ...promptSettings,
                      hashtagsCount: clamped,
                    })
                  }}
                  className="w-24"
                />
              </div>
              {/* Row: Include emoji in heading - same style as Reverse Play */}
              <div className="flex items-center justify-between gap-4 pb-[11px]">
                <Label className="text-xs shrink-0">Include emoji in heading</Label>
                <Checkbox
                  id="heading-emoji"
                  checked={promptSettings.headingEmoji}
                  onCheckedChange={(checked) =>
                    onPromptSettingsChange({
                      ...promptSettings,
                      headingEmoji: checked === true,
                    })
                  }
                />
              </div>
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
