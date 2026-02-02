export type ContentSourceType = "csv_file" | "media_upload"

// Connection selection can be individual channels or groups
export interface ConnectionSelection {
  channels: number[] // Array of SocialChannel IDs
  groups: number[] // Array of SocialConnectionGroup IDs
}

export type ScheduleCondition = "minute" | "hourly" | "daily" | "weekly" | "monthly"

export interface ConnectedToPlatforms {
  facebook?: boolean
  instagram?: boolean
  tiktok?: boolean
  youtube?: boolean
}

export interface BulkPostingItem {
  id: string
  brand: {
    name: string
    logo?: string
    projectName: string
  }
  connections: ConnectionSelection
  connectedTo?: ConnectedToPlatforms | null
  contentSourceType: ContentSourceType
  contentSource: string[] // For media_upload: folder names; For csv_file: empty or filename
  csvFile?: File | null
  totalPost: number
  postedAmount: number
  remainingContent: number
  startedDate: string
  status: "draft" | "running" | "completed" | "paused" | "failed"
  scheduleCondition?: ScheduleCondition
  scheduleInterval?: number
  repostEnabled?: boolean
  repostCondition?: ScheduleCondition
  repostInterval?: number
  repostMaxCount?: number
}

export interface NetworkResult {
  channelId: string
  provider: string // 'meta', 'google', 'tiktok'
  type: string // 'facebook_page', 'facebook_profile', 'instagram_business', 'youtube_channel', 'tiktok_account'
  name: string
  success: boolean
  externalPostId?: string | null
  error?: string | null
}

export interface ScheduledContent {
  id: string
  publishedAt: string // ISO datetime string
  title: string
  description: string
  type: "image" | "video" | "text"
  platforms: Array<"facebook" | "instagram" | "tiktok" | "youtube">
  networkResults?: NetworkResult[]
  thumbnail?: string
  status: "scheduled" | "published" | "error"
  contentText?: string
}
