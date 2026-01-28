export interface Campaign {
  id: string
  name: string
  status: "active" | "paused" | "completed"
  createdAt: string
}

export interface ContentSource {
  id: string
  name: string
  aspectRatio: "9:16" | "16:9"
  orientation: "vertical" | "landscape"
  schedulerEnabled: boolean
  campaigns: Campaign[]
  totalVideos: number
  createdAt: string
}
