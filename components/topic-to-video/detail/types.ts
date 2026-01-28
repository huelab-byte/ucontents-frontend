export interface GeneratedVideo {
  id: string
  title: string
  description: string
  hashtags: string
  videoUrl?: string
  thumbnailUrl?: string
  duration?: string
  createdAt: string
  status?: "draft" | "processing" | "completed" | "failed"
  schedulerEnabled?: boolean
  settings?: {
    template?: string
    videoType?: string
    transitions?: string
    backgroundMusic?: boolean
    subtitles?: boolean
    voiceTts?: boolean
    footageLibrary?: string
    thumbnail?: string
  }
}

export interface TopicToVideo {
  id: string
  name: string
  topic: string
  aspectRatio: "9:16" | "16:9"
  orientation: "vertical" | "landscape"
  status: "draft" | "processing" | "completed" | "failed"
  videosGenerated: number
  createdAt: string
}

export interface VideoGenerationSettings {
  style: "cinematic" | "documentary" | "vlog" | "tutorial" | "promotional"
  duration: "short" | "medium" | "long"
  includeCaptions: boolean
  includeMusic: boolean
  voiceOver: boolean
  customPrompt?: string
}
