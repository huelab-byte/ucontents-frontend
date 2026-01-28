export interface TopicToVideo {
  id: string
  name: string
  topic: string
  aspectRatio: "9:16" | "16:9"
  orientation: "vertical" | "landscape"
  status: "draft" | "processing" | "completed" | "failed"
  videosGenerated: number
  createdAt: string
  schedulerEnabled?: boolean
  categories?: string[]
}

export interface Category {
  id: string
  name: string
  color?: string
}
