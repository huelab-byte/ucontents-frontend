export interface Library {
  id: number
  name: string
  parent_id?: number | null
  path?: string
  image_overlay_count?: number
  created_at?: string
  updated_at?: string
}

export interface ImageClip {
  id: string
  filename: string
  imageUrl?: string
  thumbnailUrl?: string
  status: "ready" | "processing" | "pending" | "failed"
  uploadProgress?: number
  width?: number
  height?: number
  format?: string
  fileSize?: number
}
