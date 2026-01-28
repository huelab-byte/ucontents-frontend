export interface Library {
  id: number
  name: string
  parent_id?: number | null
  path?: string
  parent?: Library | null
  children?: Library[]
  footage_count?: number
  horizontal_count?: number
  vertical_count?: number
  created_at?: string
  updated_at?: string
}

export interface VideoClip {
  id: string
  filename: string
  status: "ready" | "processing" | "pending" | "failed"
  videoUrl?: string | null
  orientation?: "horizontal" | "vertical"
  uploadProgress?: number // 0-100
}
