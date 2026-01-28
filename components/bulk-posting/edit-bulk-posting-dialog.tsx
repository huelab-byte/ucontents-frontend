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
import type { BulkPostingItem } from "./types"

interface EditBulkPostingDialogProps {
  item: BulkPostingItem | null
  onUpdate: (id: string, updates: Partial<Omit<BulkPostingItem, "id" | "postedAmount" | "remainingContent" | "startedDate">>) => void
  onClose: () => void
}

export function EditBulkPostingDialog({ item, onUpdate, onClose }: EditBulkPostingDialogProps) {
  const [brandName, setBrandName] = React.useState("")
  const [projectName, setProjectName] = React.useState("")
  const [contentSource, setContentSource] = React.useState<string[]>([])
  const [brandLogo, setBrandLogo] = React.useState<string>("")
  const [logoPreview, setLogoPreview] = React.useState<string>("")
  const [connectedTo, setConnectedTo] = React.useState<BulkPostingItem["connectedTo"]>({
    facebook: false,
    instagram: false,
    tiktok: false,
    youtube: false,
  })
  const [dailyAutoPosting, setDailyAutoPosting] = React.useState(1)
  const [dailyRepublishEnabled, setDailyRepublishEnabled] = React.useState(false)
  const [dailyRepublish, setDailyRepublish] = React.useState(1)

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

  const handleRemoveLogo = () => {
    setBrandLogo("")
    setLogoPreview("")
  }

  const handlePlatformConnection = (platform: keyof BulkPostingItem["connectedTo"]) => {
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
            contentSource={contentSource}
            brandLogo={brandLogo}
            logoPreview={logoPreview}
            connectedTo={connectedTo}
            dailyAutoPosting={dailyAutoPosting}
            dailyRepublishEnabled={dailyRepublishEnabled}
            dailyRepublish={dailyRepublish}
            onBrandNameChange={setBrandName}
            onProjectNameChange={setProjectName}
            onContentSourceChange={setContentSource}
            onImageChange={handleImageChange}
            onRemoveLogo={handleRemoveLogo}
            onPlatformConnection={handlePlatformConnection}
            onDailyAutoPostingChange={setDailyAutoPosting}
            onDailyRepublishEnabledChange={setDailyRepublishEnabled}
            onDailyRepublishChange={setDailyRepublish}
            logoInputId="brand-logo-upload-edit"
          />
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
            <Button type="submit">Save Changes</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
