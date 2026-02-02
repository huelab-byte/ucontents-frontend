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
import { ManualPostingForm, type AutoPostingInterval } from "./manual-posting-form"
import type { ManualPostingItem } from "./types"

interface EditManualPostingDialogProps {
  item: ManualPostingItem | null
  onUpdate: (id: string, updates: Partial<Omit<ManualPostingItem, "id" | "postedAmount" | "remainingContent" | "startedDate">>) => void
  onClose: () => void
}

export function EditManualPostingDialog({ item, onUpdate, onClose }: EditManualPostingDialogProps) {
  const [brandName, setBrandName] = React.useState("")
  const [projectName, setProjectName] = React.useState("")
  const [contentSource, setContentSource] = React.useState<string[]>([])
  const [brandLogo, setBrandLogo] = React.useState<string>("")
  const [logoPreview, setLogoPreview] = React.useState<string>("")
  const [connectedTo, setConnectedTo] = React.useState<ManualPostingItem["connectedTo"]>({
    facebook: false,
    instagram: false,
    tiktok: false,
    youtube: false,
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
      setContentSource(item.contentSource)
      setBrandLogo(item.brand.logo || "")
      setLogoPreview(item.brand.logo || "")
      setConnectedTo(item.connectedTo)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (item && brandName.trim() && projectName.trim() && contentSource.length > 0) {
      onUpdate(item.id, {
        brand: {
          name: brandName.trim(),
          projectName: projectName.trim(),
          logo: brandLogo || undefined,
        },
        connectedTo,
        contentSource,
      })
      onClose()
    }
  }

  const handleCancel = () => {
    onClose()
  }

  const handlePlatformConnection = (platform: keyof typeof connectedTo) => {
    if (connectedTo[platform]) {
      setConnectedTo((prev) => ({
        ...prev,
        [platform]: false,
      }))
      return
    }

    const connectionWindow = window.open(
      `https://example.com/connect/${platform}`,
      `${platform}_connection`,
      "width=600,height=700,scrollbars=yes,resizable=yes"
    )

    setTimeout(() => {
      if (connectionWindow) {
        setConnectedTo((prev) => ({
          ...prev,
          [platform]: true,
        }))
        connectionWindow.close()
      }
    }, 2000)
  }

  if (!item) return null

  return (
    <AlertDialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="!w-[650px] !max-w-[650px] max-w-[calc(100vw-2rem)] mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Manual Post</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit}>
          <ManualPostingForm
            brandName={brandName}
            projectName={projectName}
            contentSource={contentSource}
            brandLogo={brandLogo}
            logoPreview={logoPreview}
            connectedTo={connectedTo}
            dailyAutoPosting={dailyAutoPosting}
            autoPostingInterval={autoPostingInterval}
            dailyRepublishEnabled={dailyRepublishEnabled}
            dailyRepublish={dailyRepublish}
            dailyRepublishInterval={dailyRepublishInterval}
            onBrandNameChange={setBrandName}
            onProjectNameChange={setProjectName}
            onContentSourceChange={setContentSource}
            onImageChange={handleImageChange}
            onRemoveLogo={() => {
              setBrandLogo("")
              setLogoPreview("")
            }}
            onPlatformConnection={handlePlatformConnection}
            onDailyAutoPostingChange={setDailyAutoPosting}
            onAutoPostingIntervalChange={setAutoPostingInterval}
            onDailyRepublishEnabledChange={setDailyRepublishEnabled}
            onDailyRepublishChange={setDailyRepublish}
            onDailyRepublishIntervalChange={setDailyRepublishInterval}
            logoInputId="brand-logo-upload-edit"
          />
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit">Save Changes</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
