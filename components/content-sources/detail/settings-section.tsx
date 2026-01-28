"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { PromptSettings, PromptTemplate } from "./types"

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
              {/* Content Generating Prompt */}
              {!promptSettings.contentFromFrameExtract && (
                <Field>
                  <FieldLabel>
                    <Label className="text-xs">Content Generating Prompt</Label>
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

              {/* Content from Frame Extract */}
              <Field>
                <FieldLabel>
                  <Label className="text-xs">Content from Frame Extract</Label>
                </FieldLabel>
                <FieldContent>
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={promptSettings.contentFromFrameExtract}
                      onChange={(e) =>
                        onPromptSettingsChange({
                          ...promptSettings,
                          contentFromFrameExtract: e.target.checked,
                        })
                      }
                      className="rounded border-border"
                    />
                    <span className="text-sm">Extract content from video frames</span>
                  </Label>
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
