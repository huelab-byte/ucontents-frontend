import { apiClient, type ApiResponse } from '../client'

export type ImageOverlayStatus = 'ready' | 'processing' | 'pending' | 'failed'

export interface ImageOverlayMetadata {
  description?: string
  tags?: string[]
  width?: number
  height?: number
  format?: string
  file_size?: number
}

export interface StorageFile {
  id: number
  url: string | null
  path: string
  size: number
  mime_type: string
}

export interface ImageOverlayFolder {
  id: number
  name: string
  parent_id: number | null
  path: string
  parent?: ImageOverlayFolder | null
  children?: ImageOverlayFolder[]
  image_overlay_count?: number
  created_at?: string
  updated_at?: string
}

export interface ImageOverlay {
  id: number
  title: string | null
  metadata: ImageOverlayMetadata | null
  status: ImageOverlayStatus
  folder_id: number | null
  folder?: ImageOverlayFolder | null
  storage_file?: StorageFile | null
  user_id: number
  created_at?: string
  updated_at?: string
}

export interface ImageOverlayStats {
  total_image_overlay: number
  ready_image_overlay: number
  processing_image_overlay: number
  pending_image_overlay: number
  failed_image_overlay: number
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

export interface UploadQueueStatus {
  id: number
  file_name: string
  status: string
  progress: number | null
  error_message: string | null
  image_overlay_id: number | null
  created_at: string
}

export interface ImageOverlayListParams {
  folder_id?: number
  status?: ImageOverlayStatus
  per_page?: number
  page?: number
  user_id?: number
}

export interface CreateFolderRequest {
  name: string
  parent_id?: number | null
}

export interface UpdateImageOverlayRequest {
  title?: string
  folder_id?: number | null
  metadata?: ImageOverlayMetadata
}

export const imageOverlayService = {
  /**
   * Admin: get image overlay statistics
   */
  async getAdminStats(): Promise<ApiResponse<ImageOverlayStats>> {
    return apiClient.get('/v1/admin/image-overlay/stats')
  },

  /**
   * Admin: get users with upload counts
   */
  async getUsersWithUploads(): Promise<ApiResponse<UserWithUploadCount[]>> {
    return apiClient.get('/v1/admin/image-overlay/users-with-uploads')
  },

  /**
   * Customer: list folders
   */
  async listFolders(parentId?: number | null): Promise<ApiResponse<ImageOverlayFolder[]>> {
    const params = parentId !== undefined ? { parent_id: parentId } : undefined
    return apiClient.get('/v1/customer/image-overlay/folders', { params })
  },

  /**
   * Customer: create folder
   */
  async createFolder(data: CreateFolderRequest): Promise<ApiResponse<ImageOverlayFolder>> {
    return apiClient.post('/v1/customer/image-overlay/folders', data, { skipToast: true })
  },

  /**
   * Customer: update folder
   */
  async updateFolder(id: number, data: CreateFolderRequest): Promise<ApiResponse<ImageOverlayFolder>> {
    return apiClient.put(`/v1/customer/image-overlay/folders/${id}`, data, { skipToast: true })
  },

  /**
   * Customer: delete folder
   */
  async deleteFolder(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/image-overlay/folders/${id}`, { skipToast: true })
  },

  /**
   * Customer: list folders that have browse-visible image overlays (read-only; requires use_image_overlay)
   */
  async browseFolders(): Promise<ApiResponse<ImageOverlayFolder[]>> {
    return apiClient.get('/v1/customer/image-overlay/browse/folders')
  },

  /**
   * Customer: browse image overlays (read-only; requires use_image_overlay)
   */
  async browseImageOverlays(params?: ImageOverlayListParams): Promise<ApiResponse<ImageOverlay[]>> {
    return apiClient.get('/v1/customer/image-overlay/browse', { params })
  },

  async getBrowseImageOverlay(id: number): Promise<ApiResponse<ImageOverlay>> {
    return apiClient.get(`/v1/customer/image-overlay/browse/${id}`)
  },

  async listImageOverlays(params?: ImageOverlayListParams): Promise<ApiResponse<ImageOverlay[]>> {
    return apiClient.get('/v1/customer/image-overlay/image-overlays', { params })
  },

  /**
   * Admin: list image overlays (all users)
   */
  async listImageOverlaysAdmin(params?: ImageOverlayListParams): Promise<ApiResponse<ImageOverlay[]>> {
    return apiClient.get('/v1/admin/image-overlay/image-overlays', { params })
  },

  /**
   * Customer: get image overlay
   */
  async getImageOverlay(id: number): Promise<ApiResponse<ImageOverlay>> {
    return apiClient.get(`/v1/customer/image-overlay/image-overlays/${id}`)
  },

  /**
   * Customer: update image overlay
   */
  async updateImageOverlay(id: number, data: UpdateImageOverlayRequest): Promise<ApiResponse<ImageOverlay>> {
    return apiClient.put(`/v1/customer/image-overlay/image-overlays/${id}`, data, { skipToast: true })
  },

  /**
   * Customer: delete image overlay
   */
  async deleteImageOverlay(id: number, skipToast = false): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/image-overlay/image-overlays/${id}`, { skipToast })
  },

  /**
   * Customer: upload single image overlay with progress
   */
  async uploadImageOverlay(
    file: File,
    data?: { folder_id?: number | null; title?: string },
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<ImageOverlay>> {
    const formData = new FormData()
    formData.append('file', file)
    if (data?.folder_id !== undefined && data?.folder_id !== null) {
      formData.append('folder_id', String(data.folder_id))
    }
    if (data?.title) {
      formData.append('title', data.title)
    }

    return apiClient.post('/v1/customer/image-overlay/upload', formData, {
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

  /**
   * Customer: bulk upload image overlays
   */
  async bulkUploadImageOverlays(
    files: File[],
    data?: { folder_id?: number | null }
  ): Promise<ApiResponse<{ queued_items: UploadQueueStatus[]; count: number }>> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files[]', file)
    })
    if (data?.folder_id !== undefined && data?.folder_id !== null) {
      formData.append('folder_id', String(data.folder_id))
    }

    return apiClient.post('/v1/customer/image-overlay/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes for bulk uploads
      skipToast: true,
    })
  },

  /**
   * Customer: get upload queue status
   */
  async getUploadQueueStatus(id: number): Promise<ApiResponse<UploadQueueStatus>> {
    return apiClient.get(`/v1/customer/image-overlay/upload-queue/${id}`)
  },
}
