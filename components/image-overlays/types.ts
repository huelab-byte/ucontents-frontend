export interface Library {
  id: string
  name: string
  description: string
  itemCount: number
  lastUpdated: string
  isStarred?: boolean
}

export interface ImageOverlay {
  id: string
  filename: string
  fileSize: string
  lastUpdated: string
  status?: "READY" | "NEW" | "PROCESSING"
  uploadProgress?: number
  url?: string
}
