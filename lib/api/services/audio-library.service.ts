import { apiClient, type ApiResponse } from '../client'

export type AudioStatus = 'ready' | 'processing' | 'pending' | 'failed'

export interface AudioMetadata {
  description?: string
  tags?: string[]
  duration?: number
  bitrate?: number
  sample_rate?: number
  channels?: number
  format?: string
  ai_metadata_source?: string
}

export interface StorageFile {
  id: number
  url: string | null
  path: string
  size: number
  mime_type: string
}

export interface AudioFolder {
  id: number
  name: string
  parent_id: number | null
  path: string
  parent?: AudioFolder | null
  children?: AudioFolder[]
  audio_count?: number
  created_at?: string
  updated_at?: string
}

export interface Audio {
  id: number
  title: string | null
  metadata: AudioMetadata | null
  status: AudioStatus
  folder_id: number | null
  folder?: AudioFolder | null
  storage_file?: StorageFile | null
  user_id: number
  created_at?: string
  updated_at?: string
}

export interface AudioStats {
  total_audio: number
  ready_audio: number
  processing_audio: number
  pending_audio: number
  failed_audio: number
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
  audio_id: number | null
  created_at: string
}

export interface AudioListParams {
  folder_id?: number
  status?: AudioStatus
  per_page?: number
  page?: number
  user_id?: number
}

export interface CreateFolderRequest {
  name: string
  parent_id?: number | null
}

export interface UpdateAudioRequest {
  title?: string
  folder_id?: number | null
  metadata?: AudioMetadata
}

export const audioLibraryService = {
  /**
   * Admin: get audio statistics
   */
  async getAdminStats(): Promise<ApiResponse<AudioStats>> {
    return apiClient.get('/v1/admin/audio-library/stats')
  },

  /**
   * Admin: get users with upload counts
   */
  async getUsersWithUploads(): Promise<ApiResponse<UserWithUploadCount[]>> {
    return apiClient.get('/v1/admin/audio-library/users-with-uploads')
  },

  /**
   * Customer: list folders
   */
  async listFolders(parentId?: number | null): Promise<ApiResponse<AudioFolder[]>> {
    const params = parentId !== undefined ? { parent_id: parentId } : undefined
    return apiClient.get('/v1/customer/audio-library/folders', { params })
  },

  /**
   * Customer: create folder
   */
  async createFolder(data: CreateFolderRequest): Promise<ApiResponse<AudioFolder>> {
    return apiClient.post('/v1/customer/audio-library/folders', data, { skipToast: true })
  },

  /**
   * Customer: update folder
   */
  async updateFolder(id: number, data: CreateFolderRequest): Promise<ApiResponse<AudioFolder>> {
    return apiClient.put(`/v1/customer/audio-library/folders/${id}`, data, { skipToast: true })
  },

  /**
   * Customer: delete folder
   */
  async deleteFolder(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/audio-library/folders/${id}`, { skipToast: true })
  },

  /**
   * Customer: list audio
   */
  async listAudio(params?: AudioListParams): Promise<ApiResponse<Audio[]>> {
    return apiClient.get('/v1/customer/audio-library/audio', { params })
  },

  /**
   * Admin: list audio (all users)
   */
  async listAudioAdmin(params?: AudioListParams): Promise<ApiResponse<Audio[]>> {
    return apiClient.get('/v1/admin/audio-library/audio', { params })
  },

  /**
   * Customer: get audio
   */
  async getAudio(id: number): Promise<ApiResponse<Audio>> {
    return apiClient.get(`/v1/customer/audio-library/audio/${id}`)
  },

  /**
   * Customer: update audio
   */
  async updateAudio(id: number, data: UpdateAudioRequest): Promise<ApiResponse<Audio>> {
    return apiClient.put(`/v1/customer/audio-library/audio/${id}`, data, { skipToast: true })
  },

  /**
   * Customer: delete audio
   */
  async deleteAudio(id: number, skipToast = false): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/audio-library/audio/${id}`, { skipToast })
  },

  /**
   * Customer: upload single audio with progress
   */
  async uploadAudio(
    file: File,
    data?: { folder_id?: number | null; title?: string },
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<Audio>> {
    const formData = new FormData()
    formData.append('file', file)
    if (data?.folder_id !== undefined && data?.folder_id !== null) {
      formData.append('folder_id', String(data.folder_id))
    }
    if (data?.title) {
      formData.append('title', data.title)
    }

    return apiClient.post('/v1/customer/audio-library/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 minutes for upload
      skipToast: true, // Don't show individual toasts for batch uploads
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) return
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      },
    })
  },

  /**
   * Customer: bulk upload audio
   */
  async bulkUploadAudio(
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

    return apiClient.post('/v1/customer/audio-library/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000, // 5 minutes for bulk uploads
      skipToast: true,
    })
  },

  /**
   * Customer: get upload queue status
   */
  async getUploadQueueStatus(id: number): Promise<ApiResponse<UploadQueueStatus>> {
    return apiClient.get(`/v1/customer/audio-library/upload-queue/${id}`)
  },
}
