import { apiClient, type ApiResponse } from '../client'

export type FootageStatus = 'ready' | 'processing' | 'pending' | 'failed'

export interface FootageMetadata {
  description?: string
  tags?: string[]
  orientation?: 'horizontal' | 'vertical'
  duration?: number
  resolution?: {
    width?: number
    height?: number
  }
  fps?: number
  format?: string
  extracted_frames?: string[]
  ai_metadata_source?: string
}

export interface StorageFile {
  id: number
  url: string | null
  path: string
  size: number
  mime_type: string
}

export interface FootageFolder {
  id: number
  name: string
  parent_id: number | null
  path: string
  parent?: FootageFolder | null
  children?: FootageFolder[]
  footage_count?: number
  created_at?: string
  updated_at?: string
}

export interface Footage {
  id: number
  title: string | null
  metadata: FootageMetadata | null
  status: FootageStatus
  folder_id: number | null
  folder?: FootageFolder | null
  storage_file?: StorageFile | null
  user_id: number
  created_at?: string
  updated_at?: string
}

export interface FootageStats {
  total_footage: number
  ready_footage: number
  processing_footage: number
  pending_footage: number
  failed_footage: number
  with_embeddings: number
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
  footage_id: number | null
  created_at: string
}

export interface SearchResult {
  footage: Footage
  score: number
}

export interface FootageListParams {
  folder_id?: number
  status?: FootageStatus
  per_page?: number
  page?: number
  user_id?: number
  orientation?: ('horizontal' | 'vertical')[]
}

export interface CreateFolderRequest {
  name: string
  parent_id?: number | null
}

export interface UpdateFootageRequest {
  title?: string
  folder_id?: number | null
  metadata?: FootageMetadata
}

export interface SearchFootageRequest {
  search_text: string
  content_length: number
  folder_id?: number | null
  orientation?: 'horizontal' | 'vertical'
  footage_length?: number
}

export const footageLibraryService = {
  /**
   * Admin: get footage statistics
   */
  async getAdminStats(): Promise<ApiResponse<FootageStats>> {
    return apiClient.get('/v1/admin/footage-library/stats')
  },

  /**
   * Admin: get users with upload counts
   */
  async getUsersWithUploads(): Promise<ApiResponse<UserWithUploadCount[]>> {
    return apiClient.get('/v1/admin/footage-library/users-with-uploads')
  },

  /**
   * Customer: list folders
   */
  async listFolders(parentId?: number | null): Promise<ApiResponse<FootageFolder[]>> {
    const params = parentId !== undefined ? { parent_id: parentId } : undefined
    return apiClient.get('/v1/customer/footage-library/folders', { params })
  },

  /**
   * Customer: create folder
   */
  async createFolder(data: CreateFolderRequest): Promise<ApiResponse<FootageFolder>> {
    return apiClient.post('/v1/customer/footage-library/folders', data, { skipToast: true })
  },

  /**
   * Customer: update folder
   */
  async updateFolder(id: number, data: CreateFolderRequest): Promise<ApiResponse<FootageFolder>> {
    return apiClient.put(`/v1/customer/footage-library/folders/${id}`, data, { skipToast: true })
  },

  /**
   * Customer: delete folder
   */
  async deleteFolder(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/footage-library/folders/${id}`, { skipToast: true })
  },

  /**
   * Customer: list footage
   */
  async listFootage(params?: FootageListParams): Promise<ApiResponse<Footage[]>> {
    return apiClient.get('/v1/customer/footage-library/footage', { params })
  },

  /**
   * Admin: list footage (all users)
   */
  async listFootageAdmin(params?: FootageListParams): Promise<ApiResponse<Footage[]>> {
    return apiClient.get('/v1/admin/footage-library/footage', { params })
  },

  /**
   * Customer: get footage
   */
  async getFootage(id: number): Promise<ApiResponse<Footage>> {
    return apiClient.get(`/v1/customer/footage-library/footage/${id}`)
  },

  /**
   * Customer: update footage
   */
  async updateFootage(id: number, data: UpdateFootageRequest): Promise<ApiResponse<Footage>> {
    return apiClient.put(`/v1/customer/footage-library/footage/${id}`, data, { skipToast: true })
  },

  /**
   * Customer: delete footage
   */
  async deleteFootage(id: number, skipToast = false): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/footage-library/footage/${id}`, { skipToast })
  },

  /**
   * Customer: upload single footage with progress
   */
  async uploadFootage(
    file: File,
    data?: { folder_id?: number | null; title?: string; metadata_source?: 'title' | 'frames' | 'none' },
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<Footage>> {
    const formData = new FormData()
    formData.append('file', file)
    if (data?.folder_id !== undefined && data?.folder_id !== null) {
      formData.append('folder_id', String(data.folder_id))
    }
    if (data?.title) {
      formData.append('title', data.title)
    }
    if (data?.metadata_source) {
      formData.append('metadata_source', data.metadata_source)
    }

    return apiClient.post('/v1/customer/footage-library/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 minutes for upload + AI processing
      skipToast: true, // Don't show individual toasts for batch uploads
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      },
    })
  },

  /**
   * Customer: bulk upload footage
   */
  async bulkUploadFootage(
    files: File[],
    data?: { folder_id?: number | null; metadata_source?: 'title' | 'frames' }
  ): Promise<ApiResponse<{ queued_items: UploadQueueStatus[]; count: number }>> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files[]', file)
    })
    if (data?.folder_id !== undefined && data?.folder_id !== null) {
      formData.append('folder_id', String(data.folder_id))
    }
    if (data?.metadata_source) {
      formData.append('metadata_source', data.metadata_source)
    }

    return apiClient.post('/v1/customer/footage-library/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes for bulk uploads
      skipToast: true,
    })
  },

  /**
   * Customer: get upload queue status
   */
  async getUploadQueueStatus(id: number): Promise<ApiResponse<UploadQueueStatus>> {
    return apiClient.get(`/v1/customer/footage-library/upload-queue/${id}`)
  },

  /**
   * Customer: generate metadata
   */
  async generateMetadata(id: number, metadata_source: 'title' | 'frames'): Promise<ApiResponse<Footage>> {
    return apiClient.post(
      `/v1/customer/footage-library/footage/${id}/generate-metadata`,
      { metadata_source },
      { skipToast: true, timeout: 120000 } // 2 minutes for AI processing
    )
  },

  /**
   * Customer: search footage
   */
  async searchFootage(data: SearchFootageRequest): Promise<ApiResponse<SearchResult[]>> {
    return apiClient.post('/v1/customer/footage-library/search', data, { skipToast: true })
  },
}
