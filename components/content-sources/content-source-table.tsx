"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContentSource } from "./types"
import { ContentSourceRow } from "./content-source-row"
import { Pagination } from "./pagination"

interface ContentSourceTableProps {
  sources: ContentSource[]
  currentPage: number
  itemsPerPage: number
  onEdit: (source: ContentSource) => void
  onDelete: (id: string) => void
  onNavigate: (id: string) => void
  onPageChange: (page: number) => void
}

export function ContentSourceTable({
  sources,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
  onNavigate,
  onPageChange,
}: ContentSourceTableProps) {
  const totalPages = Math.ceil(sources.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSources = sources.slice(startIndex, endIndex)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Source Name
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Format
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Total Videos
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
              {currentSources.map((source) => (
                <ContentSourceRow
                  key={source.id}
                  source={source}
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
          totalItems={sources.length}
          itemsPerPage={itemsPerPage}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  )
}
