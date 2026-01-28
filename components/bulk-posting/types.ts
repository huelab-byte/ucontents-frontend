export interface BulkPostingItem {
  id: string
  brand: {
    name: string
    logo?: string
    projectName: string
  }
  connectedTo: {
    facebook: boolean
    instagram: boolean
    tiktok: boolean
    youtube: boolean
  }
  contentSource: string[]
  totalPost: number
  postedAmount: number
  remainingContent: number
  startedDate: string
  status: "draft" | "running" | "completed" | "paused" | "failed"
}

export interface ScheduledContent {
  id: string
  date: string
  time: string
  title: string
  description: string
  type: "image" | "video" | "text"
  platforms: Array<"facebook" | "instagram" | "tiktok" | "youtube">
  thumbnail?: string
  status: "scheduled" | "published" | "error"
  contentText?: string
}
