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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ImageIcon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface ChannelLogoSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  stepNumber?: number
  isLastStep?: boolean
}

export function ChannelLogoSection({
  isOpen,
  onOpenChange,
  stepNumber,
  isLastStep = false,
}: ChannelLogoSectionProps) {
  const [enableLogo, setEnableLogo] = React.useState(false)
  const [logoFile, setLogoFile] = React.useState("")
  const [logoPosition, setLogoPosition] = React.useState("top-left")
  const logoInputRef = React.useRef<HTMLInputElement>(null)

  const handleBrowse = () => {
    logoInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file.name)
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {stepNumber && `Step ${stepNumber}: `}Channel Logo
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
                      checked={enableLogo}
                      onChange={(e) => setEnableLogo(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Add Your Channel Logo</span>
                  </Label>
                </FieldLabel>
              </Field>

              {enableLogo && (
                <>
                  <Field orientation="horizontal">
                    <FieldLabel>
                      <Label>Logo File:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-2 w-full">
                        <Input
                          type="text"
                          value={logoFile}
                          placeholder="No file selected"
                          readOnly
                          className="flex-1"
                        />
                        <Button type="button" variant="default" size="sm" onClick={handleBrowse}>
                          Browse...
                        </Button>
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </FieldContent>
                  </Field>

                  <Field orientation="horizontal">
                    <FieldLabel>
                      <Label>Logo Position:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Select value={logoPosition} onValueChange={(value) => setLogoPosition(value || "top-left")}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="top-left">Top Left</SelectItem>
                            <SelectItem value="top-right">Top Right</SelectItem>
                            <SelectItem value="top-center">Top Center</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="bottom-center">Bottom Center</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>
                </>
              )}
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
