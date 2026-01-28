"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, Upload01Icon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { TopicToVideo } from "../types"

interface TopicImportSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onImport: (topics: Omit<TopicToVideo, "id" | "createdAt" | "videosGenerated">[]) => void
  stepNumber?: number
  isLastStep?: boolean
}

export function TopicImportSection({
  isOpen,
  onOpenChange,
  onImport,
  stepNumber = 1,
  isLastStep = false,
}: TopicImportSectionProps) {
  const [topicText, setTopicText] = React.useState("")
  const [isImporting, setIsImporting] = React.useState(false)
  const [enableYoutubeDescription, setEnableYoutubeDescription] = React.useState(false)
  const [descriptionLength, setDescriptionLength] = React.useState<"long" | "medium" | "small">("medium")

  const handleImport = () => {
    if (!topicText.trim()) return

    setIsImporting(true)
    
    // Parse topics - one per line
    const lines = topicText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    const importedTopics: Omit<TopicToVideo, "id" | "createdAt" | "videosGenerated">[] = lines.map((line) => {
      // Default values for imported topics
      return {
        name: line.length > 50 ? line.substring(0, 50) + "..." : line,
        topic: line,
        aspectRatio: "9:16" as const,
        orientation: "vertical" as const,
        status: "draft" as const,
        schedulerEnabled: false,
      }
    })

    // Call the import handler
    onImport(importedTopics)
    
    // Clear the textarea
    setTopicText("")
    setIsImporting(false)
  }

  const handleClear = () => {
    setTopicText("")
  }

  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isLastStep && (
        <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border -z-10" />
      )}
      
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                {/* Step Number Circle */}
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 font-semibold text-sm",
                  isOpen
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted-foreground text-muted-foreground"
                )}>
                  {stepNumber}
                </div>
                <div className="flex items-center justify-between flex-1">
                  <CardTitle className="text-base">Step {stepNumber}: Topic Import</CardTitle>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    className={cn("size-4 transition-transform", isOpen && "rotate-180")}
                  />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <FieldGroup className="gap-4">
              <Field orientation="horizontal" className="flex-col">
                <FieldLabel>
                  <Label>Import Topics</Label>
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    placeholder="Enter topics, one per line. Each line will be imported as a separate topic."
                    value={topicText}
                    onChange={(e) => setTopicText(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {topicText.split("\n").filter((line) => line.trim().length > 0).length} topic(s) ready to import
                  </p>
                </FieldContent>
              </Field>
              <Field orientation="horizontal">
                <FieldLabel>
                  <Label htmlFor="youtube-description-checkbox" className="cursor-pointer">
                    YouTube Description Generation
                  </Label>
                </FieldLabel>
                <FieldContent>
                  <input
                    id="youtube-description-checkbox"
                    type="checkbox"
                    checked={enableYoutubeDescription}
                    onChange={(e) => setEnableYoutubeDescription(e.target.checked)}
                    className="rounded border-border cursor-pointer size-4"
                  />
                </FieldContent>
              </Field>
              {enableYoutubeDescription && (
                <Field>
                  <FieldLabel>
                    <Label>Description Length</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={descriptionLength}
                      onValueChange={(value) => setDescriptionLength((value || "medium") as "long" | "medium" | "small")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select description length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              )}
            </FieldGroup>

            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={isImporting || !topicText.trim()}
                className="flex-1"
                size="lg"
              >
                <HugeiconsIcon icon={Upload01Icon} className="size-4 mr-2" />
                {isImporting ? "Importing..." : "Import Topics"}
              </Button>
              <Button
                onClick={handleClear}
                disabled={!topicText.trim()}
                variant="outline"
                size="lg"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
    </div>
  )
}
