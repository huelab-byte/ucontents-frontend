export interface VideoFile {
  id: string
  filename: string
  fileSize: number
  status: "QUEUED" | "UPLOADING" | "PROCESSING" | "COMPLETED" | "FAILED"
  uploadProgress?: number
  url?: string
  error?: string
}

export interface ContentSource {
  id: string
  name: string
  aspectRatio: "9:16" | "16:9"
  orientation: "vertical" | "landscape"
  schedulerEnabled: boolean
  totalVideos: number
  createdAt: string
}

export interface CaptionTemplate {
  id: string
  name: string
  font: string
  fontSize: number
  fontColor: string
  outlineColor: string
  outlineSize: number
  position: "top" | "center" | "bottom" | "instagram"
  wordsPerCaption: number
  wordHighlighting: boolean
  highlightColor: string
  highlightStyle: "text" | "background"
  backgroundOpacity: number
}

export interface CaptionSettings {
  templateId: string | null
  font: string
  fontSize: number
  fontColor: string
  outlineColor: string
  outlineSize: number
  position: "top" | "center" | "bottom" | "instagram"
  wordsPerCaption: number
  wordHighlighting: boolean
  highlightColor: string
  highlightStyle: "text" | "background"
  backgroundOpacity: number
}

export interface PromptTemplate {
  id: string
  name: string
  prompt: string
}

export interface PromptSettings {
  templateId: string | null
  customPrompt: string
  contentFromFrameExtract: boolean
}

export interface ContentMetadata {
  id: string
  youtubeHeadline: string
  postCaption: string
  hashtags: string
  videoUrl?: string
  createdAt: string
  status?: "draft" | "published" | "scheduled"
}
