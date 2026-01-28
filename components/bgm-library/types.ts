export interface Library {
  id: number
  name: string
  parent_id?: number | null
  path?: string
  parent?: Library | null
  children?: Library[]
  bgm_count?: number
  created_at?: string
  updated_at?: string
}

export interface AudioClip {
  id: string
  filename: string
  status: "ready" | "processing" | "pending" | "failed"
  audioUrl?: string | null
  uploadProgress?: number // 0-100
}
