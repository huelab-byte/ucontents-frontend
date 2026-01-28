"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, PlayIcon, FolderIcon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface FootageLibrarySectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  stepNumber?: number
  isLastStep?: boolean
}

interface FootageFolder {
  id: string
  path: string
  name: string
}

export function FootageLibrarySection({
  isOpen,
  onOpenChange,
  stepNumber = 7,
  isLastStep = false,
}: FootageLibrarySectionProps) {
  const [selectedFolders, setSelectedFolders] = React.useState<Set<string>>(new Set())
  const [clipLength, setClipLength] = React.useState("1.5")
  const [mergeStrategy, setMergeStrategy] = React.useState<"random" | "ai-auto">("ai-auto")
  const [isFolderPickerOpen, setIsFolderPickerOpen] = React.useState(false)
  const [folderSearch, setFolderSearch] = React.useState("")

  const folderPickerRef = React.useRef<HTMLDivElement | null>(null)

  // Sample footage library folders
  const footageLibraryFolders: FootageFolder[] = [
    { id: "1", path: "Footage Library / FutureBike / Sho...", name: "FutureBike / Sho..." },
    { id: "2", path: "Footage Library / FutureBike / Clos...", name: "FutureBike / Clos..." },
    { id: "3", path: "Footage Library / Abstract / Neon L...", name: "Abstract / Neon L..." },
    { id: "4", path: "Footage Library / Outdoor / City", name: "Outdoor / City" },
    { id: "5", path: "Footage Library / Technology / AI", name: "Technology / AI" },
    { id: "6", path: "Footage Library / Nature / Forest", name: "Nature / Forest" },
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
    if (!q) return footageLibraryFolders
    return footageLibraryFolders.filter((f) => f.path.toLowerCase().includes(q) || f.name.toLowerCase().includes(q))
  }, [folderSearch, footageLibraryFolders])

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
                    Step {stepNumber}: Footage Library
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
          <CardContent className="space-y-6">
            <FieldGroup className="gap-4">
              {/* Footage Library Folder Selection */}
              <Field orientation="horizontal" className="flex-col items-stretch">
                <FieldLabel>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={PlayIcon} className="size-4" />
                    <Label>Footage Library</Label>
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
                            const folder = footageLibraryFolders.find((f) => f.id === folderId)
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

              {/* Merge Rules */}
              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <HugeiconsIcon icon={ArrowDown01Icon} className="size-4 rotate-180" />
                  <Label className="text-sm font-semibold">Merge Rules</Label>
                </div>

                {/* Clip Length */}
                <Field orientation="horizontal" className="flex-col">
                  <FieldLabel>
                    <Label>CLIP LENGTH</Label>
                  </FieldLabel>
                  <FieldContent>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={clipLength}
                        onChange={(e) => setClipLength(e.target.value)}
                        placeholder="1.5"
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">s</span>
                    </div>
                  </FieldContent>
                </Field>

                {/* Merge Strategy */}
                <Field orientation="vertical">
                  <FieldLabel>
                    <Label>MERGE STRATEGY</Label>
                  </FieldLabel>
                  <FieldContent>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="merge-strategy"
                          value="random"
                          checked={mergeStrategy === "random"}
                          onChange={(e) => setMergeStrategy(e.target.value as "random" | "ai-auto")}
                          className="cursor-pointer"
                        />
                        <span className="text-sm">Random from selected folders</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="merge-strategy"
                          value="ai-auto"
                          checked={mergeStrategy === "ai-auto"}
                          onChange={(e) => setMergeStrategy(e.target.value as "random" | "ai-auto")}
                          className="cursor-pointer"
                        />
                        <span className="text-sm">AI Auto Match Merging</span>
                      </label>
                    </div>
                  </FieldContent>
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
    </div>
  )
}
