"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlayIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface GenerateVideoSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: () => void
  isGenerating?: boolean
  stepNumber?: number
  isLastStep?: boolean
}

export function GenerateVideoSection({
  isOpen,
  onOpenChange,
  onGenerate,
  isGenerating = false,
  stepNumber = 3,
  isLastStep = true,
}: GenerateVideoSectionProps) {
  return (
    <div className="relative">
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
                  <CardTitle className="text-base">Step {stepNumber}: Generate Video</CardTitle>
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
            <Button
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              <HugeiconsIcon icon={PlayIcon} className="size-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Video"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Generate a new video based on the topic and current settings
            </p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
    </div>
  )
}
