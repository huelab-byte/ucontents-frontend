export interface Library {
  id: number | string
  name: string
  parent_id?: number | null
  path?: string
  parent?: Library | null
  children?: Library[]
  audio_count?: number
  /** BGM/demo: total tracks in folder */
  trackCount?: number
  created_at?: string
  updated_at?: string
  /** BGM/demo: human-readable last updated */
  lastUpdated?: string
  /** BGM/demo: starred folder */
  isStarred?: boolean
  description?: string
}

export interface AudioClip {
  id: string
  filename: string
  status: "ready" | "processing" | "pending" | "failed"
  audioUrl?: string | null
  uploadProgress?: number // 0-100
}

/** Used by BGM folder page and audio-tracks-table (duration, play, status READY/PROCESSING/NEW) */
export interface AudioTrack {
  id: string
  filename: string
  duration?: string
  lastUpdated?: string
  status: "READY" | "PROCESSING" | "NEW" | string
  url?: string | null
  uploadProgress?: number
}
