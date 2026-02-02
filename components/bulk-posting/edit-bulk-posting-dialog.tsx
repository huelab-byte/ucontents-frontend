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
} from "@/components/ui/alert-dialog"
import { BulkPostingForm } from "./bulk-posting-form"
import type { AutoPostingInterval } from "@/components/manual-posting/manual-posting-form"
import { demoChannels, demoGroups } from "./constants"
import type { BulkPostingItem, ContentSourceType, ConnectionSelection } from "./types"
import type { SocialChannel, SocialConnectionGroup } from "@/lib/api"

interface EditBulkPostingDialogProps {
  item: BulkPostingItem | null
  onUpdate: (id: string, updates: Partial<Omit<BulkPostingItem, "id" | "postedAmount" | "remainingContent" | "startedDate">>) => void
  onClose: () => void
  channels?: SocialChannel[]
  groups?: SocialConnectionGroup[]
  mediaFolders?: { id: number; name: string }[]
  isLoadingConnections?: boolean
}

export function EditBulkPostingDialog({ 
  item, 
  onUpdate, 
  onClose,
  channels = demoChannels,
  groups = demoGroups,
  mediaFolders = [],
  isLoadingConnections = false,
}: EditBulkPostingDialogProps) {
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

  React.useEffect(() => {
    if (item) {
      setBrandName(item.brand.name)
      setProjectName(item.brand.projectName)
      setContentSourceType(item.contentSourceType || "")
      setContentSource(item.contentSource || [])
      setCsvFile(item.csvFile || null)
      setBrandLogo(item.brand.logo || "")
      setLogoPreview(item.brand.logo || "")
      setConnections(item.connections || { channels: [], groups: [] })
      setDailyAutoPosting(item.scheduleInterval ?? 1)
      setAutoPostingInterval((item.scheduleCondition as AutoPostingInterval) ?? "")
      setDailyRepublishEnabled(item.repostEnabled ?? false)
      setDailyRepublish(item.repostInterval ?? 0)
      setDailyRepublishInterval((item.repostCondition as AutoPostingInterval) ?? "")
    }
  }, [item])

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
    if (item && isFormValid() && contentSourceType) {
      onUpdate(item.id, {
        brand: {
          name: brandName.trim(),
          projectName: projectName.trim(),
          logo: brandLogo || undefined,
        },
        connections,
        contentSourceType: contentSourceType as ContentSourceType,
        contentSource,
        csvFile,
        scheduleCondition: autoPostingInterval as "minute" | "hourly" | "daily" | "weekly" | "monthly",
        scheduleInterval: dailyAutoPosting,
        repostEnabled: dailyRepublishEnabled,
        repostCondition: dailyRepublishEnabled ? (dailyRepublishInterval || undefined) : undefined,
        repostInterval: dailyRepublishEnabled ? dailyRepublish : undefined,
        repostMaxCount: dailyRepublishEnabled ? Math.max(1, dailyRepublish) : undefined,
      })
      onClose()
    }
  }

  if (!item) return null

  return (
    <AlertDialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="!w-[650px] !max-w-[650px] max-w-[calc(100vw-2rem)] mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Bulk Posting Campaign</AlertDialogTitle>
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
            logoInputId="brand-logo-upload-edit"
          />
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
            <Button type="submit" disabled={!isFormValid()}>Save Changes</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
