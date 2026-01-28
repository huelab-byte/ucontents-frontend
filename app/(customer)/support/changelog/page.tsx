"use client"

import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import { DocumentCodeIcon } from "@hugeicons/core-free-icons"

interface ChangelogEntry {
  date: string
  description: string
}

const changelogEntries: ChangelogEntry[] = [
  {
    date: "2024-01-15",
    description:
      "Improved social media automation scheduling with better timezone handling and retry logic for failed posts.",
  },
  {
    date: "2024-01-14",
    description: "Enhanced content generation AI model for better quality output and faster response times.",
  },
  {
    date: "2024-01-12",
    description:
      "Added new video upload features with support for larger file sizes and improved compression.",
  },
  {
    date: "2024-01-10",
    description:
      "Updated dashboard analytics with new metrics and improved visualization charts for better insights.",
  },
  {
    date: "2024-01-08",
    description:
      "Fixed bug in template library search functionality and improved search result accuracy.",
  },
  {
    date: "2024-01-05",
    description:
      "Introduced team collaboration features with role-based permissions and activity tracking.",
  },
  {
    date: "2024-01-03",
    description:
      "Optimized API response times and improved error handling for better reliability.",
  },
  {
    date: "2024-01-01",
    description:
      "Redesigned user interface with dark mode support and improved accessibility features.",
  },
]

const lastUpdateDate = changelogEntries[0]?.date || "2024-01-15"

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default function ChangelogPage() {
  return (
    <CustomerDashboardLayout>
      <div className="space-y-8 max-w-4xl">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HugeiconsIcon icon={DocumentCodeIcon} className="size-8" />
            Changelog
          </h1>
          <p className="text-muted-foreground">
            Track platform updates, new features, improvements to automation tools, and content
            generation enhancements
          </p>
          <div className="pt-2">
            <span className="text-sm text-muted-foreground">Last updated: </span>
            <span className="text-sm font-medium">{formatDate(lastUpdateDate)}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-6">
          {changelogEntries.map((entry, index) => (
            <div key={index} className="space-y-2">
              <div className="text-sm font-medium text-foreground">
                {formatDate(entry.date)}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {entry.description}
              </p>
              {index < changelogEntries.length - 1 && (
                <div className="pt-4">
                  <Separator />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </CustomerDashboardLayout>
  )
}
