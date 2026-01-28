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
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, SparklesIcon, ImageIcon, SearchIcon, FolderIcon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface OverlayFolder {
  id: string
  path: string
  name: string
}

interface VideoOverlaySectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  stepNumber?: number
  isLastStep?: boolean
}

export function VideoOverlaySection({
  isOpen,
  onOpenChange,
  stepNumber,
  isLastStep = false,
}: VideoOverlaySectionProps) {
  const [enableOverlay, setEnableOverlay] = React.useState(true)
  const [selectedFolders, setSelectedFolders] = React.useState<Set<string>>(new Set())
  const [isFolderPickerOpen, setIsFolderPickerOpen] = React.useState(false)
  const [folderSearch, setFolderSearch] = React.useState("")
  const [blendMode, setBlendMode] = React.useState("screen")
  const [opacity, setOpacity] = React.useState(0.2)

  const folderPickerRef = React.useRef<HTMLDivElement | null>(null)

  // Sample overlay video folders
  const overlayFolders: OverlayFolder[] = [
    { id: "1", path: "Video Overlays / Watermarks / Logo", name: "Watermarks / Logo" },
    { id: "2", path: "Video Overlays / Effects / Particles", name: "Effects / Particles" },
    { id: "3", path: "Video Overlays / Text / Animated", name: "Text / Animated" },
    { id: "4", path: "Video Overlays / Borders / Decorative", name: "Borders / Decorative" },
    { id: "5", path: "Video Overlays / Graphics / Icons", name: "Graphics / Icons" },
    { id: "6", path: "Video Overlays / Transitions / Overlay", name: "Transitions / Overlay" },
  ]

  const toggleFolderSelection = (folderId: string) => {
    setSelectedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const filteredFolders = React.useMemo(() => {
    const q = folderSearch.trim().toLowerCase()
    if (!q) return overlayFolders
    return overlayFolders.filter((f) => f.path.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
  }, [folderSearch])

  React.useEffect(() => {
    if (!isFolderPickerOpen) return
    const onPointerDown = (e: PointerEvent) => {
      const el = folderPickerRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) {
        setIsFolderPickerOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [isFolderPickerOpen])

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <HugeiconsIcon icon={SparklesIcon} className="size-4" />
                {stepNumber && `Step ${stepNumber}: `}Video Overlay Settings
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
                      checked={enableOverlay}
                      onChange={(e) => setEnableOverlay(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Enable Video Overlay</span>
                  </Label>
                </FieldLabel>
              </Field>

              {enableOverlay && (
                <>
                  <Field orientation="horizontal" className="flex-col items-stretch">
                    <FieldLabel>
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={ImageIcon} className="size-4" />
                        <Label>Overlay Video:</Label>
                      </div>
                    </FieldLabel>
                    <FieldContent className="w-full min-w-0">
                      <div ref={folderPickerRef} className="relative w-full min-w-0">
                        {/* Single-line input with chips + search */}
                        <div
                          onClick={() => setIsFolderPickerOpen((v) => !v)}
                          className={cn(
                            "min-h-9 w-full max-w-none min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm",
                            "flex items-center gap-1 flex-wrap cursor-pointer",
                            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                            isFolderPickerOpen && "border-ring ring-ring/50 ring-[3px]"
                          )}
                        >
                          {selectedFolders.size > 0 ? (
                            <>
                              {Array.from(selectedFolders).map((folderId) => {
                                const folder = overlayFolders.find((f) => f.id === folderId)
                                if (!folder) return null
                                return (
                                  <Badge
                                    key={folderId}
                                    variant="secondary"
                                    className="gap-1 pr-1 max-w-full"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleFolderSelection(folderId)
                                    }}
                                  >
                                    <span className="truncate max-w-[220px]">{folder.name}</span>
                                  </Badge>
                                )
                              })}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {selectedFolders.size} selected
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Search & select folders…</span>
                          )}

                          <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            className={cn(
                              "size-4 ml-auto text-muted-foreground transition-transform",
                              isFolderPickerOpen && "rotate-180"
                            )}
                          />
                        </div>

                        {isFolderPickerOpen && (
                          <div className="absolute z-50 mt-2 w-full rounded-lg border border-border bg-background shadow-lg p-2">
                            <Input
                              value={folderSearch}
                              onChange={(e) => setFolderSearch(e.target.value)}
                              placeholder="Search folders…"
                              className="h-8"
                            />

                            <div className="mt-2 max-h-56 overflow-y-auto">
                              {filteredFolders.length === 0 ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                  No folders found.
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {filteredFolders.map((folder) => (
                                    <label
                                      key={folder.id}
                                      className={cn(
                                        "flex items-center gap-3 p-2 rounded cursor-pointer transition-colors",
                                        selectedFolders.has(folder.id)
                                          ? "bg-primary/10 border border-primary/20"
                                          : "hover:bg-muted/50"
                                      )}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedFolders.has(folder.id)}
                                        onChange={() => toggleFolderSelection(folder.id)}
                                        className="rounded border-border cursor-pointer size-4"
                                      />
                                      <HugeiconsIcon
                                        icon={FolderIcon}
                                        className="size-4 text-muted-foreground shrink-0"
                                      />
                                      <span className="text-sm flex-1 truncate">{folder.path}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </FieldContent>
                  </Field>

                  <Field orientation="horizontal">
                    <FieldLabel>
                      <Label>Blend Mode:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Select value={blendMode} onValueChange={(value) => setBlendMode(value || "screen")}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="multiply">Multiply</SelectItem>
                            <SelectItem value="screen">Screen</SelectItem>
                            <SelectItem value="overlay">Overlay</SelectItem>
                            <SelectItem value="soft-light">Soft Light</SelectItem>
                            <SelectItem value="hard-light">Hard Light</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FieldContent>
                  </Field>

                  <Field orientation="horizontal">
                    <FieldLabel>
                      <Label>Opacity:</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-3 w-full">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={opacity}
                          onChange={(e) => setOpacity(parseFloat(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-sm text-muted-foreground w-12 text-right">{opacity.toFixed(1)}</span>
                      </div>
                    </FieldContent>
                  </Field>

                  <div className="flex items-center gap-3">
                    <Button type="button" variant="default" size="sm">
                      <HugeiconsIcon icon={SearchIcon} className="size-4 mr-2" />
                      Preview Overlay
                    </Button>
                    <p className="text-sm text-muted-foreground">Select an overlay to see details</p>
                  </div>
                </>
              )}
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
