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
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, VideoIcon, PlusSignIcon, Cancel01Icon, SparklesIcon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface TransitionEffect {
  id: string
  type: string
  duration?: number
}

interface VideoEditingSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  stepNumber?: number
  isLastStep?: boolean
}

export function VideoEditingSection({
  isOpen,
  onOpenChange,
  stepNumber = 9,
  isLastStep = false,
}: VideoEditingSectionProps) {
  const [enableVariedTransitions, setEnableVariedTransitions] = React.useState(false)
  const [transitionEffects, setTransitionEffects] = React.useState<TransitionEffect[]>([
    { id: "1", type: "fade" },
  ])
  const [videoType, setVideoType] = React.useState("standard")

  const availableTransitionTypes = [
    { value: "fade", label: "Fade" },
    { value: "zoom-in", label: "Zoom In" },
    { value: "zoom-out", label: "Zoom Out" },
    { value: "slide-right", label: "Slide Right" },
    { value: "slide-left", label: "Slide Left" },
    { value: "slide-down", label: "Slide Down" },
    { value: "slide-up", label: "Slide Up" },
    { value: "cross-fade", label: "Cross Fade" },
    { value: "wipe", label: "Wipe" },
    { value: "dissolve", label: "Dissolve" },
  ]

  const videoTypes = [
    { value: "standard", label: "Standard Video" },
    { value: "song", label: "Song Type Video" },
    { value: "tutorial", label: "Tutorial Video" },
    { value: "promotional", label: "Promotional Video" },
    { value: "storytelling", label: "Storytelling Video" },
  ]

  const addTransitionEffect = () => {
    const newId = String(transitionEffects.length + 1)
    setTransitionEffects([...transitionEffects, { id: newId, type: "fade", duration: 0.5 }])
  }

  const removeTransitionEffect = (id: string) => {
    setTransitionEffects(transitionEffects.filter((effect) => effect.id !== id))
  }

  const updateTransitionEffect = (id: string, updates: Partial<TransitionEffect>) => {
    setTransitionEffects(
      transitionEffects.map((effect) => (effect.id === id ? { ...effect, ...updates } : effect))
    )
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
                  <CardTitle className="text-base">
                    Step {stepNumber}: Video Editing
                  </CardTitle>
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
              {/* Video Type Selection */}
              <Field orientation="horizontal" className="flex-col">
                <FieldLabel>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={VideoIcon} className="size-4" />
                    <Label>Video Type</Label>
                  </div>
                </FieldLabel>
                <FieldContent className="w-full min-w-0">
                  <Select value={videoType} onValueChange={(value) => setVideoType(value || "standard")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select video type" />
                    </SelectTrigger>
                    <SelectContent>
                      {videoTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              {/* Enable Varied Transition Effects */}
              <Field orientation="horizontal" className="flex-col">
                <FieldLabel>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={enableVariedTransitions}
                      onChange={(e) => setEnableVariedTransitions(e.target.checked)}
                      className="rounded border-border cursor-pointer size-4"
                    />
                    <HugeiconsIcon icon={SparklesIcon} className="size-4" />
                    <Label>Enable Varied Transition Effects</Label>
                  </div>
                </FieldLabel>
                {enableVariedTransitions && (
                  <FieldContent>
                    <p className="text-sm text-muted-foreground">
                      When enabled: Zoom In → Slide Right → Slide Left → Slide Down → Slide Up (repeats)
                    </p>
                  </FieldContent>
                )}
              </Field>

              {/* Transition Effects */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Transition Effects</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTransitionEffect}
                    className="gap-2"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                    Add Transition Effect
                  </Button>
                </div>

                {transitionEffects.map((effect, index) => (
                  <div key={effect.id} className="flex items-start gap-3 p-3 border border-border rounded-lg bg-muted/30">
                    <div className="flex-1 space-y-3">
                      <Field orientation="horizontal" className="flex-col">
                        <FieldLabel>
                          <Label className="text-sm">Transition Type {index + 1}</Label>
                        </FieldLabel>
                        <FieldContent className="w-full min-w-0">
                          <Select
                            value={effect.type}
                            onValueChange={(value) => updateTransitionEffect(effect.id, { type: value || undefined })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTransitionTypes.map((transition) => (
                                <SelectItem key={transition.value} value={transition.value}>
                                  {transition.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FieldContent>
                      </Field>

                      <Field orientation="horizontal" className="flex-col">
                        <FieldLabel>
                          <Label className="text-sm">Duration (seconds)</Label>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={effect.duration || 0.5}
                            onChange={(e) =>
                              updateTransitionEffect(effect.id, {
                                duration: parseFloat(e.target.value) || 0.5,
                              })
                            }
                            className="w-full"
                            placeholder="0.5"
                          />
                        </FieldContent>
                      </Field>
                    </div>

                    {transitionEffects.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTransitionEffect(effect.id)}
                        className="shrink-0 h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  )
}
