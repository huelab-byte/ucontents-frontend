"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UploadStatisticsProps {
  totalQueued: number
  totalProcessing: number
  totalCompleted: number
}

export function UploadStatistics({
  totalQueued,
  totalProcessing,
  totalCompleted,
}: UploadStatisticsProps) {
  return (
    <Card size="sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Upload Statistics</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col gap-0.5 p-2 bg-muted/50 rounded border border-border">
            <div className="text-lg font-bold">{totalQueued}</div>
            <div className="text-[10px] text-muted-foreground">Queued</div>
          </div>
          <div className="flex flex-col gap-0.5 p-2 bg-muted/50 rounded border border-border">
            <div className="text-lg font-bold">{totalProcessing}</div>
            <div className="text-[10px] text-muted-foreground">Processing</div>
          </div>
          <div className="flex flex-col gap-0.5 p-2 bg-muted/50 rounded border border-border">
            <div className="text-lg font-bold">{totalCompleted}</div>
            <div className="text-[10px] text-muted-foreground">Completed</div>
          </div>
          <div className="flex flex-col gap-0.5 p-2 bg-muted/50 rounded border border-border">
            <div className="text-lg font-bold">{totalQueued + totalProcessing + totalCompleted}</div>
            <div className="text-[10px] text-muted-foreground">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
