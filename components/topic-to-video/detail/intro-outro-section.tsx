"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, FilmIcon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface IntroOutroSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  stepNumber?: number
  isLastStep?: boolean
}

export function IntroOutroSection({
  isOpen,
  onOpenChange,
  stepNumber,
  isLastStep = false,
}: IntroOutroSectionProps) {
  const [enableIntroOutro, setEnableIntroOutro] = React.useState(false)
  const [introVideo, setIntroVideo] = React.useState("")
  const [outroVideo, setOutroVideo] = React.useState("")
  const introInputRef = React.useRef<HTMLInputElement>(null)
  const outroInputRef = React.useRef<HTMLInputElement>(null)

  const handleIntroBrowse = () => {
    introInputRef.current?.click()
  }

  const handleOutroBrowse = () => {
    outroInputRef.current?.click()
  }

  const handleIntroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIntroVideo(file.name)
    }
  }

  const handleOutroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setOutroVideo(file.name)
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {stepNumber && `Step ${stepNumber}: `}Intro and Outro
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
                      checked={enableIntroOutro}
                      onChange={(e) => setEnableIntroOutro(e.target.checked)}
                      className="rounded border-border"
                    />
                    <HugeiconsIcon icon={FilmIcon} className="size-4" />
                    <span>Add Intro and Outro To Your Final Video</span>
                  </Label>
                </FieldLabel>
              </Field>

              {enableIntroOutro && (
                <>
                  <Field orientation="horizontal">
                    <FieldLabel>
                      <Label>Intro Video:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={introVideo}
                          placeholder="No file selected"
                          readOnly
                          className="flex-1"
                        />
                        <Button type="button" variant="default" size="sm" onClick={handleIntroBrowse}>
                          Browse...
                        </Button>
                        <input
                          ref={introInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleIntroFileChange}
                          className="hidden"
                        />
                      </div>
                    </FieldContent>
                  </Field>

                  <Field orientation="horizontal">
                    <FieldLabel>
                      <Label>Outro Video:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={outroVideo}
                          placeholder="No file selected"
                          readOnly
                          className="flex-1"
                        />
                        <Button type="button" variant="default" size="sm" onClick={handleOutroBrowse}>
                          Browse...
                        </Button>
                        <input
                          ref={outroInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleOutroFileChange}
                          className="hidden"
                        />
                      </div>
                    </FieldContent>
                  </Field>

                  <p className="text-sm text-muted-foreground">
                    Intro will be added at the beginning and Outro at the end of your final video.
                  </p>
                </>
              )}
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
