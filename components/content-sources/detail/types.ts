export interface VideoFile {
  id: string
  filename: string
  fileSize: number
  status: "QUEUED" | "UPLOADING" | "PROCESSING" | "COMPLETED" | "FAILED"
  uploadProgress?: number
  url?: string
  error?: string
  /** Folder id for multi-folder upload; defaults to current folder when not set. */
  folderId?: number
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
  fontWeight?: FontWeight
  fontColor: string
  outlineColor: string
  outlineSize: number
  position: "top" | "center" | "bottom"
  positionOffset?: number
  wordsPerCaption: number
  wordHighlighting: boolean
  highlightColor: string
  highlightStyle: "text" | "background"
  backgroundOpacity: number
  enableAlternatingLoop?: boolean
  loopCount?: number
}

export type FontWeight = "regular" | "bold" | "italic" | "bold_italic" | "black"

export interface CaptionSettings {
  templateId: string | null
  enableVideoCaption: boolean
  font: string
  fontSize: number
  fontWeight: FontWeight
  fontColor: string
  outlineEnabled: boolean
  outlineColor: string
  outlineSize: number
  position: "top" | "center" | "bottom"
  positionOffset: number
  wordsPerCaption: number
  wordHighlighting: boolean
  highlightColor: string
  highlightStyle: "text" | "background"
  backgroundOpacity: number
  enableAlternatingLoop: boolean
  loopCount: number
}

export interface PromptTemplate {
  id: string
  name: string
  prompt: string
}

export type ContentSourceType = "prompt" | "frame_extract" | "video_title"

export interface PromptSettings {
  templateId: string | null
  customPrompt: string
  contentFromFrameExtract: boolean
  contentSourceType: ContentSourceType | null
  headingLength: number
  headingEmoji: boolean
  postCaptionLength: number
  hashtagsCount: number
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
