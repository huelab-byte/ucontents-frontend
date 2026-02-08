"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"
import { BulkPostingForm } from "./bulk-posting-form"
import type { AutoPostingInterval } from "@/components/manual-posting/manual-posting-form"
import { demoChannels, demoGroups } from "./constants"
import type { BulkPostingItem, ContentSourceType, ConnectionSelection } from "./types"
import type { SocialChannel, SocialConnectionGroup } from "@/lib/api"

interface NewBulkPostingDialogProps {
  onCreate: (item: Omit<BulkPostingItem, "id" | "postedAmount" | "remainingContent" | "startedDate">) => void
  channels?: SocialChannel[]
  groups?: SocialConnectionGroup[]
  mediaFolders?: { id: number; name: string }[]
  isLoadingConnections?: boolean
  /** Controlled mode: when provided, dialog is controlled and no trigger is rendered */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewBulkPostingDialog({ 
  onCreate, 
  channels = demoChannels, 
  groups = demoGroups,
  mediaFolders = [],
  isLoadingConnections = false,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: NewBulkPostingDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = openProp !== undefined && onOpenChangeProp !== undefined
  const open = isControlled ? openProp : internalOpen
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen
  const [brandName, setBrandName] = React.useState("")
  const [projectName, setProjectName] = React.useState("")
  const [contentSourceType, setContentSourceType] = React.useState<ContentSourceType | "">("")
  const [contentSource, setContentSource] = React.useState<string[]>([])
  const [csvFile, setCsvFile] = React.useState<File | null>(null)
  const [brandLogo, setBrandLogo] = React.useState<string>("")
  const [logoPreview, setLogoPreview] = React.useState<string>("")
  const [connections, setConnections] = React.useState<ConnectionSelection>({
    channels: [],
    groups: [],
  })
  const [dailyAutoPosting, setDailyAutoPosting] = React.useState(1)
  const [autoPostingInterval, setAutoPostingInterval] = React.useState<AutoPostingInterval>("")
  const [dailyRepublishEnabled, setDailyRepublishEnabled] = React.useState(false)
  const [dailyRepublish, setDailyRepublish] = React.useState(0)
  const [dailyRepublishInterval, setDailyRepublishInterval] = React.useState<AutoPostingInterval>("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setBrandLogo(result)
        setLogoPreview(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setBrandLogo("")
    setLogoPreview("")
  }

  const handleContentSourceTypeChange = (value: ContentSourceType) => {
    setContentSourceType(value)
    // Reset the other content source when switching types
    if (value === "csv_file") {
      setContentSource([])
    } else {
      setCsvFile(null)
    }
  }

  const isFormValid = () => {
    if (!brandName.trim() || !projectName.trim()) return false
    if (!contentSourceType) return false
    if (!autoPostingInterval) return false
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid() && contentSourceType) {
      onCreate({
        brand: {
          name: brandName.trim(),
          projectName: projectName.trim(),
          logo: brandLogo || undefined,
        },
        connections,
        contentSourceType: contentSourceType as ContentSourceType,
        contentSource,
        csvFile,
        totalPost: 0,
        status: "draft",
        scheduleCondition: autoPostingInterval as "minute" | "hourly" | "daily" | "weekly" | "monthly",
        scheduleInterval: dailyAutoPosting,
        repostEnabled: dailyRepublishEnabled,
        repostCondition: dailyRepublishEnabled ? (dailyRepublishInterval || undefined) : undefined,
        repostInterval: dailyRepublishEnabled ? dailyRepublish : undefined,
        repostMaxCount: dailyRepublishEnabled ? Math.max(1, dailyRepublish) : undefined,
      })
      // Reset form
      resetForm()
      setOpen(false)
    }
  }

  const resetForm = () => {
    setBrandName("")
    setProjectName("")
    setContentSourceType("")
    setContentSource([])
    setCsvFile(null)
    setBrandLogo("")
    setLogoPreview("")
    setConnections({
      channels: [],
      groups: [],
    })
    setDailyAutoPosting(1)
    setAutoPostingInterval("")
    setDailyRepublishEnabled(false)
    setDailyRepublish(0)
    setDailyRepublishInterval("")
  }

  const handleCancel = () => {
    resetForm()
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <AlertDialogTrigger render={<Button className="flex items-center gap-2" />}>
          <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
          Create Campaign
        </AlertDialogTrigger>
      )}
      <AlertDialogContent className="!w-[650px] !max-w-[650px] max-w-[calc(100vw-2rem)] mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Bulk Posting Campaign</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <BulkPostingForm
            brandName={brandName}
            projectName={projectName}
            contentSourceType={contentSourceType}
            contentSource={contentSource}
            csvFile={csvFile}
            brandLogo={brandLogo}
            logoPreview={logoPreview}
            connections={connections}
            channels={channels}
            groups={groups}
            mediaFolders={mediaFolders}
            isLoadingConnections={isLoadingConnections}
            dailyAutoPosting={dailyAutoPosting}
            autoPostingInterval={autoPostingInterval}
            dailyRepublishEnabled={dailyRepublishEnabled}
            dailyRepublish={dailyRepublish}
            dailyRepublishInterval={dailyRepublishInterval}
            onBrandNameChange={setBrandName}
            onProjectNameChange={setProjectName}
            onContentSourceTypeChange={handleContentSourceTypeChange}
            onContentSourceChange={setContentSource}
            onCsvFileChange={setCsvFile}
            onImageChange={handleImageChange}
            onRemoveLogo={handleRemoveLogo}
            onConnectionsChange={setConnections}
            onDailyAutoPostingChange={setDailyAutoPosting}
            onAutoPostingIntervalChange={setAutoPostingInterval}
            onDailyRepublishEnabledChange={setDailyRepublishEnabled}
            onDailyRepublishChange={setDailyRepublish}
            onDailyRepublishIntervalChange={setDailyRepublishInterval}
            logoInputId="brand-logo-upload"
          />
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit" disabled={!isFormValid()}>Create Campaign</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
