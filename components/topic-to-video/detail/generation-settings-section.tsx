"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { VideoGenerationSettings } from "./types"

interface GenerationSettingsSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  settings: VideoGenerationSettings
  onSettingsChange: (settings: VideoGenerationSettings) => void
}

export function GenerationSettingsSection({
  isOpen,
  onOpenChange,
  settings,
  onSettingsChange,
}: GenerationSettingsSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Generation Settings</CardTitle>
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                className={cn("size-4 transition-transform", isOpen && "rotate-180")}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>
                  <Label>Video Style</Label>
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={settings.style}
                    onValueChange={(value) =>
                      value && onSettingsChange({ ...settings, style: value as VideoGenerationSettings["style"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                        <SelectItem value="documentary">Documentary</SelectItem>
                        <SelectItem value="vlog">Vlog</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Duration</Label>
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={settings.duration}
                    onValueChange={(value) =>
                      value && onSettingsChange({ ...settings, duration: value as VideoGenerationSettings["duration"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="short">Short (15-60s)</SelectItem>
                        <SelectItem value="medium">Medium (1-3min)</SelectItem>
                        <SelectItem value="long">Long (3-10min)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>
                  <Label>Custom Prompt (Optional)</Label>
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    placeholder="Add custom instructions for video generation..."
                    value={settings.customPrompt || ""}
                    onChange={(e) => onSettingsChange({ ...settings, customPrompt: e.target.value })}
                    rows={3}
                  />
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
