"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TopicToVideo } from "./types"
import { TopicToVideoRow } from "./topic-to-video-row"
import { Pagination } from "./pagination"

interface TopicToVideoTableProps {
  topics: TopicToVideo[]
  currentPage: number
  itemsPerPage: number
  onEdit: (topic: TopicToVideo) => void
  onDelete: (id: string) => void
  onNavigate: (id: string) => void
  onPageChange: (page: number) => void
}

export function TopicToVideoTable({
  topics,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
  onNavigate,
  onPageChange,
}: TopicToVideoTableProps) {
  const totalPages = Math.ceil(topics.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTopics = topics.slice(startIndex, endIndex)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topic to Video Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Campaign Name
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Format
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Categories
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Videos Generated
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Scheduler
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Created
                </th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3 w-12">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTopics.map((topic) => (
                <TopicToVideoRow
                  key={topic.id}
                  topic={topic}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onNavigate={onNavigate}
                />
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={topics.length}
          itemsPerPage={itemsPerPage}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  )
}
