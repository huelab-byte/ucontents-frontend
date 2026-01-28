"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import {
  NewManualPostingDialog,
  EditManualPostingDialog,
  StatisticsCards,
  ManualPostingTable,
  type ManualPostingItem,
  demoManualPosting,
} from "@/components/manual-posting"

export default function ManualPostingPage() {
  const router = useRouter()
  const [items, setItems] = React.useState<ManualPostingItem[]>(demoManualPosting)
  const [editingItem, setEditingItem] = React.useState<ManualPostingItem | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 20

  // Reset to page 1 if current page exceeds total pages (e.g., after deletion)
  React.useEffect(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage)
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [items.length, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    const totalPages = Math.ceil(items.length / itemsPerPage)
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleCreate = (
    item: Omit<ManualPostingItem, "id" | "postedAmount" | "remainingContent" | "startedDate">
  ) => {
    const newItem: ManualPostingItem = {
      ...item,
      id: `bp-${Date.now()}`,
      postedAmount: 0,
      remainingContent: item.totalPost,
      startedDate: new Date().toISOString().split("T")[0],
    }
    setItems([newItem, ...items])
  }

  const handleUpdate = (
    id: string,
    updates: Partial<Omit<ManualPostingItem, "id" | "postedAmount" | "remainingContent" | "startedDate">>
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates }
        }
        return item
      })
    )
    setEditingItem(null)
  }

  const handleView = (id: string) => {
    router.push(`/social-automation/manual-posting/${id}`)
  }

  const handleEdit = (id: string) => {
    const item = items.find((i) => i.id === id)
    if (item) {
      setEditingItem(item)
    }
  }

  const handlePause = (id: string) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === "running" ? "paused" : "running"
          return { ...item, status: newStatus }
        }
        return item
      })
    )
  }

  const handleDelete = (id: string) => {
    // Open delete confirmation
  }

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manual Posting</h1>
            <p className="text-muted-foreground mt-2">
              Create and schedule individual social media posts with manual control and customization
            </p>
          </div>
          <NewManualPostingDialog onCreate={handleCreate} />
        </div>

        {/* Statistics Cards */}
        <StatisticsCards items={items} />

        {/* Table View */}
        {items.length > 0 ? (
          <ManualPostingTable
            items={items}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPause={handlePause}
          />
        ) : (
          <Card className="p-12 text-center">
            <CardContent className="pt-6">
              <CardTitle className="mb-2">No manual posts yet</CardTitle>
              <p className="text-muted-foreground mb-4">
                Create your first manual post to start scheduling individual social media posts with full control.
              </p>
              <NewManualPostingDialog onCreate={handleCreate} />
            </CardContent>
          </Card>
        )}

        {/* Edit Manual Posting Dialog */}
        <EditManualPostingDialog
          item={editingItem}
          onUpdate={handleUpdate}
          onClose={() => setEditingItem(null)}
        />
      </div>
    </CustomerDashboardLayout>
  )
}
