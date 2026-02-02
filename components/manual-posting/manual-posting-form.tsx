"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldGroup, FieldLabel, FieldContent, FieldDescription } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { HelpCircleIcon, ArrowUp01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { PlatformConnectionButtons } from "./platform-connection-buttons"
import { contentSources } from "./constants"
import type { ManualPostingItem } from "./types"

export type AutoPostingInterval = "minute" | "hourly" | "daily" | "weekly" | "monthly" | ""

const SCHEDULE_CONDITION_OPTIONS: { value: AutoPostingInterval; label: string }[] = [
  { value: "minute", label: "Minute" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

interface ManualPostingFormProps {
  brandName: string
  projectName: string
  contentSource: string[]
  brandLogo: string
  logoPreview: string
  connectedTo: ManualPostingItem["connectedTo"]
  dailyAutoPosting: number
  autoPostingInterval: AutoPostingInterval
  dailyRepublishEnabled: boolean
  dailyRepublish: number
  dailyRepublishInterval: AutoPostingInterval
  onBrandNameChange: (value: string) => void
  onProjectNameChange: (value: string) => void
  onContentSourceChange: (value: string[]) => void
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveLogo: () => void
  onPlatformConnection: (platform: keyof ManualPostingItem["connectedTo"]) => void
  onDailyAutoPostingChange: (value: number) => void
  onAutoPostingIntervalChange: (value: AutoPostingInterval) => void
  onDailyRepublishEnabledChange: (value: boolean) => void
  onDailyRepublishChange: (value: number) => void
  onDailyRepublishIntervalChange: (value: AutoPostingInterval) => void
  logoInputId?: string
}

export function ManualPostingForm({
  brandName,
  projectName,
  contentSource,
  brandLogo,
  logoPreview,
  connectedTo,
  dailyAutoPosting,
  autoPostingInterval,
  dailyRepublishEnabled,
  dailyRepublish,
  dailyRepublishInterval,
  onBrandNameChange,
  onProjectNameChange,
  onContentSourceChange,
  onImageChange,
  onRemoveLogo,
  onPlatformConnection,
  onDailyAutoPostingChange,
  onAutoPostingIntervalChange,
  onDailyRepublishEnabledChange,
  onDailyRepublishChange,
  onDailyRepublishIntervalChange,
  logoInputId = "brand-logo-upload",
}: ManualPostingFormProps) {
  const anchorRef = useComboboxAnchor()

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

        <Field>
          <FieldLabel>
            <Label className="flex items-center gap-2">
              Brand Logo (Optional)
              <span title="Upload a picture/image file for your brand logo">
                <HugeiconsIcon icon={HelpCircleIcon} className="size-4 text-muted-foreground" />
              </span>
            </Label>
          </FieldLabel>
          <FieldContent>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <div className="flex-1 min-w-0 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="hidden"
                    id={logoInputId}
                  />
                  <label
                    htmlFor={logoInputId}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-border rounded-lg bg-background hover:bg-muted cursor-pointer transition-colors"
                  >
                    <HugeiconsIcon icon={ArrowUp01Icon} className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium">Choose File</span>
                  </label>
                  <FieldDescription className="mt-1.5">
                    Upload a picture/image file for your brand logo
                  </FieldDescription>
                </div>
                {logoPreview && (
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <img
                      src={logoPreview}
                      alt="Brand logo preview"
                      className="size-16 rounded-full object-cover border border-border"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={onRemoveLogo}>
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </FieldContent>
        </Field>
      </div>

      <Field>
        <FieldLabel>
          <Label>Content Source</Label>
        </FieldLabel>
        <FieldContent>
          <Combobox items={contentSources} multiple value={contentSource} onValueChange={(value) => onContentSourceChange(value || [])}>
            <ComboboxChips ref={anchorRef} className="w-full">
              {contentSource.map((source) => (
                <div
                  key={source}
                  className="bg-muted text-foreground flex h-6 items-center justify-center gap-1 rounded-sm px-2 text-xs font-medium whitespace-nowrap"
                >
                  <span>{source}</span>
                  <button
                    type="button"
                    onClick={() => onContentSourceChange(contentSource.filter((s) => s !== source))}
                    className="ml-1 opacity-50 hover:opacity-100 rounded-sm hover:bg-muted-foreground/20 p-0.5"
                    aria-label={`Remove ${source}`}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
                  </button>
                </div>
              ))}
              <ComboboxChipsInput
                placeholder={contentSource.length === 0 ? "Search and select content sources" : "Add more content sources..."}
              />
            </ComboboxChips>
            <ComboboxContent anchor={anchorRef}>
              <ComboboxEmpty>No content sources found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel>
          <Label>Connected To</Label>
        </FieldLabel>
        <FieldContent>
          <PlatformConnectionButtons connectedTo={connectedTo} onPlatformConnection={onPlatformConnection} />
        </FieldContent>
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
