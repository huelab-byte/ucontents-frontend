"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, YoutubeIcon, VideoIcon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface ThumbnailGenerationSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  stepNumber?: number
  isLastStep?: boolean
  aspectRatio?: "9:16" | "16:9"
}

export function ThumbnailGenerationSection({
  isOpen,
  onOpenChange,
  stepNumber = 3,
  isLastStep = false,
  aspectRatio = "16:9",
}: ThumbnailGenerationSectionProps) {
  const [isEnabled, setIsEnabled] = React.useState(true)
  const [model, setModel] = React.useState("gpt-4")
  // Auto-select platform based on aspect ratio
  const getInitialPlatform = (ratio: "9:16" | "16:9") => {
    return ratio === "9:16" ? "short-video-thumbnail" : "youtube-thumbnail"
  }
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<Set<string>>(
    new Set([getInitialPlatform(aspectRatio)])
  )
  const [promptTemplate, setPromptTemplate] = React.useState("default")
  const [customPromptTemplate, setCustomPromptTemplate] = React.useState("")
  const [wordCount, setWordCount] = React.useState(3)

  // Update selected platform when aspect ratio changes
  React.useEffect(() => {
    const platform = getInitialPlatform(aspectRatio)
    setSelectedPlatforms(new Set([platform]))
  }, [aspectRatio])

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(platform)) {
        newSet.delete(platform)
      } else {
        newSet.add(platform)
      }
      return newSet
    })
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
                  <CardTitle className="text-base">Step {stepNumber}: Thumbnail Generation</CardTitle>
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
            {/* Toggle Button */}
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <Label className="text-sm font-medium">Enable Thumbnail Generation</Label>
              <Button
                variant={isEnabled ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEnabled(!isEnabled)
                }}
                className="min-w-[80px]"
              >
                {isEnabled ? "Turn Off" : "Turn On"}
              </Button>
            </div>

            {isEnabled && (
              <FieldGroup className="gap-4">
                {/* Model Selection */}
                <Field className="flex-row">
                  <FieldLabel>
                    <Label>Model Selection</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Select value={model} onValueChange={(value) => setModel(value || "gpt-4")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                        <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>

                {/* Platform Selection */}
                <Field orientation="horizontal">
                  <FieldLabel>
                    <Label>Platform</Label>
                  </FieldLabel>
                  <FieldContent>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => togglePlatform("youtube-thumbnail")}
                        className={cn(
                          "gap-1.5",
                          selectedPlatforms.has("youtube-thumbnail")
                            ? "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                            : "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                        )}
                      >
                        <HugeiconsIcon icon={YoutubeIcon} className="size-3.5" />
                        Youtube Thumbnail
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => togglePlatform("short-video-thumbnail")}
                        className={cn(
                          "gap-1.5",
                          selectedPlatforms.has("short-video-thumbnail")
                            ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                            : "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                        )}
                      >
                        <HugeiconsIcon icon={VideoIcon} className="size-3.5" />
                        Short Video Thumbnail
                      </Button>
                    </div>
                  </FieldContent>
                </Field>

                {/* Prompt Template Selection */}
                <Field orientation="horizontal" className="flex-col">
                  <FieldLabel>
                    <Label>Prompt Template</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Select value={promptTemplate} onValueChange={(value) => setPromptTemplate(value || "default")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a prompt template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="storytelling">Storytelling</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>

                {/* Custom Prompt Template */}
                {promptTemplate === "custom" && (
                  <Field>
                    <FieldLabel>
                      <Label>Custom Prompt Template</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Textarea
                        placeholder="Enter your custom prompt template..."
                        value={customPromptTemplate}
                        onChange={(e) => setCustomPromptTemplate(e.target.value)}
                        rows={4}
                        className="text-sm"
                      />
                    </FieldContent>
                  </Field>
                )}

                {/* Word Count */}
                <Field orientation="horizontal" className="flex-col">
                  <FieldLabel>
                    <Label>Word Count</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={wordCount || 3}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (value >= 1 && value <= 20) {
                          setWordCount(value)
                        }
                      }}
                      placeholder="3"
                      className="w-full"
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
    </div>
  )
}
