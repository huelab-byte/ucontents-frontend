import { apiClient, type ApiResponse } from '../client'

export type ImageStatus = 'ready' | 'processing' | 'pending' | 'failed'

export interface ImageMetadata {
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

export interface ImageFolder {
  id: number
  name: string
  parent_id: number | null
  path: string
  parent?: ImageFolder | null
  children?: ImageFolder[]
  image_count?: number
  created_at?: string
  updated_at?: string
}

export interface Image {
  id: number
  title: string | null
  metadata: ImageMetadata | null
  status: ImageStatus
  folder_id: number | null
  folder?: ImageFolder | null
  storage_file?: StorageFile | null
  user_id: number
  created_at?: string
  updated_at?: string
}

export interface ImageStats {
  total_image: number
  ready_image: number
  processing_image: number
  pending_image: number
  failed_image: number
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
  image_id: number | null
  created_at: string
}

export interface ImageListParams {
  folder_id?: number
  status?: ImageStatus
  per_page?: number
  page?: number
  user_id?: number
}

export interface CreateFolderRequest {
  name: string
  parent_id?: number | null
}

export interface UpdateImageRequest {
  title?: string
  folder_id?: number | null
  metadata?: ImageMetadata
}

export const imageLibraryService = {
  /**
   * Admin: get image statistics
   */
  async getAdminStats(): Promise<ApiResponse<ImageStats>> {
    return apiClient.get('/v1/admin/image-library/stats')
  },

  /**
   * Admin: get users with upload counts
   */
  async getUsersWithUploads(): Promise<ApiResponse<UserWithUploadCount[]>> {
    return apiClient.get('/v1/admin/image-library/users-with-uploads')
  },

  /**
   * Customer: list folders
   */
  async listFolders(parentId?: number | null): Promise<ApiResponse<ImageFolder[]>> {
    const params = parentId !== undefined ? { parent_id: parentId } : undefined
    return apiClient.get('/v1/customer/image-library/folders', { params })
  },

  /**
   * Customer: create folder
   */
  async createFolder(data: CreateFolderRequest): Promise<ApiResponse<ImageFolder>> {
    return apiClient.post('/v1/customer/image-library/folders', data, { skipToast: true })
  },

  /**
   * Customer: update folder
   */
  async updateFolder(id: number, data: CreateFolderRequest): Promise<ApiResponse<ImageFolder>> {
    return apiClient.put(`/v1/customer/image-library/folders/${id}`, data, { skipToast: true })
  },

  /**
   * Customer: delete folder
   */
  async deleteFolder(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/image-library/folders/${id}`, { skipToast: true })
  },

  /**
   * Customer: list images
   */
  async listImages(params?: ImageListParams): Promise<ApiResponse<Image[]>> {
    return apiClient.get('/v1/customer/image-library/images', { params })
  },

  /**
   * Admin: list images (all users)
   */
  async listImagesAdmin(params?: ImageListParams): Promise<ApiResponse<Image[]>> {
    return apiClient.get('/v1/admin/image-library/images', { params })
  },

  /**
   * Customer: get image
   */
  async getImage(id: number): Promise<ApiResponse<Image>> {
    return apiClient.get(`/v1/customer/image-library/images/${id}`)
  },

  /**
   * Customer: update image
   */
  async updateImage(id: number, data: UpdateImageRequest): Promise<ApiResponse<Image>> {
    return apiClient.put(`/v1/customer/image-library/images/${id}`, data, { skipToast: true })
  },

  /**
   * Customer: delete image
   */
  async deleteImage(id: number, skipToast = false): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/image-library/images/${id}`, { skipToast })
  },

  /**
   * Customer: upload single image with progress
   */
  async uploadImage(
    file: File,
    data?: { folder_id?: number | null; title?: string },
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<Image>> {
    const formData = new FormData()
    formData.append('file', file)
    if (data?.folder_id !== undefined && data?.folder_id !== null) {
      formData.append('folder_id', String(data.folder_id))
    }
    if (data?.title) {
      formData.append('title', data.title)
    }

    return apiClient.post('/v1/customer/image-library/upload', formData, {
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
   * Customer: bulk upload images
   */
  async bulkUploadImages(
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

    return apiClient.post('/v1/customer/image-library/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes for bulk uploads
      skipToast: true,
    })
  },

  /**
   * Customer: get upload queue status
   */
  async getUploadQueueStatus(id: number): Promise<ApiResponse<UploadQueueStatus>> {
    return apiClient.get(`/v1/customer/image-library/upload-queue/${id}`)
  },
}
