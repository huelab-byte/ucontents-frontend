import { apiClient, type ApiResponse } from '../client'

export type VideoOverlayStatus = 'ready' | 'pending' | 'failed'

export interface VideoOverlayMetadata {
  duration?: number
  resolution?: {
    width?: number
    height?: number
  }
  fps?: number
  format?: string
  orientation?: 'horizontal' | 'vertical'
}

export interface StorageFile {
  id: number
  url: string | null
  path: string
  size: number
  mime_type: string
}

export interface VideoOverlayFolder {
  id: number
  name: string
  parent_id: number | null
  path: string
  parent?: VideoOverlayFolder | null
  children?: VideoOverlayFolder[]
  video_overlay_count?: number
  created_at?: string
  updated_at?: string
}

export interface VideoOverlay {
  id: number
  title: string | null
  metadata: VideoOverlayMetadata | null
  status: VideoOverlayStatus
  folder_id: number | null
  folder?: VideoOverlayFolder | null
  storage_file?: StorageFile | null
  user_id: number
  created_at?: string
  updated_at?: string
}

export interface VideoOverlayStats {
  total_video_overlay: number
  ready_video_overlay: number
  processing_video_overlay: number
  pending_video_overlay: number
  failed_video_overlay: number
  total_size: number
  total_users_with_uploads?: number
}

export interface UserWithUploadCount {
  user_id: number
  user: {
    id: number
    name: string
    email: string
  } | null
  upload_count: number
}

export interface VideoOverlayListParams {
  folder_id?: number
  status?: VideoOverlayStatus
  per_page?: number
  page?: number
  user_id?: number
}

export interface CreateFolderRequest {
  name: string
  parent_id?: number | null
}

export interface UpdateVideoOverlayRequest {
  title?: string
  folder_id?: number | null
}

export const videoOverlayService = {
  /**
   * Admin: get video overlay statistics
   */
  async getAdminStats(): Promise<ApiResponse<VideoOverlayStats>> {
    return apiClient.get('/v1/admin/video-overlay/stats')
  },

  /**
   * Admin: get users with upload counts
   */
  async getUsersWithUploads(): Promise<ApiResponse<UserWithUploadCount[]>> {
    return apiClient.get('/v1/admin/video-overlay/users-with-uploads')
  },

  /**
   * Customer: list folders
   */
  async listFolders(parentId?: number | null): Promise<ApiResponse<VideoOverlayFolder[]>> {
    const params = parentId !== undefined ? { parent_id: parentId } : undefined
    return apiClient.get('/v1/customer/video-overlay/folders', { params })
  },

  /**
   * Customer: create folder
   */
  async createFolder(data: CreateFolderRequest): Promise<ApiResponse<VideoOverlayFolder>> {
    return apiClient.post('/v1/customer/video-overlay/folders', data, { skipToast: true })
  },

  /**
   * Customer: update folder
   */
  async updateFolder(id: number, data: CreateFolderRequest): Promise<ApiResponse<VideoOverlayFolder>> {
    return apiClient.put(`/v1/customer/video-overlay/folders/${id}`, data, { skipToast: true })
  },

  /**
   * Customer: delete folder
   */
  async deleteFolder(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/video-overlay/folders/${id}`, { skipToast: true })
  },

  /**
   * Customer: list video overlays
   */
  async listVideoOverlays(params?: VideoOverlayListParams): Promise<ApiResponse<VideoOverlay[]>> {
    return apiClient.get('/v1/customer/video-overlay/video-overlays', { params })
  },

  /**
   * Admin: list video overlays (all users)
   */
  async listVideoOverlaysAdmin(params?: VideoOverlayListParams): Promise<ApiResponse<VideoOverlay[]>> {
    return apiClient.get('/v1/admin/video-overlay/video-overlays', { params })
  },

  /**
   * Customer: get video overlay
   */
  async getVideoOverlay(id: number): Promise<ApiResponse<VideoOverlay>> {
    return apiClient.get(`/v1/customer/video-overlay/video-overlays/${id}`)
  },

  /**
   * Customer: update video overlay
   */
  async updateVideoOverlay(id: number, data: UpdateVideoOverlayRequest): Promise<ApiResponse<VideoOverlay>> {
    return apiClient.put(`/v1/customer/video-overlay/video-overlays/${id}`, data, { skipToast: true })
  },

  /**
   * Customer: delete video overlay
   */
  async deleteVideoOverlay(id: number, skipToast = false): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/video-overlay/video-overlays/${id}`, { skipToast })
  },

  /**
   * Customer: upload single video overlay with progress
   */
  async uploadVideoOverlay(
    file: File,
    data?: { folder_id?: number | null; title?: string },
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<VideoOverlay>> {
    const formData = new FormData()
    formData.append('file', file)
    if (data?.folder_id !== undefined && data?.folder_id !== null) {
      formData.append('folder_id', String(data.folder_id))
    }
    if (data?.title) {
      formData.append('title', data.title)
    }

    return apiClient.post('/v1/customer/video-overlay/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 minutes for upload
      skipToast: true,
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      },
    })
  },
}
