"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, EyeIcon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { SubtitlePreviewDialog } from "./subtitle-preview-dialog"

interface SubtitleSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  stepNumber?: number
  isLastStep?: boolean
  aspectRatio?: "9:16" | "16:9"
}

export function SubtitleSection({
  isOpen,
  onOpenChange,
  stepNumber = 5,
  isLastStep = false,
  aspectRatio = "9:16",
}: SubtitleSectionProps) {
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [isEnabled, setIsEnabled] = React.useState(true)
  const [subtitleType, setSubtitleType] = React.useState<"subtitle" | "caption">("subtitle")
  const [subtitlePreset, setSubtitlePreset] = React.useState("default")
  const [generateSubtitles, setGenerateSubtitles] = React.useState(true)
  const [useKaraokeStyle, setUseKaraokeStyle] = React.useState(true)
  const [subtitleFont, setSubtitleFont] = React.useState("TitanOne")

  // Available fonts list
  const availableFonts = [
    "TitanOne",
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
    "Palatino",
    "Impact",
    "Comic Sans MS",
    "Trebuchet MS",
    "Arial Black",
    "Lucida Console",
  ]
  const [fontColor, setFontColor] = React.useState("#FFFFFF")
  const [fontSize, setFontSize] = React.useState(40)
  const [outlineColor, setOutlineColor] = React.useState("#000000")
  const [outlineSize, setOutlineSize] = React.useState(3)
  const [captionPosition, setCaptionPosition] = React.useState("bottom")
  const [customPositionX, setCustomPositionX] = React.useState(50)
  const [customPositionY, setCustomPositionY] = React.useState(50)
  const [wordsPerCaption, setWordsPerCaption] = React.useState(3)
  const [enableWordHighlighting, setEnableWordHighlighting] = React.useState(true)
  const [backgroundOpacity, setBackgroundOpacity] = React.useState(60)
  const [highlightColor, setHighlightColor] = React.useState("#FFFF00")
  const [highlightStyle, setHighlightStyle] = React.useState("text-color")

  // Apply preset when selected
  React.useEffect(() => {
    if (subtitlePreset === "default") {
      setSubtitleFont("TitanOne")
      setFontColor("#FFFFFF")
      setFontSize(40)
      setOutlineColor("#000000")
      setOutlineSize(3)
      setCaptionPosition("bottom")
      setWordsPerCaption(3)
      setEnableWordHighlighting(true)
      setBackgroundOpacity(60)
      setHighlightColor("#FFFF00")
      setHighlightStyle("text-color")
    } else if (subtitlePreset === "minimal") {
      setSubtitleFont("Arial")
      setFontColor("#FFFFFF")
      setFontSize(32)
      setOutlineColor("#000000")
      setOutlineSize(2)
      setCaptionPosition("bottom")
      setWordsPerCaption(4)
      setEnableWordHighlighting(false)
      setBackgroundOpacity(0)
      setHighlightColor("#FFFF00")
      setHighlightStyle("text-color")
    } else if (subtitlePreset === "bold") {
      setSubtitleFont("Impact")
      setFontColor("#FFFFFF")
      setFontSize(48)
      setOutlineColor("#000000")
      setOutlineSize(5)
      setCaptionPosition("bottom")
      setWordsPerCaption(3)
      setEnableWordHighlighting(true)
      setBackgroundOpacity(80)
      setHighlightColor("#FF0000")
      setHighlightStyle("background")
    } else if (subtitlePreset === "instagram") {
      setSubtitleFont("Helvetica")
      setFontColor("#FFFFFF")
      setFontSize(36)
      setOutlineColor("#000000")
      setOutlineSize(4)
      setCaptionPosition("instagram-style")
      setWordsPerCaption(3)
      setEnableWordHighlighting(true)
      setBackgroundOpacity(70)
      setHighlightColor("#FFFF00")
      setHighlightStyle("text-color")
    }
  }, [subtitlePreset])

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
                    Step {stepNumber}: Subtitle Options
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
            {/* Toggle Button */}
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <Label className="text-sm font-medium">Enable Subtitle Options</Label>
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
              <div className="space-y-6">
                {/* Subtitle/Caption Type Selection */}
                <Field>
                  <FieldLabel>
                    <Label>Type</Label>
                  </FieldLabel>
                  <FieldContent>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={subtitleType === "subtitle" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSubtitleType("subtitle")}
                        className="flex-1"
                      >
                        Subtitle
                      </Button>
                      <Button
                        type="button"
                        variant={subtitleType === "caption" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSubtitleType("caption")}
                        className="flex-1"
                      >
                        Caption
                      </Button>
                    </div>
                  </FieldContent>
                </Field>

                {/* Subtitle Preset Selection */}
                <Field orientation="horizontal" className="flex-col">
                  <FieldLabel>
                    <Label>Subtitle Preset</Label>
                  </FieldLabel>
                  <FieldContent className="w-full min-w-0">
                    <Select value={subtitlePreset} onValueChange={(value) => setSubtitlePreset(value || "default")}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a preset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="instagram">Instagram Style</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>

                {/* Subtitle Options */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Subtitle Options</h3>
                  <FieldGroup className="gap-4">
                <Field orientation="horizontal" className="flex-col">
                  <FieldLabel>
                    <Label htmlFor="generate-subtitles-checkbox" className="cursor-pointer">
                      Generate Subtitles
                    </Label>
                  </FieldLabel>
                  <FieldContent>
                    <input
                      id="generate-subtitles-checkbox"
                      type="checkbox"
                      checked={generateSubtitles}
                      onChange={(e) => setGenerateSubtitles(e.target.checked)}
                      className="rounded border-border cursor-pointer size-4"
                    />
                  </FieldContent>
                </Field>

                <Field orientation="horizontal" className="flex-col">
                  <FieldLabel>
                    <Label htmlFor="karaoke-style-checkbox" className="cursor-pointer">
                      Use Karaoke Style (If subtitles enabled)
                    </Label>
                  </FieldLabel>
                  <FieldContent>
                    <input
                      id="karaoke-style-checkbox"
                      type="checkbox"
                      checked={useKaraokeStyle && generateSubtitles}
                      onChange={(e) => setUseKaraokeStyle(e.target.checked)}
                      disabled={!generateSubtitles}
                      className="rounded border-border cursor-pointer size-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>
            </div>

            {/* Subtitle Styling */}
            {generateSubtitles && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Subtitle Styling</h3>
                <FieldGroup className="gap-4">
                  {/* Subtitle Font */}
                  <Field orientation="horizontal" className="flex-col">
                    <FieldLabel>
                      <Label>Subtitle Font</Label>
                    </FieldLabel>
                    <FieldContent className="w-full min-w-0">
                      <div className="w-full space-y-1">
                        <Select value={subtitleFont} onValueChange={(value) => setSubtitleFont(value || "TitanOne")}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFonts.map((font) => (
                              <SelectItem key={font} value={font}>
                                <span style={{ fontFamily: font }}>{font}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Add your own .ttf or .otf fonts to the &apos;font&apos; folder
                        </p>
                      </div>
                    </FieldContent>
                  </Field>

                  {/* Font Color */}
                  <Field orientation="horizontal" className="flex-col">
                    <FieldLabel>
                      <Label>Font Color:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={fontColor}
                          onChange={(e) => setFontColor(e.target.value)}
                          className="w-10 h-8 rounded border border-border cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={fontColor}
                          onChange={(e) => setFontColor(e.target.value)}
                          placeholder="#FFFFFF"
                          className="w-24"
                        />
                      </div>
                    </FieldContent>
                  </Field>

                  {/* Font Size */}
                  <Field>
                    <FieldLabel>
                      <Label>Font Size:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                          <input
                            type="range"
                            min={10}
                            max={100}
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((fontSize - 10) / 90) * 100}%, hsl(var(--muted)) ${((fontSize - 10) / 90) * 100}%, hsl(var(--muted)) 100%)`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[60px] text-right">
                          {fontSize}px
                        </span>
                      </div>
                    </FieldContent>
                  </Field>

                  {/* Outline Color */}
                  <Field orientation="horizontal" className="flex-col">
                    <FieldLabel>
                      <Label>Outline Color:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={outlineColor}
                          onChange={(e) => setOutlineColor(e.target.value)}
                          className="w-10 h-8 rounded border border-border cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={outlineColor}
                          onChange={(e) => setOutlineColor(e.target.value)}
                          placeholder="#000000"
                          className="w-24"
                        />
                      </div>
                    </FieldContent>
                  </Field>

                  {/* Outline Size */}
                  <Field>
                    <FieldLabel>
                      <Label>Outline Size:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                          <input
                            type="range"
                            min={0}
                            max={10}
                            value={outlineSize}
                            onChange={(e) => setOutlineSize(Number(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(outlineSize / 10) * 100}%, hsl(var(--muted)) ${(outlineSize / 10) * 100}%, hsl(var(--muted)) 100%)`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[60px] text-right">
                          {outlineSize}px
                        </span>
                      </div>
                    </FieldContent>
                  </Field>

                  {/* Caption Position */}
                  <Field orientation="horizontal" className="flex-row flex-wrap">
                    <FieldLabel>
                      <Label>Caption Position:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-4 flex-wrap">
                        {["top", "center", "bottom", "instagram-style", "custom"].map((position) => (
                          <label key={position} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="caption-position"
                              value={position}
                              checked={captionPosition === position}
                              onChange={(e) => setCaptionPosition(e.target.value)}
                              className="cursor-pointer"
                            />
                            <span className="text-sm capitalize">
                              {position.replace("-", " ")}
                            </span>
                          </label>
                        ))}
                      </div>
                    </FieldContent>
                  </Field>

                  {/* Advanced Offset Control - Custom Position */}
                  {captionPosition === "custom" && (
                    <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                      <Label className="text-sm font-semibold">Advanced Offset Control</Label>
                      <FieldGroup className="gap-3">
                        {/* X Position (Horizontal) */}
                        <Field>
                          <FieldLabel>
                            <Label>X Position (Horizontal):</Label>
                          </FieldLabel>
                          <FieldContent>
                            <div className="flex items-center gap-4">
                              <div className="flex-1 relative">
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={customPositionX}
                                  onChange={(e) => setCustomPositionX(Number(e.target.value))}
                                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                                  style={{
                                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${customPositionX}%, hsl(var(--muted)) ${customPositionX}%, hsl(var(--muted)) 100%)`,
                                  }}
                                />
                              </div>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={customPositionX}
                                onChange={(e) => {
                                  const value = Number(e.target.value)
                                  if (value >= 0 && value <= 100) {
                                    setCustomPositionX(value)
                                  }
                                }}
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">%</span>
                            </div>
                          </FieldContent>
                        </Field>

                        {/* Y Position (Vertical) */}
                        <Field>
                          <FieldLabel>
                            <Label>Y Position (Vertical):</Label>
                          </FieldLabel>
                          <FieldContent>
                            <div className="flex items-center gap-4">
                              <div className="flex-1 relative">
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  value={customPositionY}
                                  onChange={(e) => setCustomPositionY(Number(e.target.value))}
                                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                                  style={{
                                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${customPositionY}%, hsl(var(--muted)) ${customPositionY}%, hsl(var(--muted)) 100%)`,
                                  }}
                                />
                              </div>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={customPositionY}
                                onChange={(e) => {
                                  const value = Number(e.target.value)
                                  if (value >= 0 && value <= 100) {
                                    setCustomPositionY(value)
                                  }
                                }}
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">%</span>
                            </div>
                          </FieldContent>
                        </Field>
                      </FieldGroup>
                    </div>
                  )}

                  {/* Words Per Caption */}
                  <Field orientation="horizontal" className="flex-col">
                    <FieldLabel>
                      <Label>Words Per Caption</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={wordsPerCaption}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          if (value >= 1 && value <= 10) {
                            setWordsPerCaption(value)
                          }
                        }}
                        className="w-full"
                      />
                    </FieldContent>
                  </Field>

                  {/* Enable Word Highlighting */}
                  <Field orientation="horizontal" className="flex-col">
                    <FieldLabel>
                      <Label htmlFor="word-highlighting-checkbox" className="cursor-pointer">
                        Enable word highlighting
                      </Label>
                    </FieldLabel>
                    <FieldContent>
                      <input
                        id="word-highlighting-checkbox"
                        type="checkbox"
                        checked={enableWordHighlighting}
                        onChange={(e) => setEnableWordHighlighting(e.target.checked)}
                        className="rounded border-border cursor-pointer size-4"
                      />
                    </FieldContent>
                  </Field>

                  {/* Background Opacity */}
                  <Field>
                    <FieldLabel>
                      <Label>Background Opacity:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={backgroundOpacity}
                            onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${backgroundOpacity}%, hsl(var(--muted)) ${backgroundOpacity}%, hsl(var(--muted)) 100%)`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[50px] text-right">
                          {backgroundOpacity}%
                        </span>
                      </div>
                    </FieldContent>
                  </Field>

                  {/* Highlight Color */}
                  <Field orientation="horizontal" className="flex-col">
                    <FieldLabel>
                      <Label>Highlight Color:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={highlightColor}
                          onChange={(e) => setHighlightColor(e.target.value)}
                          className="w-10 h-8 rounded border border-border cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={highlightColor}
                          onChange={(e) => setHighlightColor(e.target.value)}
                          placeholder="#FFFF00"
                          className="w-24"
                        />
                      </div>
                    </FieldContent>
                  </Field>

                  {/* Highlight Style */}
                  <Field>
                    <FieldLabel>
                      <Label>Highlight Style:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-4">
                        {["text-color", "background"].map((style) => (
                          <label key={style} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="highlight-style"
                              value={style}
                              checked={highlightStyle === style}
                              onChange={(e) => setHighlightStyle(e.target.value)}
                              className="cursor-pointer"
                            />
                            <span className="text-sm capitalize">
                              {style.replace("-", " ")}
                            </span>
                          </label>
                        ))}
                      </div>
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </div>
            )}

                {/* Preview Button */}
                <div className="pt-2">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setIsPreviewOpen(true)}
                  >
                    <HugeiconsIcon icon={EyeIcon} className="size-4 mr-2" />
                    Preview Subtitle Design
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
    
    {/* Preview Dialog */}
    <SubtitlePreviewDialog
      isOpen={isPreviewOpen}
      onClose={() => setIsPreviewOpen(false)}
      aspectRatio={aspectRatio}
      subtitleSettings={{
        font: subtitleFont,
        fontColor,
        fontSize,
        outlineColor,
        outlineSize,
        captionPosition,
        enableWordHighlighting,
        backgroundOpacity,
        highlightColor,
        highlightStyle,
      }}
    />
    </div>
  )
}
