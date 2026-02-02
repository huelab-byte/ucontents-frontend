"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { CustomerDashboardLayout } from "@/components/customer-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  CalendarIcon,
  ClockIcon,
  CheckmarkCircle01Icon,
  Queue01Icon,
  Video01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  PlatformIcons,
  StatusBadge,
  formatDate,
  ScheduledContentSection,
  type BulkPostingItem,
  type ScheduledContent,
} from "@/components/bulk-posting"
import { bulkPostingService } from "@/lib/api"

// Generate initial scheduled content data
function generateScheduledContent(): ScheduledContent[] {
  const content: ScheduledContent[] = []
  const today = new Date()
  const platforms: Array<"facebook" | "instagram" | "tiktok" | "youtube"> = ["facebook", "instagram", "tiktok", "youtube"]
  const types: Array<"image" | "video" | "text"> = ["image", "video", "text"]
  const statuses: Array<"scheduled" | "published" | "error"> = ["scheduled", "published", "error"]
  
  const contentTitles = [
    "Summer Collection Launch",
    "Product Showcase Video",
    "Behind the Scenes",
    "Customer Success Story",
    "New Feature Announcement",
    "Holiday Special Offer",
    "Team Spotlight",
    "Tutorial: Getting Started",
    "Industry Insights",
    "Product Demo",
    "User Testimonial",
    "Event Highlights",
    "Tips & Tricks",
    "Company Culture",
    "Product Comparison",
    "How-To Guide",
    "Case Study",
    "News Update",
    "Inspiration Post",
    "Trending Topic",
    "Expert Interview",
    "Quick Tips",
    "Success Metrics",
    "Community Spotlight",
    "Innovation Showcase",
  ]

  for (let i = -20; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const platform = platforms[Math.floor(Math.random() * platforms.length)]
    const type = types[Math.floor(Math.random() * types.length)]
    let status: "scheduled" | "published" | "error"
    if (i < 0) {
      status = Math.random() > 0.1 ? "published" : "error"
    } else if (i === 0) {
      status = statuses[Math.floor(Math.random() * statuses.length)]
    } else {
      status = Math.random() > 0.1 ? "scheduled" : statuses[Math.floor(Math.random() * statuses.length)]
    }
    const title = contentTitles[Math.floor(Math.random() * contentTitles.length)]

    const hour = Math.floor(Math.random() * 24)
    const minute = Math.floor(Math.random() * 4) * 15
    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    const time = `${displayHour}:${timeStr.split(":")[1]} ${ampm}`
    
    const hashtags = ["#startnow", "#noregrets", "#takeaction", "#motivation", "#success", "#inspiration"]
    const selectedHashtags = hashtags.slice(0, Math.floor(Math.random() * 3) + 2).join(" ")
    const contentText = `${title} ${selectedHashtags}`
    
    const numPlatforms = Math.random() > 0.5 ? 1 : Math.floor(Math.random() * 3) + 1
    const selectedPlatforms = platforms
      .sort(() => Math.random() - 0.5)
      .slice(0, numPlatforms) as Array<"facebook" | "instagram" | "tiktok" | "youtube">

    content.push({
      id: `content-${i + 21}`,
      date: date.toISOString().split("T")[0],
      time: time,
      title: title,
      description: `This is a ${type} post. Generated from content sources.`,
      type,
      platforms: selectedPlatforms,
      status,
      contentText: contentText,
    })
  }
  
  // Sort by date descending (most recent first: today -> future -> past)
  return content.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTime = today.getTime()
    
    const aIsToday = dateA === todayTime
    const bIsToday = dateB === todayTime
    if (aIsToday && !bIsToday) return -1
    if (!aIsToday && bIsToday) return 1
    
    if (dateA > todayTime && dateB > todayTime) {
      return dateA - dateB
    }
    if (dateA > todayTime) return -1
    if (dateB > todayTime) return 1
    
    return dateB - dateA
  })
}

export default function BulkPostingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string

  const [campaign, setCampaign] = React.useState<BulkPostingItem | undefined>(undefined)
  const [isLoading, setIsLoading] = React.useState(true)
  const [scheduledContent, setScheduledContent] = React.useState<ScheduledContent[]>([])

  React.useEffect(() => {
    const load = async () => {
      try {
        const [campaignRes, contentRes] = await Promise.all([
          bulkPostingService.get(campaignId),
          bulkPostingService.getContentItems(campaignId, { per_page: 100 }),
        ])
        if (campaignRes.success && campaignRes.data) {
          setCampaign(campaignRes.data as BulkPostingItem)
        }
        if (contentRes.success && contentRes.data) {
          const items = Array.isArray(contentRes.data) ? contentRes.data : []
          setScheduledContent(items as ScheduledContent[])
        } else {
          setScheduledContent(generateScheduledContent())
        }
      } catch (error) {
        console.error("Failed to load campaign:", error)
        setScheduledContent(generateScheduledContent())
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [campaignId])

  const handleRun = async () => {
    if (!campaign) return
    try {
      const response = await bulkPostingService.start(campaignId)
      if (response.success && response.data) {
        setCampaign(response.data as BulkPostingItem)
      }
    } catch (error) {
      console.error("Failed to start campaign:", error)
    }
  }

  const handlePause = async () => {
    if (!campaign) return
    try {
      const response = await bulkPostingService.pause(campaignId)
      if (response.success && response.data) {
        setCampaign(response.data as BulkPostingItem)
      }
    } catch (error) {
      console.error("Failed to pause campaign:", error)
    }
  }

  const [isSyncing, setIsSyncing] = React.useState(false)

  const handleSync = async () => {
    if (!campaign) return
    setIsSyncing(true)
    try {
      const response = await bulkPostingService.sync(campaignId)
      if (response.success && response.data) {
        const { added, skipped, total } = response.data
        if (added > 0) {
          toast.success(`Synced! Added ${added} new content items.`)
          // Reload content items
          const contentRes = await bulkPostingService.getContentItems(campaignId, { per_page: 100 })
          if (contentRes.success && contentRes.data) {
            setScheduledContent(contentRes.data as ScheduledContent[])
          }
          // Reload campaign to update counts
          const campaignRes = await bulkPostingService.get(campaignId)
          if (campaignRes.success && campaignRes.data) {
            setCampaign(campaignRes.data as BulkPostingItem)
          }
        } else {
          toast.info(`No new content found. ${skipped} items already in campaign.`)
        }
      } else {
        toast.error(response.message || "Failed to sync campaign")
      }
    } catch (error) {
      console.error("Failed to sync campaign:", error)
      toast.error("Failed to sync campaign")
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) {
    return (
      <CustomerDashboardLayout>
        <div className="space-y-6">
          <Card className="p-12 text-center">
            <CardContent className="pt-6">
              <CardTitle className="mb-2">Loading campaign...</CardTitle>
            </CardContent>
          </Card>
        </div>
      </CustomerDashboardLayout>
    )
  }

  if (!campaign) {
    return (
      <CustomerDashboardLayout>
        <div className="space-y-6">
          <Card className="p-12 text-center">
            <CardContent className="pt-6">
              <CardTitle className="mb-2">Campaign not found</CardTitle>
              <p className="text-muted-foreground mb-4">
                The campaign you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => router.push("/social-automation/bulk-posting")}>
                <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4 mr-2" />
                Back to Bulk Posting
              </Button>
            </CardContent>
          </Card>
        </div>
      </CustomerDashboardLayout>
    )
  }

  const progressPercentage = campaign.totalPost > 0 
    ? Math.round((campaign.postedAmount / campaign.totalPost) * 100) 
    : 0

  return (
    <CustomerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/social-automation/bulk-posting")}
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
              <span className="sr-only">Back</span>
            </Button>
            {campaign.brand.logo ? (
              <img
                src={campaign.brand.logo}
                alt={campaign.brand.name}
                className="size-12 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-primary">
                  {campaign.brand.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{campaign.brand.name}</h1>
              <p className="text-muted-foreground mt-2">
                {campaign.brand.projectName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Sync Button - only show for media_upload campaigns */}
            {campaign.contentSourceType === "media_upload" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
              >
                <HugeiconsIcon 
                  icon={RefreshIcon} 
                  className={cn("size-4 mr-2", isSyncing && "animate-spin")} 
                />
                {isSyncing ? "Syncing..." : "Sync Folder"}
              </Button>
            )}
            {/* Status and Started Date */}
            <div className="flex items-center gap-6 flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={campaign.status} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Started Date:</span>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CalendarIcon} className="size-4" />
                  <span>{formatDate(campaign.startedDate)}</span>
                </div>
              </div>
            </div>
            {/* Toggle Switch */}
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-sm font-medium",
                campaign.status === "running" ? "text-primary" : "text-muted-foreground"
              )}>
                {campaign.status === "running" ? "Running" : campaign.status === "paused" ? "Paused" : "Stopped"}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (campaign.status === "running") {
                    handlePause()
                  } else {
                    handleRun()
                  }
                }}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  campaign.status === "running" ? "bg-primary" : "bg-muted"
                )}
                disabled={campaign.status === "completed"}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    campaign.status === "running" ? "translate-x-6" : "translate-x-1"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Campaign Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <HugeiconsIcon icon={Video01Icon} className="size-4" />
                Total Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.totalPost}</div>
            </CardContent>
          </Card>

          <Card className="text-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />
                Posted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.postedAmount}</div>
            </CardContent>
          </Card>

          <Card className="text-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <HugeiconsIcon icon={Queue01Icon} className="size-4" />
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaign.remainingContent}</div>
            </CardContent>
          </Card>

          <Card className="text-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <HugeiconsIcon icon={ClockIcon} className="size-4" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressPercentage}%</div>
              <Progress value={progressPercentage} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Connected Platforms & Media Sources - Inline */}
        <div className="flex items-center gap-8 flex-wrap text-sm">
          {/* Connected Platforms */}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-medium">Connected Platforms:</span>
            <PlatformIcons platforms={campaign.connectedTo} />
          </div>

          {/* Media Sources */}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-medium">Media Sources:</span>
            <div className="flex flex-wrap gap-2">
              {campaign.contentSource.map((source, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Scheduled Content Calendar */}
        <ScheduledContentSection
          campaignId={campaignId}
          scheduledContent={scheduledContent}
          setScheduledContent={setScheduledContent}
        />
      </div>
    </CustomerDashboardLayout>
  )
}
