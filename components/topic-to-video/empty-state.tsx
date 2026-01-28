"use client"

import * as React from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Video01Icon } from "@hugeicons/core-free-icons"
import { TopicToVideo } from "./types"
import { NewTopicDialog } from "./new-topic-dialog"

interface EmptyStateProps {
  onCreateTopic: (topic: Omit<TopicToVideo, "id" | "createdAt" | "videosGenerated">) => void
}

export function EmptyState({ onCreateTopic }: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <CardContent className="pt-6">
        <HugeiconsIcon
          icon={Video01Icon}
          className="size-12 mx-auto text-muted-foreground mb-4"
        />
        <CardTitle className="mb-2">No campaigns yet</CardTitle>
        <p className="text-muted-foreground mb-4">
          Create your first campaign to start generating videos automatically from topics and ideas.
        </p>
        <NewTopicDialog onCreate={onCreateTopic} />
      </CardContent>
    </Card>
  )
}
