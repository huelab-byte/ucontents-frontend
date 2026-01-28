"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, FilmIcon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface VariedTransitionsSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  stepNumber?: number
  isLastStep?: boolean
}

export function VariedTransitionsSection({
  isOpen,
  onOpenChange,
  stepNumber,
  isLastStep = false,
}: VariedTransitionsSectionProps) {
  const [enableVariedTransitions, setEnableVariedTransitions] = React.useState(false)
  const [selectedEffects, setSelectedEffects] = React.useState<Set<string>>(new Set())

  const transitionEffects = [
    { id: "zoom-in", name: "Zoom In" },
    { id: "zoom-out", name: "Zoom Out" },
    { id: "slide-right", name: "Slide Right" },
    { id: "slide-left", name: "Slide Left" },
    { id: "slide-down", name: "Slide Down" },
    { id: "slide-up", name: "Slide Up" },
    { id: "fade-in-out", name: "Fade In Out" },
    { id: "crossfade", name: "Crossfade" },
    { id: "rotate", name: "Rotate" },
    { id: "flip-horizontal", name: "Flip Horizontal" },
    { id: "flip-vertical", name: "Flip Vertical" },
    { id: "wipe-left", name: "Wipe Left" },
    { id: "wipe-right", name: "Wipe Right" },
    { id: "wipe-up", name: "Wipe Up" },
    { id: "wipe-down", name: "Wipe Down" },
    { id: "blur", name: "Blur" },
    { id: "scale", name: "Scale" },
    { id: "bounce", name: "Bounce" },
    { id: "spin", name: "Spin" },
    { id: "shutter", name: "Shutter" },
    { id: "iris", name: "Iris" },
    { id: "push", name: "Push" },
    { id: "cube", name: "Cube" },
    { id: "glitch", name: "Glitch" },
  ]

  const toggleEffect = (effectId: string) => {
    setSelectedEffects((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(effectId)) {
        newSet.delete(effectId)
      } else {
        newSet.add(effectId)
      }
      return newSet
    })
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {stepNumber && `Step ${stepNumber}: `}Varied Transition Effects
              </CardTitle>
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
              <Field orientation="horizontal">
                <FieldLabel>
                  <Label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableVariedTransitions}
                      onChange={(e) => setEnableVariedTransitions(e.target.checked)}
                      className="rounded border-border"
                    />
                    <HugeiconsIcon icon={FilmIcon} className="size-4" />
                    <span>Enable Varied Transition Effects</span>
                  </Label>
                </FieldLabel>
              </Field>
              {enableVariedTransitions && (
                <div className="space-y-2 ml-6">
                  {transitionEffects.map((effect) => (
                    <label
                      key={effect.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEffects.has(effect.id)}
                        onChange={() => toggleEffect(effect.id)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">{effect.name}</span>
                    </label>
                  ))}
                  {selectedEffects.size > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected effects will repeat in sequence: {Array.from(selectedEffects).map(id => transitionEffects.find(e => e.id === id)?.name).filter(Boolean).join(" → ")}
                    </p>
                  )}
                </div>
              )}
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
