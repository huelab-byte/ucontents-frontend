"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface VideoQualitySectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  stepNumber?: number
  isLastStep?: boolean
}

export function VideoQualitySection({
  isOpen,
  onOpenChange,
  stepNumber,
  isLastStep = false,
}: VideoQualitySectionProps) {
  const [videoQuality, setVideoQuality] = React.useState("1080p")

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {stepNumber && `Step ${stepNumber}: `}Video Quality
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
              <p className="text-sm text-muted-foreground">
                Select the desired output video resolution:
              </p>
              <Field>
                <FieldLabel>
                  <Label>Resolution</Label>
                </FieldLabel>
                <FieldContent>
                  <Select value={videoQuality} onValueChange={(value) => setVideoQuality(value || "1080p")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="720p">720p (Fast Render)</SelectItem>
                        <SelectItem value="1080p">1080p (Medium Render)</SelectItem>
                        <SelectItem value="1440p">1440p (Slow Render)</SelectItem>
                        <SelectItem value="4k">4K (Very Slow Render)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
