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
import { ArrowDown01Icon, ClockIcon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface ContentGenerationSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  topic?: string
  stepNumber?: number
  isLastStep?: boolean
}

const MIN_WORD_COUNT = 10
const MAX_WORD_COUNT = 200000
const WORDS_PER_MINUTE = 200

// Calculate word count from duration in minutes (assuming 200 words per minute)
const calculateWordCountFromDuration = (durationInMinutes: number): number => {
  return Math.round(durationInMinutes * WORDS_PER_MINUTE)
}

// Calculate duration in minutes from word count
const calculateDurationFromWordCount = (wordCount: number): number => {
  return wordCount / WORDS_PER_MINUTE
}

export function ContentGenerationSection({
  isOpen,
  onOpenChange,
  topic,
  stepNumber = 2,
  isLastStep = false,
}: ContentGenerationSectionProps) {
  const [model, setModel] = React.useState("gpt-4")
  const [promptTemplate, setPromptTemplate] = React.useState("default")
  const [customPromptTemplate, setCustomPromptTemplate] = React.useState("")
  const [pointOfView, setPointOfView] = React.useState("none")
  const [targetWordCount, setTargetWordCount] = React.useState(10)
  const [durationInMinutes, setDurationInMinutes] = React.useState(calculateDurationFromWordCount(10))
  const [useSecondsInput, setUseSecondsInput] = React.useState<boolean | null>(null)
  const updateSourceRef = React.useRef<"duration" | "wordcount" | null>(null)
  
  // Auto-detect if we should use seconds input (when duration < 1 minute and not explicitly set)
  const shouldUseSeconds = useSecondsInput === null 
    ? durationInMinutes < 1 
    : useSecondsInput

  // Update word count when duration changes (from input)
  React.useEffect(() => {
    if (updateSourceRef.current === "wordcount") {
      updateSourceRef.current = null
      return
    }
    
    const newWordCount = calculateWordCountFromDuration(durationInMinutes)
    if (newWordCount >= MIN_WORD_COUNT && newWordCount <= MAX_WORD_COUNT) {
      updateSourceRef.current = "duration"
      setTargetWordCount(newWordCount)
    }
  }, [durationInMinutes])

  // Update duration when word count changes (from slider)
  React.useEffect(() => {
    if (updateSourceRef.current === "duration") {
      updateSourceRef.current = null
      return
    }
    
    const newDuration = calculateDurationFromWordCount(targetWordCount)
    if (Math.abs(newDuration - durationInMinutes) > 0.01) {
      updateSourceRef.current = "wordcount"
      setDurationInMinutes(newDuration)
    }
  }, [targetWordCount, durationInMinutes])

  const estimatedDuration = durationInMinutes
  const totalSeconds = Math.round(estimatedDuration * 60)
  const displayMinutes = Math.floor(totalSeconds / 60)
  const displaySeconds = totalSeconds % 60

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
                  <CardTitle className="text-base">Step {stepNumber}: Content Generation</CardTitle>
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

              {/* Prompt Template Selection */}
              <Field className="flex-row">
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


              {/* Point of View Selection */}
              <Field className="flex-row">
                <FieldLabel>
                  <Label>Point of View</Label>
                </FieldLabel>
                <FieldContent>
                  <Select value={pointOfView} onValueChange={(value) => setPointOfView(value || "none")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select point of view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="first-person">First Person</SelectItem>
                      <SelectItem value="second-person">Second Person</SelectItem>
                      <SelectItem value="third-person">Third Person</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              {/* Target Word Count */}
              <Field className="flex-col">
                <FieldLabel>
                  <Label>Target Word Count</Label>
                </FieldLabel>
                <FieldContent className="space-y-3">
                  {/* Slider */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground min-w-[120px]">
                      Target Word Count:
                    </span>
                    <div className="flex-1 relative">
                      <input
                        type="range"
                        min={MIN_WORD_COUNT}
                        max={MAX_WORD_COUNT}
                        value={targetWordCount}
                        onChange={(e) => setTargetWordCount(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((targetWordCount - MIN_WORD_COUNT) / (MAX_WORD_COUNT - MIN_WORD_COUNT)) * 100}%, hsl(var(--muted)) ${((targetWordCount - MIN_WORD_COUNT) / (MAX_WORD_COUNT - MIN_WORD_COUNT)) * 100}%, hsl(var(--muted)) 100%)`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground min-w-[60px] text-right">
                      {targetWordCount.toLocaleString()}
                    </span>
                  </div>

                  {/* Duration Input (Minutes/Seconds) */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground min-w-[120px]">
                      Duration:
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      {shouldUseSeconds ? (
                        <>
                          <Input
                            type="number"
                            step="1"
                            min={Math.round(MIN_WORD_COUNT / WORDS_PER_MINUTE / 60 * 60)}
                            max={59}
                            value={Math.round(durationInMinutes * 60)}
                            onChange={(e) => {
                              const seconds = Number(e.target.value)
                              if (!isNaN(seconds) && seconds >= 0 && seconds <= 59) {
                                setDurationInMinutes(seconds / 60)
                                if (useSecondsInput === null) {
                                  setUseSecondsInput(true)
                                }
                              }
                            }}
                            placeholder="Enter seconds"
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">seconds</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setUseSecondsInput(false)
                            }}
                            className="text-xs h-7"
                          >
                            Use minutes
                          </Button>
                        </>
                      ) : (
                        <>
                          <Input
                            type="number"
                            step="0.01"
                            min={MIN_WORD_COUNT / WORDS_PER_MINUTE / 60}
                            max={Math.floor(MAX_WORD_COUNT / WORDS_PER_MINUTE)}
                            value={Math.round(durationInMinutes * 100) / 100}
                            onChange={(e) => {
                              const minutes = Number(e.target.value)
                              const minDuration = MIN_WORD_COUNT / WORDS_PER_MINUTE / 60
                              const maxDuration = Math.floor(MAX_WORD_COUNT / WORDS_PER_MINUTE)
                              if (!isNaN(minutes) && minutes >= minDuration && minutes <= maxDuration) {
                                setDurationInMinutes(Math.round(minutes * 100) / 100)
                                if (useSecondsInput === null) {
                                  setUseSecondsInput(false)
                                }
                              }
                            }}
                            placeholder="Enter minutes"
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">minutes</span>
                        </>
                      )}
                    </div>
                  </div>
                </FieldContent>
              </Field>

              {/* Estimated Duration */}
              <Field orientation="vertical">
                <FieldLabel>
                  <Label>Estimated Duration</Label>
                </FieldLabel>
                <FieldContent>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md my-[15px]">
                    <HugeiconsIcon icon={ClockIcon} className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {displaySeconds === 0 && displayMinutes > 0
                        ? `${displayMinutes} minute${displayMinutes !== 1 ? "s" : ""} per topic`
                        : displayMinutes === 0 && displaySeconds > 0
                        ? `${displaySeconds} second${displaySeconds !== 1 ? "s" : ""} per topic`
                        : displayMinutes > 0 && displaySeconds > 0
                        ? `${displayMinutes} minute${displayMinutes !== 1 ? "s" : ""} ${displaySeconds} second${displaySeconds !== 1 ? "s" : ""} per topic`
                        : "0 seconds per topic"
                      }
                    </span>
                  </div>
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
    </div>
  )
}
