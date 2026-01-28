"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import {
  NewBulkPostingDialog,
  EditBulkPostingDialog,
  StatisticsCards,
  BulkPostingTable,
  type BulkPostingItem,
  demoBulkPosting,
} from "@/components/bulk-posting"

export default function BulkPostingPage() {
  const router = useRouter()
  const [items, setItems] = React.useState<BulkPostingItem[]>(demoBulkPosting)
  const [editingItem, setEditingItem] = React.useState<BulkPostingItem | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 20

  // Reset to page 1 if current page exceeds total pages (e.g., after deletion)
  React.useEffect(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage)
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [items.length, currentPage, itemsPerPage])

  const totalPages = Math.ceil(items.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleCreate = (
    item: Omit<BulkPostingItem, "id" | "postedAmount" | "remainingContent" | "startedDate">
  ) => {
    const newItem: BulkPostingItem = {
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
    updates: Partial<Omit<BulkPostingItem, "id" | "postedAmount" | "remainingContent" | "startedDate">>
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
    router.push(`/social-automation/bulk-posting/${id}`)
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
            <h1 className="text-3xl font-bold">Bulk Posting</h1>
            <p className="text-muted-foreground mt-2">
              Create and schedule multiple social media posts at once with batch upload and automated scheduling
            </p>
          </div>
          <NewBulkPostingDialog onCreate={handleCreate} />
        </div>

        {/* Statistics Cards */}
        <StatisticsCards items={items} />

        {/* Table View */}
        <BulkPostingTable
          items={items}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onView={handleView}
          onEdit={handleEdit}
          onPause={handlePause}
          onDelete={handleDelete}
        />

        {/* Edit Bulk Posting Dialog */}
        <EditBulkPostingDialog
          item={editingItem}
          onUpdate={handleUpdate}
          onClose={() => setEditingItem(null)}
        />
      </div>
    </CustomerDashboardLayout>
  )
}
