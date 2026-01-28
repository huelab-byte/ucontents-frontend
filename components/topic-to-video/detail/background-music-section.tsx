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
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, MusicNote01Icon, Upload01Icon, Cancel01Icon, PlayIcon, PauseIcon } from "@hugeicons/core-free-icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface BackgroundMusicSectionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  stepNumber?: number
  isLastStep?: boolean
}

export function BackgroundMusicSection({
  isOpen,
  onOpenChange,
  stepNumber = 4,
  isLastStep = false,
}: BackgroundMusicSectionProps) {
  const [addBackgroundMusic, setAddBackgroundMusic] = React.useState(true)
  const [selectedFolders, setSelectedFolders] = React.useState<Set<string>>(new Set(["ambient"]))
  const [bgmSourcing, setBgmSourcing] = React.useState("library")
  const [musicVolume, setMusicVolume] = React.useState(20)
  const [endPauseDuration, setEndPauseDuration] = React.useState(3.5)
  const [isDragging, setIsDragging] = React.useState(false)
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([])
  const [isMusicSelectionOpen, setIsMusicSelectionOpen] = React.useState(false)
  const [playingAudio, setPlayingAudio] = React.useState<{ type: "uploaded" | "library"; id: string } | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const musicSelectionRef = React.useRef<HTMLDivElement>(null)

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

  // Sample BGM library folders with track counts
  const bgmLibraryFolders = [
    { id: "ambient", name: "Ambient", trackCount: 12 },
    { id: "upbeat", name: "Upbeat", trackCount: 8 },
    { id: "calm", name: "Calm", trackCount: 15 },
    { id: "energetic", name: "Energetic", trackCount: 10 },
    { id: "cinematic", name: "Cinematic", trackCount: 20 },
    { id: "corporate", name: "Corporate", trackCount: 6 },
  ]

  // Calculate total track count from selected folders
  const totalTrackCount = Array.from(selectedFolders).reduce((total, folderId) => {
    const folder = bgmLibraryFolders.find((f) => f.id === folderId)
    return total + (folder?.trackCount || 0)
  }, 0)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (musicSelectionRef.current && !musicSelectionRef.current.contains(event.target as Node)) {
        setIsMusicSelectionOpen(false)
      }
    }

    if (isMusicSelectionOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMusicSelectionOpen])

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const newFiles = Array.from(files)
      setUploadedFiles((prev) => [...prev, ...newFiles])
    }
  }

  // Create object URLs for uploaded files
  const getFileUrl = (file: File) => {
    return URL.createObjectURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    // Stop playing if the removed file was playing
    if (playingAudio?.type === "uploaded" && playingAudio.id === `uploaded-${index}`) {
      handleStopAudio()
    }
  }

  const handlePlayAudio = (type: "uploaded" | "library", id: string, audioUrl?: string) => {
    // If clicking the same audio, toggle pause/play
    if (playingAudio?.type === type && playingAudio.id === id) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play()
        } else {
          audioRef.current.pause()
          setPlayingAudio(null)
        }
      }
      return
    }

    // Stop current audio if playing different one
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    // Create audio element for uploaded files
    if (type === "uploaded" && audioUrl) {
      const audio = new Audio(audioUrl)
      audio.volume = musicVolume / 100
      audioRef.current = audio
      setPlayingAudio({ type, id })

      audio.play().catch((error) => {
        setPlayingAudio(null)
        audioRef.current = null
      })

      audio.onended = () => {
        setPlayingAudio(null)
        if (audioRef.current) {
          audioRef.current = null
        }
      }

      audio.onerror = () => {
        setPlayingAudio(null)
        audioRef.current = null
      }
    } else if (type === "library") {
      // For library tracks, create a placeholder audio
      // In production, replace with actual audio URL from your BGM library API
      const audio = new Audio()
      audio.volume = musicVolume / 100
      // TODO: Replace with actual library track URL
      // audio.src = `/api/bgm-library/${id}/stream` or similar
      audioRef.current = audio
      setPlayingAudio({ type, id })
      
      // For now, just show the play state (actual playback would require library integration)
      // audio.play().catch(console.error)
    }
  }

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setPlayingAudio(null)
  }

  // Cleanup audio on unmount
  React.useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
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
                    Step {stepNumber}: Background Music Control
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
              <Label className="text-sm font-medium">Enable Background Music</Label>
              <Button
                variant={addBackgroundMusic ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setAddBackgroundMusic(!addBackgroundMusic)
                }}
                className="min-w-[80px]"
              >
                {addBackgroundMusic ? "Turn Off" : "Turn On"}
              </Button>
            </div>

            {addBackgroundMusic && (
              <FieldGroup className="gap-4">
                {/* BGM Sourcing */}
                <Field orientation="horizontal" className="flex-col">
                  <FieldLabel>
                    <Label>BGM Sourcing</Label>
                  </FieldLabel>
                  <FieldContent>
                    <Select value={bgmSourcing} onValueChange={(value) => setBgmSourcing(value || "library")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sourcing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="library">BGM Library</SelectItem>
                        <SelectItem value="upload">Manual Upload</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>

                {/* Music Selection - Multi-select folders from BGM Library */}
                {(bgmSourcing === "library" || bgmSourcing === "both") && (
                  <Field>
                    <FieldLabel>
                      <Label>Music Selection</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div ref={musicSelectionRef} className="relative w-full">
                        {/* Single-line input with chips */}
                        <div
                          onClick={() => setIsMusicSelectionOpen(!isMusicSelectionOpen)}
                          className={cn(
                            "min-h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm",
                            "flex items-center gap-1 flex-wrap cursor-pointer",
                            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                            isMusicSelectionOpen && "border-ring ring-ring/50 ring-[3px]"
                          )}
                        >
                          {selectedFolders.size > 0 ? (
                            <>
                              {Array.from(selectedFolders).map((folderId) => {
                                const folder = bgmLibraryFolders.find((f) => f.id === folderId)
                                if (!folder) return null
                                return (
                                  <Badge
                                    key={folderId}
                                    variant="secondary"
                                    className="gap-1 pr-1"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleFolderSelection(folderId)
                                    }}
                                  >
                                    {folder.name}
                                    <HugeiconsIcon
                                      icon={Cancel01Icon}
                                      className="size-3 cursor-pointer hover:text-destructive"
                                    />
                                  </Badge>
                                )
                              })}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {totalTrackCount} track{totalTrackCount !== 1 ? "s" : ""}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Select folders...</span>
                          )}
                          <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            className={cn(
                              "size-4 ml-auto text-muted-foreground transition-transform",
                              isMusicSelectionOpen && "rotate-180"
                            )}
                          />
                        </div>

                        {/* Dropdown with checkboxes */}
                        {isMusicSelectionOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-md max-h-64 overflow-y-auto">
                            <div className="p-2 space-y-1">
                              {bgmLibraryFolders.map((folder) => (
                                <div
                                  key={folder.id}
                                  className="flex items-center gap-2 p-2 rounded hover:bg-muted/50"
                                >
                                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={selectedFolders.has(folder.id)}
                                      onChange={() => toggleFolderSelection(folder.id)}
                                      className="rounded border-border cursor-pointer size-4"
                                    />
                                    <span className="text-sm flex-1">{folder.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({folder.trackCount} tracks)
                                    </span>
                                  </label>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handlePlayAudio("library", folder.id)
                                    }}
                                    className="h-7 w-7 p-0 shrink-0"
                                  >
                                    <HugeiconsIcon
                                      icon={playingAudio?.type === "library" && playingAudio.id === folder.id ? PauseIcon : PlayIcon}
                                      className="size-3.5"
                                    />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            {selectedFolders.size > 0 && (
                              <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30">
                                <p className="text-xs text-muted-foreground">
                                  {selectedFolders.size} folder{selectedFolders.size !== 1 ? "s" : ""} selected
                                </p>
                                <p className="text-xs font-medium">
                                  {totalTrackCount} track{totalTrackCount !== 1 ? "s" : ""} total
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </FieldContent>
                  </Field>
                )}

                  {/* Music Volume */}
                  <Field>
                    <FieldLabel>
                      <Label>Music Volume</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={musicVolume}
                            onChange={(e) => setMusicVolume(Number(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${musicVolume}%, hsl(var(--muted)) ${musicVolume}%, hsl(var(--muted)) 100%)`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[50px] text-right">
                          {musicVolume}%
                        </span>
                      </div>
                    </FieldContent>
                  </Field>

                  {/* End Pause Duration */}
                  <Field>
                    <FieldLabel>
                      <Label>End Pause Duration</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                          <input
                            type="range"
                            min={0}
                            max={10}
                            step={0.1}
                            value={endPauseDuration}
                            onChange={(e) => setEndPauseDuration(Number(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(endPauseDuration / 10) * 100}%, hsl(var(--muted)) ${(endPauseDuration / 10) * 100}%, hsl(var(--muted)) 100%)`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[50px] text-right">
                          {endPauseDuration}s
                        </span>
                      </div>
                    </FieldContent>
                  </Field>

                  {/* Manual Upload Background Music */}
                  {(bgmSourcing === "upload" || bgmSourcing === "both") && (
                    <Field>
                      <FieldLabel>
                        <Label>Manual upload background music</Label>
                      </FieldLabel>
                    <FieldContent>
                      <div className="space-y-3">
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                            isDragging
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          <HugeiconsIcon 
                            icon={Upload01Icon} 
                            className={cn(
                              "size-12 mx-auto mb-3 transition-colors",
                              isDragging ? "text-primary" : "text-muted-foreground"
                            )} 
                          />
                          <p className="text-sm text-muted-foreground mb-2">
                            drag & drop BGM files
                          </p>
                          <p className="text-xs text-muted-foreground">
                            or click to browse
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="audio/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />

                        {/* Uploaded Files List */}
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {uploadedFiles.map((file, index) => {
                                const fileId = `uploaded-${index}`
                                const isPlaying = playingAudio?.type === "uploaded" && playingAudio.id === fileId
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border border-border"
                                  >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <HugeiconsIcon 
                                        icon={MusicNote01Icon} 
                                        className="size-4 text-muted-foreground shrink-0" 
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {formatFileSize(file.size)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handlePlayAudio("uploaded", fileId, getFileUrl(file))
                                        }}
                                        className="h-7 w-7 p-0"
                                      >
                                        <HugeiconsIcon
                                          icon={isPlaying ? PauseIcon : PlayIcon}
                                          className="size-3.5"
                                        />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleRemoveFile(index)
                                        }}
                                        className="h-7 w-7 p-0"
                                      >
                                        <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </FieldContent>
                  </Field>
                  )}
              </FieldGroup>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
    </div>
  )
}
