"use client"

import * as React from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Video01Icon } from "@hugeicons/core-free-icons"
import { ContentSource } from "./types"
import { NewSourceDialog } from "./new-source-dialog"

interface EmptyStateProps {
  onCreateSource: (source: Omit<ContentSource, "id" | "createdAt" | "campaigns" | "totalVideos">) => void
}

export function EmptyState({ onCreateSource }: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <CardContent className="pt-6">
        <HugeiconsIcon
          icon={Video01Icon}
          className="size-12 mx-auto text-muted-foreground mb-4"
        />
        <CardTitle className="mb-2">No content sources yet</CardTitle>
        <p className="text-muted-foreground mb-4">
          Create your first content source to start managing video sources for automated
          editing workflows.
        </p>
        <NewSourceDialog onCreate={onCreateSource} />
      </CardContent>
    </Card>
  )
}
