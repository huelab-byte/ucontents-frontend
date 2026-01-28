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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, FileIcon, FloppyDiskIcon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { GeneratedVideo } from "./types"

interface VideoTemplateSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  stepNumber?: number
  isLastStep?: boolean
  videos?: GeneratedVideo[]
}

export function VideoTemplateSection({
  isOpen,
  onOpenChange,
  stepNumber = 1,
  isLastStep = false,
  videos = [],
}: VideoTemplateSectionProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState("")
  const [savedPresetName, setSavedPresetName] = React.useState<string | null>(null)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = React.useState(false)
  const [presetName, setPresetName] = React.useState("")
  const draftCount = videos.filter((video) => video.status === "draft").length

  const videoTemplates = [
    { id: "standard", name: "Standard Video", description: "Traditional video format" },
    { id: "short-form", name: "Short Form Video", description: "Optimized for social media" },
    { id: "long-form", name: "Long Form Video", description: "Extended content format" },
    { id: "tutorial", name: "Tutorial Video", description: "Educational content format" },
    { id: "promotional", name: "Promotional Video", description: "Marketing and advertising" },
    { id: "storytelling", name: "Storytelling Video", description: "Narrative-driven content" },
  ]

  const handleSavePreset = () => {
    setIsSaveDialogOpen(true)
  }

  const handleConfirmSave = () => {
    if (presetName.trim()) {
      // Save the preset with all current settings
      // In a real app, this would save to a backend or local storage
      setSavedPresetName(presetName.trim())
      setIsSaveDialogOpen(false)
      setPresetName("")
    }
  }

  const handleCancelSave = () => {
    setIsSaveDialogOpen(false)
    setPresetName("")
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
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      Step {stepNumber}: Video Generation Template
                    </CardTitle>
                    {draftCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({draftCount} draft{draftCount !== 1 ? "s" : ""})
                      </span>
                    )}
                  </div>
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
              {/* Template Selection */}
              <Field orientation="horizontal" className="flex-col">
                <FieldLabel>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={FileIcon} className="size-4" />
                    <Label>Select Template</Label>
                  </div>
                </FieldLabel>
                <FieldContent className="w-full min-w-0">
                  <div className="flex items-center gap-2">
                    <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value || "")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a video template" />
                      </SelectTrigger>
                      <SelectContent>
                        {videoTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex flex-col">
                              <span>{template.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {template.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleSavePreset}
                      className="shrink-0"
                      title="Save Preset"
                    >
                      <HugeiconsIcon icon={FloppyDiskIcon} className="size-4" />
                    </Button>
                  </div>
                  {savedPresetName && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Saved as: <span className="font-medium text-foreground">{savedPresetName}</span>
                    </p>
                  )}
                </FieldContent>
              </Field>
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>

      {/* Save Preset Dialog */}
      <AlertDialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <AlertDialogContent className="max-w-md w-full mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Save Preset</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <Field>
              <FieldLabel>
                <Label>Preset Name</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  placeholder="Enter preset name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && presetName.trim()) {
                      handleConfirmSave()
                    }
                  }}
                  autoFocus
                />
              </FieldContent>
            </Field>
            <p className="text-xs text-muted-foreground">
              This will save all current settings as a preset that you can reuse later.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSave}>Cancel</AlertDialogCancel>
            <Button onClick={handleConfirmSave} disabled={!presetName.trim()}>
              Save Preset
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
