"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { CloudUploadIcon } from "@hugeicons/core-free-icons"

interface UploadSectionProps {
  onUploadClick: () => void
}

export function UploadSection({ onUploadClick }: UploadSectionProps) {
  return (
    <Button variant="default" onClick={onUploadClick}>
      <HugeiconsIcon icon={CloudUploadIcon} className="size-4 mr-2" />
      Upload Videos
    </Button>
  )
}
