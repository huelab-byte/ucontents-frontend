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
import type { BulkPostingItem } from "./types"

interface NewBulkPostingDialogProps {
  onCreate: (item: Omit<BulkPostingItem, "id" | "postedAmount" | "remainingContent" | "startedDate">) => void
}

export function NewBulkPostingDialog({ onCreate }: NewBulkPostingDialogProps) {
  const [open, setOpen] = React.useState(false)
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
    if (brandName.trim() && projectName.trim() && contentSource.length > 0) {
      onCreate({
        brand: {
          name: brandName.trim(),
          projectName: projectName.trim(),
          logo: brandLogo || undefined,
        },
        connectedTo,
        contentSource,
        totalPost: 0,
        status: "draft",
      })
      // Reset form
      setBrandName("")
      setProjectName("")
      setContentSource([])
      setBrandLogo("")
      setLogoPreview("")
      setConnectedTo({
        facebook: false,
        instagram: false,
        tiktok: false,
        youtube: false,
      })
      setDailyAutoPosting(1)
      setDailyRepublishEnabled(false)
      setDailyRepublish(1)
      setOpen(false)
    }
  }

  const handleCancel = () => {
    setBrandName("")
    setProjectName("")
    setContentSource([])
    setBrandLogo("")
    setLogoPreview("")
    setConnectedTo({
      facebook: false,
      instagram: false,
      tiktok: false,
      youtube: false,
    })
    setDailyAutoPosting(1)
    setDailyRepublishEnabled(false)
    setDailyRepublish(1)
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button className="flex items-center gap-2" />}>
        <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
        Create New Bulk Posting
      </AlertDialogTrigger>
      <AlertDialogContent className="!w-[650px] !max-w-[650px] max-w-[calc(100vw-2rem)] mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Bulk Posting Campaign</AlertDialogTitle>
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
            logoInputId="brand-logo-upload"
          />
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <Button type="submit">Create Campaign</Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
