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
  Refresh01Icon,
  Cancel01Icon,
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldContent, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"
import {
  PlatformIcons,
  StatusBadge,
  formatDate,
  type ManualPostingItem,
  type ScheduledContent,
  demoManualPosting,
  contentSources,
} from "@/components/manual-posting"
import { ScheduledContentSection } from "@/components/manual-posting/detail/scheduled-content-section"


export default function ManualPostingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string

  // In a real app, this would fetch from API
  const [campaign, setCampaign] = React.useState<ManualPostingItem | undefined>(
    demoManualPosting.find((item) => item.id === campaignId)
  )

  // Scheduled content state - lifted to parent so we can add new posts
  const [scheduledContent, setScheduledContent] = React.useState<ScheduledContent[]>([])

  // Form state
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<Set<"facebook" | "instagram" | "tiktok" | "youtube">>(new Set())
  const [selectedDate, setSelectedDate] = React.useState<string>("")
  const [selectedTime, setSelectedTime] = React.useState<string>("")
  const [timezone, setTimezone] = React.useState<string>("")
  const [schedulerEnabled, setSchedulerEnabled] = React.useState(false)
  const [dailyRepublishEnabled, setDailyRepublishEnabled] = React.useState(false)
  const [dailyRepublish, setDailyRepublish] = React.useState(1)
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)
  const [filePreview, setFilePreview] = React.useState<string | null>(null)
  const [videoOrientation, setVideoOrientation] = React.useState<"9:16" | "16:9" | null>(null)
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = React.useState<string | null>(null)
  const [isYoutubeSelected, setIsYoutubeSelected] = React.useState(false)
  const [youtubeMadeForKids, setYoutubeMadeForKids] = React.useState<string>("")
  const [youtubeTags, setYoutubeTags] = React.useState("")
  const [youtubeCategory, setYoutubeCategory] = React.useState("entertainment")

  // Category mapping for display
  const categoryLabels: Record<string, string> = {
    autos: "Autos & Vehicles",
    comedy: "Comedy",
    education: "Education",
    entertainment: "Entertainment",
    film: "Film & Animation",
    gaming: "Gaming",
    howto: "Howto & Style",
    music: "Music",
    news: "News & Politics",
    nonprofits: "Nonprofits & Activism",
    people: "People & Blogs",
    pets: "Pets & Animals",
    science: "Science & Technology",
    sports: "Sports",
    travel: "Travel & Events",
  }
  const [selectedContentSource, setSelectedContentSource] = React.useState<string[]>([])
  const [isFetching, setIsFetching] = React.useState(false)
  const [contentSourceEnabled, setContentSourceEnabled] = React.useState(false)
  const [fetchedVideoUrl, setFetchedVideoUrl] = React.useState<string | null>(null)
  const [fetchedVideoOrientation, setFetchedVideoOrientation] = React.useState<"9:16" | "16:9" | null>(null)
  const [fetchedContentTitle, setFetchedContentTitle] = React.useState<string>("")
  const contentSourceAnchorRef = useComboboxAnchor()

  // Available platforms configuration
  const platformsConfig = [
    { key: "facebook" as const, label: "Facebook", color: "#1877F2", icon: FacebookIcon },
    { key: "instagram" as const, label: "Instagram", color: "#E4405F", icon: InstagramIcon },
    { key: "tiktok" as const, label: "TikTok", color: "#000000", icon: TiktokIcon },
    { key: "youtube" as const, label: "YouTube", color: "#FF0000", icon: YoutubeIcon },
  ]

  // Auto-select platforms based on campaign's connected platforms
  React.useEffect(() => {
    if (campaign) {
      const connected = new Set<"facebook" | "instagram" | "tiktok" | "youtube">()
      if (campaign.connectedTo.facebook) connected.add("facebook")
      if (campaign.connectedTo.instagram) connected.add("instagram")
      if (campaign.connectedTo.tiktok) connected.add("tiktok")
      if (campaign.connectedTo.youtube) connected.add("youtube")
      setSelectedPlatforms(connected)
      setIsYoutubeSelected(campaign.connectedTo.youtube)
    }
  }, [campaign])

  // Get timezone from settings (in a real app, this would fetch from API)
  React.useEffect(() => {
    // Try to get from localStorage or use browser timezone as fallback
    const savedTimezone = localStorage.getItem("userTimezone") || Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(savedTimezone)
    
    // Set today's date and current time as default
    const today = new Date()
    const todayString = today.toISOString().split("T")[0]
    setSelectedDate(todayString)
    const hours = today.getHours().toString().padStart(2, "0")
    const minutes = today.getMinutes().toString().padStart(2, "0")
    setSelectedTime(`${hours}:${minutes}`)
  }, [])

  // Handle thumbnail upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      
      // Create preview
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
        setVideoOrientation(null)
      } else if (file.type.startsWith("video/")) {
        // Create video preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
        
        // Detect video orientation
        const video = document.createElement("video")
        video.preload = "metadata"
        const videoUrl = URL.createObjectURL(file)
        video.src = videoUrl
        video.onloadedmetadata = () => {
          const aspectRatio = video.videoWidth / video.videoHeight
          const ratio916 = 9 / 16
          const ratio169 = 16 / 9
          
          if (Math.abs(aspectRatio - ratio916) < Math.abs(aspectRatio - ratio169)) {
            setVideoOrientation("9:16")
          } else {
            setVideoOrientation("16:9")
          }
          URL.revokeObjectURL(videoUrl)
        }
        video.onerror = () => {
          URL.revokeObjectURL(videoUrl)
        }
      }
    }
  }

  // Update YouTube selection when platforms change
  React.useEffect(() => {
    setIsYoutubeSelected(selectedPlatforms.has("youtube"))
  }, [selectedPlatforms])

  // Mock function to fetch data from content source
  const fetchContentSourceData = async (sourceName: string) => {
    setIsFetching(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock data based on content source
    const mockData: {
      youtubeHeadline?: string
      postCaption?: string
      hashtags?: string
      youtubeDescriptionLong?: string
      videoUrl?: string
      videoOrientation?: "9:16" | "16:9"
    } = {}

    switch (sourceName) {
      case "YouTube Shorts Source":
        mockData.youtubeHeadline = "Amazing Product Launch - Watch Now!"
        mockData.postCaption = "Check out our latest product launch. This revolutionary new item will change the way you work."
        mockData.hashtags = "#productlaunch #innovation #tech #newproduct #musthave"
        mockData.youtubeDescriptionLong = "In this video, we're excited to introduce our latest product that has been in development for over a year. This revolutionary new item combines cutting-edge technology with user-friendly design to provide an unparalleled experience. Whether you're a professional or just getting started, this product is perfect for you. Don't forget to like, subscribe, and hit the notification bell for more updates!"
        // Mock video URL - in real app, this would be the actual video URL from the content source
        mockData.videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        mockData.videoOrientation = "9:16" // YouTube Shorts are typically 9:16
        break
      case "Facebook Feed Source":
        mockData.youtubeHeadline = "Summer Collection Now Available"
        mockData.postCaption = "Our new summer collection is here! Shop now and get 20% off your first order."
        mockData.hashtags = "#summer #fashion #sale #newcollection #style"
        mockData.videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
        mockData.videoOrientation = "16:9" // Facebook Feed videos are typically landscape
        break
      case "TikTok Vertical Source":
        mockData.youtubeHeadline = "Quick Tips for Better Productivity"
        mockData.postCaption = "5 simple tips to boost your productivity today. Try these and see the difference!"
        mockData.hashtags = "#productivity #tips #lifehacks #motivation #success"
        mockData.videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        mockData.videoOrientation = "9:16" // TikTok videos are typically 9:16
        break
      case "Instagram Stories Source":
        mockData.youtubeHeadline = "Behind the Scenes: Our Creative Process"
        mockData.postCaption = "Take a look behind the scenes at how we create amazing content every day."
        mockData.hashtags = "#behindthescenes #creative #process #instagram #content"
        mockData.videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        mockData.videoOrientation = "9:16" // Instagram Stories are typically 9:16
        break
      default:
        mockData.youtubeHeadline = "New Content Available"
        mockData.postCaption = "Check out our latest content update."
        mockData.hashtags = "#content #update #new"
        mockData.videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
        mockData.videoOrientation = "16:9"
    }

    // Map data to form fields
    if (mockData.youtubeHeadline) {
      setTitle(mockData.youtubeHeadline)
      setFetchedContentTitle(mockData.youtubeHeadline)
    }

    // For description: use youtubeDescriptionLong if available, otherwise use postCaption + hashtags
    if (mockData.youtubeDescriptionLong) {
      setDescription(mockData.youtubeDescriptionLong)
    } else {
      const descriptionText = [
        mockData.postCaption,
        mockData.hashtags
      ].filter(Boolean).join("\n\n")
      setDescription(descriptionText)
    }

    // Set fetched video URL and orientation
    if (mockData.videoUrl) {
      setFetchedVideoUrl(mockData.videoUrl)
      setFetchedVideoOrientation(mockData.videoOrientation || null)
      
      // Also detect orientation from video if not provided
      if (!mockData.videoOrientation) {
        const video = document.createElement("video")
        video.preload = "metadata"
        video.src = mockData.videoUrl
        video.onloadedmetadata = () => {
          const aspectRatio = video.videoWidth / video.videoHeight
          const ratio916 = 9 / 16
          const ratio169 = 16 / 9
          
          if (Math.abs(aspectRatio - ratio916) < Math.abs(aspectRatio - ratio169)) {
            setFetchedVideoOrientation("9:16")
          } else {
            setFetchedVideoOrientation("16:9")
          }
          URL.revokeObjectURL(video.src)
        }
        video.onerror = () => {
          URL.revokeObjectURL(video.src)
        }
      }
    } else {
      setFetchedVideoUrl(null)
      setFetchedVideoOrientation(null)
    }

    setIsFetching(false)
  }

  // Handle fetch button click
  const handleFetchContent = async () => {
    if (selectedContentSource.length === 0) {
      alert("Please select a content source first")
      return
    }
    
    // Fetch from the first selected source
    await fetchContentSourceData(selectedContentSource[0])
  }

  const handleRun = () => {
    if (campaign) {
      setCampaign({
        ...campaign,
        status: "running",
      })
    }
  }

  const handlePause = () => {
    if (campaign) {
      setCampaign({
        ...campaign,
        status: "paused",
      })
    }
  }

  if (!campaign) {
    return (
      <CustomerDashboardLayout>
        <div className="space-y-6">
          <Card className="p-12 text-center">
            <CardContent className="pt-6">
              <CardTitle className="mb-2">Post not found</CardTitle>
              <p className="text-muted-foreground mb-4">
                The post you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => router.push("/social-automation/manual-posting")}>
                <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4 mr-2" />
                Back to Manual Posting
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
      <div className="flex gap-0">
        {/* Main Content */}
        <div className="flex-1 space-y-6 pr-[420px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/social-automation/manual-posting")}
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

        {/* Post Overview */}
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

        {/* Connected Platforms & Content Sources - Inline */}
        <div className="flex items-center gap-8 flex-wrap text-sm">
          {/* Connected Platforms */}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-medium">Connected Platforms:</span>
            <PlatformIcons platforms={campaign.connectedTo} />
          </div>

          {/* Content Sources */}
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-medium">Content Sources:</span>
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

        {/* Right Sidebar - Fixed to Viewport */}
        <div 
          className="w-[420px] shrink-0 border-l border-border bg-background shadow-lg"
          style={{
            position: 'fixed',
            top: '64px',
            bottom: '0',
            right: '0',
            zIndex: 50,
          }}
        >
          <div className="h-full overflow-y-auto">
            {/* Sidebar Header */}
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 z-10">
              <h2 className="text-lg font-semibold">Create New Post</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Content Source Selection */}
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-sm">Content Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <Field>
                    <FieldContent>
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={contentSourceEnabled}
                            onChange={(e) => {
                              setContentSourceEnabled(e.target.checked)
                              if (!e.target.checked) {
                                // Clear fetched content when disabled
                                setFetchedVideoUrl(null)
                                setFetchedVideoOrientation(null)
                                setFetchedContentTitle("")
                              }
                            }}
                            className="rounded border-border"
                          />
                          <span className="text-sm">Enable Content Source</span>
                        </Label>
                        {contentSourceEnabled && (
                          <>
                            <Combobox
                              items={contentSources}
                              multiple
                              value={selectedContentSource}
                              onValueChange={(value) => setSelectedContentSource(value || [])}
                            >
                              <ComboboxChips ref={contentSourceAnchorRef} className="w-full">
                                {selectedContentSource.map((source) => (
                                  <div
                                    key={source}
                                    className="bg-muted text-foreground flex h-6 items-center justify-center gap-1 rounded-sm px-2 text-xs font-medium whitespace-nowrap"
                                  >
                                    <span>{source}</span>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedContentSource(selectedContentSource.filter((s) => s !== source))}
                                      className="ml-1 opacity-50 hover:opacity-100 rounded-sm hover:bg-muted-foreground/20 p-0.5"
                                      aria-label={`Remove ${source}`}
                                    >
                                      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
                                    </button>
                                  </div>
                                ))}
                                <ComboboxChipsInput
                                  placeholder={selectedContentSource.length === 0 ? "Search and select content sources" : "Add more content sources..."}
                                />
                              </ComboboxChips>
                              <ComboboxContent anchor={contentSourceAnchorRef}>
                                <ComboboxEmpty>No content sources found.</ComboboxEmpty>
                                <ComboboxList>
                                  {(item) => (
                                    <ComboboxItem key={item} value={item}>
                                      {item}
                                    </ComboboxItem>
                                  )}
                                </ComboboxList>
                              </ComboboxContent>
                            </Combobox>
                            <Button
                              type="button"
                              onClick={handleFetchContent}
                              disabled={selectedContentSource.length === 0 || isFetching}
                              className="w-full"
                            >
                              <HugeiconsIcon icon={Refresh01Icon} className={cn("size-4 mr-2", isFetching && "animate-spin")} />
                              {isFetching ? "Fetching..." : "Fetch Content"}
                            </Button>
                            
                            {/* Fetched Content Display */}
                            {fetchedVideoUrl && (
                              <div className="mt-4 space-y-3 pt-4 border-t border-border">
                                {fetchedContentTitle && (
                                  <div>
                                    <Label className="text-xs text-muted-foreground mb-1 block">Fetched Title</Label>
                                    <p className="text-sm font-medium">{fetchedContentTitle}</p>
                                  </div>
                                )}
                                <div>
                                  <Label className="text-xs text-muted-foreground mb-2 block">Fetched Video</Label>
                                  <div className="space-y-2">
                                    <div className="relative w-full rounded-lg overflow-hidden border border-border bg-muted">
                                      <video
                                        src={fetchedVideoUrl}
                                        controls
                                        className="w-full h-auto max-h-[400px]"
                                        onLoadedMetadata={(e) => {
                                          // Double-check orientation from actual video
                                          const video = e.currentTarget
                                          const aspectRatio = video.videoWidth / video.videoHeight
                                          const ratio916 = 9 / 16
                                          const ratio169 = 16 / 9
                                          
                                          if (Math.abs(aspectRatio - ratio916) < Math.abs(aspectRatio - ratio169)) {
                                            setFetchedVideoOrientation("9:16")
                                          } else {
                                            setFetchedVideoOrientation("16:9")
                                          }
                                        }}
                                      />
                                    </div>
                                    {fetchedVideoOrientation && (
                                      <div className="flex items-center gap-2">
                                        <Badge 
                                          variant="secondary" 
                                          className={cn(
                                            "text-xs",
                                            fetchedVideoOrientation === "9:16" && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                                            fetchedVideoOrientation === "16:9" && "bg-green-500/10 text-green-600 dark:text-green-400"
                                          )}
                                        >
                                          {fetchedVideoOrientation === "9:16" ? "9:16 Vertical" : "Landscape"}
                                        </Badge>
                                      </div>
                                    )}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setFetchedVideoUrl(null)
                                        setFetchedVideoOrientation(null)
                                        setFetchedContentTitle("")
                                      }}
                                      className="w-full"
                                    >
                                      <HugeiconsIcon icon={Cancel01Icon} className="size-4 mr-2" />
                                      Clear Fetched Content
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </FieldContent>
                  </Field>
                </CardContent>
              </Card>

              {/* Post Content */}
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-sm">Post Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field>
                    <FieldLabel>
                      <Label>Title</Label>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter post title..."
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>
                      <Label>Description</Label>
                    </FieldLabel>
                    <FieldContent>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter post description..."
                        className="border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 rounded-lg border bg-transparent px-2.5 py-2 text-sm transition-colors focus-visible:ring-[3px] placeholder:text-muted-foreground min-h-[120px] w-full outline-none resize-none"
                        rows={5}
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>
                      <Label>Image or Video</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="space-y-3">
                        <Input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileUpload}
                          className="cursor-pointer"
                        />
                        {filePreview && (
                          <div className="mt-3">
                            {uploadedFile?.type.startsWith("image/") ? (
                              <img
                                src={filePreview}
                                alt="Preview"
                                className="max-w-full h-auto rounded-lg border border-border"
                              />
                            ) : uploadedFile?.type.startsWith("video/") ? (
                              <div className="space-y-2">
                                <video
                                  src={filePreview}
                                  controls
                                  className="max-w-full h-auto rounded-lg border border-border"
                                />
                                {videoOrientation && (
                                  <div className="text-sm text-muted-foreground">
                                    Video Orientation: {videoOrientation === "9:16" ? "9:16 (Reels/Shorts)" : "16:9 (Landscape Video)"}
                                  </div>
                                )}
                              </div>
                            ) : null}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setUploadedFile(null)
                                setFilePreview(null)
                                setVideoOrientation(null)
                              }}
                              className="mt-2"
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>
                      <Label>Thumbnail</Label>
                    </FieldLabel>
                    <FieldContent>
                      <div className="space-y-3">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          className="cursor-pointer"
                        />
                        {thumbnailPreview && (
                          <div className="mt-3">
                            <img
                              src={thumbnailPreview}
                              alt="Thumbnail preview"
                              className="max-w-full h-auto rounded-lg border border-border"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setThumbnailFile(null)
                                setThumbnailPreview(null)
                              }}
                              className="mt-2"
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </FieldContent>
                  </Field>
                </CardContent>
              </Card>

              {/* Platform Selection */}
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-sm">Select Platforms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {campaign && platformsConfig.map((platform) => {
                      // Only show platforms that are connected to this campaign
                      if (!campaign.connectedTo[platform.key]) return null
                      
                      const PlatformIcon = platform.icon
                      const isSelected = selectedPlatforms.has(platform.key)
                      
                      return (
                        <label
                          key={platform.key}
                          className="cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const newSelected = new Set(selectedPlatforms)
                              if (e.target.checked) {
                                newSelected.add(platform.key)
                              } else {
                                newSelected.delete(platform.key)
                              }
                              setSelectedPlatforms(newSelected)
                            }}
                            className="sr-only"
                          />
                          <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted/50"
                          )}>
                            <div 
                              className="size-6 rounded-full flex items-center justify-center shrink-0 text-white"
                              style={{ backgroundColor: platform.color }}
                            >
                              <HugeiconsIcon icon={PlatformIcon} className="size-3.5" />
                            </div>
                            <span className="text-xs font-medium">{platform.label}</span>
                            {isSelected && (
                              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5 text-primary" />
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Posting Settings */}
              <Card size="sm">
                <CardHeader>
                  <CardTitle className="text-sm">Posting Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <div className="space-y-4" style={{ boxSizing: 'content-box' }}>
                      <Field orientation="vertical">
                        <FieldLabel>
                          <Label>Scheduler</Label>
                        </FieldLabel>
                        <FieldContent>
                          <Label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={schedulerEnabled}
                              onChange={(e) => setSchedulerEnabled(e.target.checked)}
                              className="rounded border-border"
                            />
                            <span className="text-sm">Enable scheduler</span>
                          </Label>
                        </FieldContent>
                      </Field>
                      {schedulerEnabled && (
                        <Field>
                          <FieldLabel>
                            <Label>Schedule Date</Label>
                          </FieldLabel>
                          <FieldContent>
                            <div className="space-y-2">
                              <div className="flex flex-col gap-2">
                                <div className="relative flex-1">
                                  <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full cursor-pointer pr-10"
                                    onClick={(e) => {
                                      // Ensure calendar opens on click
                                      if (e.currentTarget.showPicker) {
                                        e.currentTarget.showPicker()
                                      }
                                    }}
                                  />
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <HugeiconsIcon icon={CalendarIcon} className="size-4 text-muted-foreground" />
                                  </div>
                                </div>
                                <div className="relative flex-1 sm:w-full">
                                  <Input
                                    type="time"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="w-full cursor-pointer pr-10"
                                  />
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <HugeiconsIcon icon={ClockIcon} className="size-4 text-muted-foreground" />
                                  </div>
                                </div>
                              </div>
                              {timezone && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <HugeiconsIcon icon={ClockIcon} className="size-3" />
                                  <span>{timezone}</span>
                                </div>
                              )}
                            </div>
                          </FieldContent>
                        </Field>
                      )}
                      <Field orientation="vertical">
                        <FieldLabel>
                          <Label className="text-xs">Daily Republish</Label>
                        </FieldLabel>
                        <FieldContent>
                          <div className="flex items-center gap-3 w-full">
                            <Label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={dailyRepublishEnabled}
                                onChange={(e) => setDailyRepublishEnabled(e.target.checked)}
                                className="rounded border-border"
                              />
                              <span className="text-sm">Enable daily republish</span>
                            </Label>
                            {dailyRepublishEnabled && (
                              <Input
                                type="number"
                                value={dailyRepublish}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1
                                  setDailyRepublish(Math.max(1, value))
                                }}
                                min={1}
                                className="w-24"
                                placeholder="Enter count"
                              />
                            )}
                          </div>
                        </FieldContent>
                      </Field>
                    </div>
                  </FieldGroup>
                </CardContent>
              </Card>


              {/* YouTube Specific Settings */}
              {isYoutubeSelected && (
                <Card size="sm">
                  <CardHeader>
                    <CardTitle className="text-sm">YouTube Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FieldGroup>
                      <Field>
                        <FieldLabel>
                          <Label>Audience Configuration</Label>
                        </FieldLabel>
                        <FieldContent>
                          <Select value={youtubeMadeForKids} onValueChange={(value) => setYoutubeMadeForKids(value || "")}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select option">
                                {youtubeMadeForKids === "yes" && "Yes, It's video made for kids"}
                                {youtubeMadeForKids === "no" && "Not made for kids"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes, It's video made for kids</SelectItem>
                              <SelectItem value="no">Not made for kids</SelectItem>
                            </SelectContent>
                          </Select>
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>
                          <Label>Tags</Label>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            value={youtubeTags}
                            onChange={(e) => setYoutubeTags(e.target.value)}
                            placeholder="Enter tags (comma separated)"
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>
                          <Label>Category</Label>
                        </FieldLabel>
                        <FieldContent>
                          <Select value={youtubeCategory} onValueChange={(value) => setYoutubeCategory(value || "")}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select category">
                                {youtubeCategory && categoryLabels[youtubeCategory]}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="autos">Autos & Vehicles</SelectItem>
                              <SelectItem value="comedy">Comedy</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="entertainment">Entertainment</SelectItem>
                              <SelectItem value="film">Film & Animation</SelectItem>
                              <SelectItem value="gaming">Gaming</SelectItem>
                              <SelectItem value="howto">Howto & Style</SelectItem>
                              <SelectItem value="music">Music</SelectItem>
                              <SelectItem value="news">News & Politics</SelectItem>
                              <SelectItem value="nonprofits">Nonprofits & Activism</SelectItem>
                              <SelectItem value="people">People & Blogs</SelectItem>
                              <SelectItem value="pets">Pets & Animals</SelectItem>
                              <SelectItem value="science">Science & Technology</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                              <SelectItem value="travel">Travel & Events</SelectItem>
                            </SelectContent>
                          </Select>
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  onClick={() => {
                    if (!title || selectedPlatforms.size === 0) return

                    // Format date and time
                    const scheduleDate = selectedDate || new Date().toISOString().split("T")[0]
                    let time = ""
                    if (selectedTime) {
                      const [hours, minutes] = selectedTime.split(":")
                      const hourNum = parseInt(hours)
                      const ampm = hourNum >= 12 ? "PM" : "AM"
                      const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum
                      time = `${displayHour}:${minutes} ${ampm}`
                    } else {
                      const now = new Date()
                      const hours = now.getHours()
                      const minutes = now.getMinutes()
                      const ampm = hours >= 12 ? "PM" : "AM"
                      const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
                      time = `${displayHour}:${minutes.toString().padStart(2, "0")} ${ampm}`
                    }

                    // Determine post type based on uploaded file
                    let postType: "image" | "video" | "text" = "text"
                    if (uploadedFile) {
                      if (uploadedFile.type.startsWith("image/")) {
                        postType = "image"
                      } else if (uploadedFile.type.startsWith("video/")) {
                        postType = "video"
                      }
                    }

                    // Create new scheduled content entry
                    const newPost: ScheduledContent = {
                      id: `content-${Date.now()}`,
                      date: scheduleDate,
                      time: time,
                      title: title,
                      description: description,
                      type: postType,
                      platforms: Array.from(selectedPlatforms) as Array<"facebook" | "instagram" | "tiktok" | "youtube">,
                      status: "scheduled",
                      contentText: description,
                    }

                    // Add to scheduled content
                    setScheduledContent((prev) => {
                      const updated = [newPost, ...prev]
                      // Sort by date (today -> future -> past)
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const todayTime = today.getTime()
                      
                      return updated.sort((a, b) => {
                        const dateA = new Date(a.date).getTime()
                        const dateB = new Date(b.date).getTime()
                        
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
                    })

                    // Reset form
                    setTitle("")
                    setDescription("")
                    if (campaign) {
                      const connected = new Set<"facebook" | "instagram" | "tiktok" | "youtube">()
                      if (campaign.connectedTo.facebook) connected.add("facebook")
                      if (campaign.connectedTo.instagram) connected.add("instagram")
                      if (campaign.connectedTo.tiktok) connected.add("tiktok")
                      if (campaign.connectedTo.youtube) connected.add("youtube")
                      setSelectedPlatforms(connected)
                    }
                    setUploadedFile(null)
                    setFilePreview(null)
                    setVideoOrientation(null)
                    setThumbnailFile(null)
                    setThumbnailPreview(null)
                    const today = new Date()
                    setSelectedDate(today.toISOString().split("T")[0])
                    const hours = today.getHours().toString().padStart(2, "0")
                    const minutes = today.getMinutes().toString().padStart(2, "0")
                    setSelectedTime(`${hours}:${minutes}`)
                    setDailyRepublishEnabled(false)
                    setDailyRepublish(1)
                    setYoutubeMadeForKids("")
                    setYoutubeTags("")
                    setYoutubeCategory("entertainment")

                    alert("Post scheduled successfully!")
                  }}
                  disabled={!title || selectedPlatforms.size === 0}
                  className="w-full h-12 text-base font-semibold"
                >
                  Post
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      // Handle draft save
                      // In a real app, this would save to drafts
                      // draftData can be used when draft functionality is implemented
                      alert("Post saved as draft!")
                    }}
                    className="flex-1"
                  >
                    Draft Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerDashboardLayout>
  )
}
