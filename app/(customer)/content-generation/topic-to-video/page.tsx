"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import {
  TopicToVideoStats,
  TopicToVideoTable,
  EditTopicDialog,
  ManageCategoriesDialog,
  EmptyState,
  demoTopicToVideos,
  type TopicToVideo,
  type Category,
} from "@/components/topic-to-video"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { SettingsIcon } from "@hugeicons/core-free-icons"

const defaultCategories: Category[] = [
  {
    id: "cat-1",
    name: "Marketing",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "cat-2",
    name: "Education",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  {
    id: "cat-3",
    name: "Entertainment",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    id: "cat-4",
    name: "Technology",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
]

export default function TopicToVideoPage() {
  const router = useRouter()
  const [topics, setTopics] = React.useState<TopicToVideo[]>(demoTopicToVideos)
  const [editingTopic, setEditingTopic] = React.useState<TopicToVideo | null>(null)
  const [categories, setCategories] = React.useState<Category[]>(defaultCategories)
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(topics.length / itemsPerPage)

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleCreateTopic = (topic: Omit<TopicToVideo, "id" | "createdAt" | "videosGenerated">) => {
    const newTopic: TopicToVideo = {
      ...topic,
      id: `topic-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      videosGenerated: 0,
    }
    setTopics([newTopic, ...topics])
  }

  const handleUpdateTopic = (id: string, updates: Partial<Omit<TopicToVideo, "id" | "createdAt" | "videosGenerated">>) => {
    setTopics(
      topics.map((topic) => {
        if (topic.id === id) {
          return { ...topic, ...updates }
        }
        return topic
      })
    )
    setEditingTopic(null)
  }

  const handleDeleteTopic = (id: string) => {
    setTopics(topics.filter((topic) => topic.id !== id))
  }

  const handleEditTopic = (topic: TopicToVideo) => {
    setEditingTopic(topic)
  }

  const handleNavigate = (id: string) => {
    router.push(`/content-generation/topic-to-video/${id}`)
  }

  const handleSaveCategories = (updatedCategories: Category[]) => {
    setCategories(updatedCategories)
  }

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Topic to Video Campaign</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage campaigns that automatically generate videos from topics and ideas.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsManageCategoriesOpen(true)}
            className="shrink-0"
          >
            <HugeiconsIcon icon={SettingsIcon} className="size-4 mr-2" />
            Manage Categories
          </Button>
        </div>

        {/* Statistics Section */}
        <TopicToVideoStats topics={topics} onCreateTopic={handleCreateTopic} />

        {/* Topics Table */}
        {topics.length > 0 ? (
          <TopicToVideoTable
            topics={topics}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onEdit={handleEditTopic}
            onDelete={handleDeleteTopic}
            onNavigate={handleNavigate}
            onPageChange={handlePageChange}
          />
        ) : (
          <EmptyState onCreateTopic={handleCreateTopic} />
        )}

        {/* Edit Topic Dialog */}
        <EditTopicDialog
          topic={editingTopic}
          categories={categories}
          onUpdate={handleUpdateTopic}
          onClose={() => setEditingTopic(null)}
        />

        {/* Manage Categories Dialog */}
        <ManageCategoriesDialog
          open={isManageCategoriesOpen}
          categories={categories}
          onClose={() => setIsManageCategoriesOpen(false)}
          onSave={handleSaveCategories}
        />
      </div>
    </CustomerDashboardLayout>
  )
}
