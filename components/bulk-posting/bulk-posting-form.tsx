"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent, FieldDescription } from "@/components/ui/field"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxChips,
  ComboboxChipsInput,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, FileUploadIcon, Delete02Icon, File02Icon } from "@hugeicons/core-free-icons"
import { ConnectionSelector } from "./connection-selector"
import { contentSourceTypeOptions } from "./constants"
import type { ContentSourceType, ConnectionSelection } from "./types"
import type { SocialChannel, SocialConnectionGroup } from "@/lib/api"
import { bulkPostingService } from "@/lib/api/services/bulk-posting.service"
import { cn } from "@/lib/utils"
import type { AutoPostingInterval } from "@/components/manual-posting/manual-posting-form"
import { Download04Icon } from "@hugeicons/core-free-icons"

const SCHEDULE_CONDITION_OPTIONS: { value: AutoPostingInterval; label: string }[] = [
  { value: "minute", label: "Minute" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

interface BulkPostingFormProps {
  brandName: string
  projectName: string
  contentSourceType: ContentSourceType | ""
  contentSource: string[]
  csvFile: File | null
  brandLogo: string
  logoPreview: string
  connections: ConnectionSelection
  channels: SocialChannel[]
  groups: SocialConnectionGroup[]
  mediaFolders?: { id: number; name: string }[] | string[]
  isLoadingConnections?: boolean
  dailyAutoPosting: number
  autoPostingInterval: AutoPostingInterval
  dailyRepublishEnabled: boolean
  dailyRepublish: number
  dailyRepublishInterval: AutoPostingInterval
  onBrandNameChange: (value: string) => void
  onProjectNameChange: (value: string) => void
  onContentSourceTypeChange: (value: ContentSourceType) => void
  onContentSourceChange: (value: string[]) => void
  onCsvFileChange: (file: File | null) => void
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveLogo: () => void
  onConnectionsChange: (connections: ConnectionSelection) => void
  onDailyAutoPostingChange: (value: number) => void
  onAutoPostingIntervalChange: (value: AutoPostingInterval) => void
  onDailyRepublishEnabledChange: (value: boolean) => void
  onDailyRepublishChange: (value: number) => void
  onDailyRepublishIntervalChange: (value: AutoPostingInterval) => void
  logoInputId?: string
}

export function BulkPostingForm({
  brandName,
  projectName,
  contentSourceType,
  contentSource,
  csvFile,
  brandLogo,
  logoPreview,
  connections,
  channels,
  groups,
  mediaFolders: mediaFoldersProp,
  isLoadingConnections,
  dailyAutoPosting,
  autoPostingInterval,
  dailyRepublishEnabled,
  dailyRepublish,
  dailyRepublishInterval,
  onBrandNameChange,
  onProjectNameChange,
  onContentSourceTypeChange,
  onContentSourceChange,
  onCsvFileChange,
  onImageChange,
  onRemoveLogo,
  onConnectionsChange,
  onDailyAutoPostingChange,
  onAutoPostingIntervalChange,
  onDailyRepublishEnabledChange,
  onDailyRepublishChange,
  onDailyRepublishIntervalChange,
  logoInputId = "brand-logo-upload",
}: BulkPostingFormProps) {
  const anchorRef = useComboboxAnchor()
  // When Media Upload is selected, only show real MediaUpload folders from API—never demo data
  const folderItems = React.useMemo(() => {
    if (!mediaFoldersProp || !Array.isArray(mediaFoldersProp)) return []
    if (mediaFoldersProp.length === 0) return []
    const first = mediaFoldersProp[0]
    if (typeof first === "object" && first !== null && "id" in first && "name" in first) {
      return mediaFoldersProp as { id: number; name: string }[]
    }
    return (mediaFoldersProp as string[]).map((s, i) => ({ id: i, name: String(s) }))
  }, [mediaFoldersProp])
  const csvInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "text/csv") {
      onCsvFileChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === "text/csv") {
      onCsvFileChange(file)
    }
  }

  const handleRemoveCsvFile = () => {
    onCsvFileChange(null)
    if (csvInputRef.current) {
      csvInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <FieldGroup className="gap-4">
      {/* Brand Information Section */}
      <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
        <div className="text-xs font-medium mb-3">Brand Information</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>
              <Label>Brand Name</Label>
            </FieldLabel>
            <FieldContent>
              <Input
                placeholder="Enter brand name"
                value={brandName}
                onChange={(e) => onBrandNameChange(e.target.value)}
                required
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>
              <Label>Niche Kit Name</Label>
            </FieldLabel>
            <FieldContent>
              <Input
                placeholder="Enter niche kit name"
                value={projectName}
                onChange={(e) => onProjectNameChange(e.target.value)}
                required
              />
            </FieldContent>
          </Field>
        </div>
      </div>

      {/* Content Source Section */}
      <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
        <div className="text-xs font-medium mb-3">Content Source</div>
        
        {/* Content Source Type Selection */}
        <Field orientation="vertical">
          <FieldLabel>
            <Label>Import Method</Label>
          </FieldLabel>
          <FieldContent>
            <Select
              value={contentSourceType}
              onValueChange={(value) => value && onContentSourceTypeChange(value as ContentSourceType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select option">
                  {contentSourceType
                    ? contentSourceTypeOptions.find((opt) => opt.value === contentSourceType)?.label
                    : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {contentSourceTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        {/* Conditional Content Based on Selection */}
        {contentSourceType === "csv_file" && (
          <Field orientation="vertical">
            <FieldLabel>
              <Label>Upload CSV File</Label>
            </FieldLabel>
            <FieldContent>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvFileSelect}
                className="hidden"
                id="csv-file-upload"
              />
              
              {!csvFile ? (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => csvInputRef.current?.click()}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <HugeiconsIcon icon={FileUploadIcon} className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Drop your CSV file here or{" "}
                      <span className="text-primary">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports CSV files only
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <HugeiconsIcon icon={File02Icon} className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{csvFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(csvFile.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCsvFile}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              )}
            </FieldContent>
            <FieldDescription className="flex items-center justify-between gap-2 flex-wrap">
              <span>Upload a CSV file with your content data. The file should contain columns for post content, media URLs, and scheduling information.</span>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-primary"
                onClick={() => bulkPostingService.downloadSampleCsv()}
              >
                <HugeiconsIcon icon={Download04Icon} className="h-4 w-4 mr-1" />
                Download Sample CSV
              </Button>
            </FieldDescription>
          </Field>
        )}

        {contentSourceType === "media_upload" && (
          <Field orientation="vertical">
            <FieldLabel>
              <Label>Select Folders</Label>
            </FieldLabel>
            <FieldContent>
              <Combobox
                items={folderItems}
                multiple
                value={contentSource}
                onValueChange={(value) => onContentSourceChange(value || [])}
                getItemValue={(item) => typeof item === 'object' && item && 'id' in item ? String((item as { id: number; name: string }).id) : String(item)}
                getItemLabel={(item) => typeof item === 'object' && item && 'name' in item ? (item as { id: number; name: string }).name : String(item)}
              >
                <ComboboxChips ref={anchorRef} className="w-full">
                  {contentSource.map((source) => {
                    const folder = folderItems.find((f) => (typeof f === 'object' && f && 'id' in f ? String((f as { id: number; name: string }).id) : f) === source)
                    const label = typeof folder === 'object' && folder && 'name' in folder ? (folder as { id: number; name: string }).name : source
                    return (
                    <div
                      key={source}
                      className="bg-muted text-foreground flex h-6 items-center justify-center gap-1 rounded-sm px-2 text-xs font-medium whitespace-nowrap"
                    >
                      <span>{label}</span>
                      <button
                        type="button"
                        onClick={() => onContentSourceChange(contentSource.filter((s) => s !== source))}
                        className="ml-1 opacity-50 hover:opacity-100 rounded-sm hover:bg-muted-foreground/20 p-0.5"
                        aria-label={`Remove ${label}`}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
                      </button>
                    </div>
                  )})}
                  <ComboboxChipsInput
                    placeholder={contentSource.length === 0 ? "Search and select folders" : "Add more folders..."}
                  />
                </ComboboxChips>
                <ComboboxContent anchor={anchorRef}>
                  <ComboboxEmpty>No folders found.</ComboboxEmpty>
                  <ComboboxList items={folderItems}>
                    {(item) => {
                      const id = typeof item === 'object' && item && 'id' in item ? String((item as { id: number; name: string }).id) : String(item)
                      const name = typeof item === 'object' && item && 'name' in item ? (item as { id: number; name: string }).name : String(item)
                      return (
                        <ComboboxItem key={id} value={id}>
                          {name}
                        </ComboboxItem>
                      )
                    }}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </FieldContent>
            <FieldDescription>
              Select one or more folders from your media library to source content for posting.
            </FieldDescription>
          </Field>
        )}
      </div>

      <Field orientation="vertical">
        <FieldLabel>
          <Label>Connections</Label>
        </FieldLabel>
        <FieldContent>
          <ConnectionSelector
            channels={channels}
            groups={groups}
            selectedConnections={connections}
            onSelectionChange={onConnectionsChange}
            isLoading={isLoadingConnections}
          />
        </FieldContent>
        <FieldDescription>
          Select channels or groups to publish content to. You can select multiple connections.
        </FieldDescription>
      </Field>

      {/* Post Schedule & Re-Post Section */}
      <div className="space-y-6 p-4 border border-border rounded-lg bg-muted/30">
        {/* Post Schedule */}
        <div className="space-y-4">
          <div className="text-xs font-medium">Post Schedule</div>
          <div className="flex flex-nowrap items-center gap-4">
            <Field orientation="horizontal">
              <FieldLabel>
                <Label>Condition</Label>
              </FieldLabel>
              <FieldContent>
                <Select
                  value={autoPostingInterval}
                  onValueChange={(value) => onAutoPostingIntervalChange(value as AutoPostingInterval)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Option">
                      {autoPostingInterval
                        ? SCHEDULE_CONDITION_OPTIONS.find((opt) => opt.value === autoPostingInterval)?.label
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SCHEDULE_CONDITION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel>
                <Label>Interval</Label>
              </FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  value={dailyAutoPosting}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1
                    onDailyAutoPostingChange(Math.max(1, value))
                  }}
                  min={1}
                  className="w-full"
                  placeholder="0"
                  aria-label="Post schedule interval"
                />
              </FieldContent>
            </Field>
          </div>
        </div>

        {/* Re-Post */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-medium">Re-Post</div>
            <Label className="flex items-center gap-2 cursor-pointer text-xs font-normal">
              <input
                type="checkbox"
                checked={dailyRepublishEnabled}
                onChange={(e) => onDailyRepublishEnabledChange(e.target.checked)}
                className="rounded border-border"
              />
              <span>Enable</span>
            </Label>
          </div>
          {dailyRepublishEnabled && (
            <div className="flex flex-nowrap items-center gap-4">
              <Field orientation="horizontal">
                <FieldLabel>
                  <Label>Condition</Label>
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={dailyRepublishInterval}
                    onValueChange={(value) => onDailyRepublishIntervalChange(value as AutoPostingInterval)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Option">
                        {dailyRepublishInterval
                          ? SCHEDULE_CONDITION_OPTIONS.find((opt) => opt.value === dailyRepublishInterval)?.label
                          : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SCHEDULE_CONDITION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
              <Field orientation="horizontal">
                <FieldLabel>
                  <Label>Interval</Label>
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="number"
                    value={dailyRepublish}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0
                      onDailyRepublishChange(Math.max(0, value))
                    }}
                    min={0}
                    className="w-full"
                    placeholder="0"
                    aria-label="Re post interval"
                  />
                </FieldContent>
              </Field>
            </div>
          )}
        </div>
      </div>
    </FieldGroup>
  )
}
