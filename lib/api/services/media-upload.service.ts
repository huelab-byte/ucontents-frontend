import { apiClient, type ApiResponse } from '../client'

export interface MediaUploadFolder {
  id: number
  name: string
  parent_id: number | null
  parent?: MediaUploadFolder | null
  children?: MediaUploadFolder[]
  media_uploads_count?: number
  content_settings?: MediaUploadContentSettings | null
  created_at?: string
  updated_at?: string
}

export interface MediaUploadContentSettings {
  id: number
  folder_id: number
  content_source_type: 'prompt' | 'frames' | 'title'
  ai_prompt_template_id?: number | null
  custom_prompt?: string | null
  heading_length: number
  heading_emoji: boolean
  caption_length: number
  hashtag_count: number
  default_caption_template_id?: number | null
  default_loop_count: number
  default_enable_reverse: boolean
  created_at?: string
  updated_at?: string
}

export interface CaptionTemplate {
  id: number
  name: string
  font: string
  font_size: number
  font_weight?: string
  font_color: string
  outline_color: string
  outline_size: number
  position: 'top' | 'center' | 'bottom'
  position_offset?: number
  words_per_caption: number
  word_highlighting: boolean
  highlight_color?: string | null
  highlight_style: 'text' | 'background'
  background_opacity: number
  enable_alternating_loop: boolean
  loop_count: number
  created_at?: string
  updated_at?: string
}

export interface MediaUploadStorageFile {
  id: number
  url: string | null
  path: string
  size: number
  mime_type: string
}

export type MediaUploadStatus = 'pending' | 'processing' | 'ready' | 'failed'

export interface MediaUpload {
  id: number
  title: string | null
  status: MediaUploadStatus
  folder_id: number
  youtube_heading?: string | null
  social_caption?: string | null
  hashtags?: string[] | null
  video_metadata?: Record<string, unknown> | null
  loop_count: number
  enable_reverse: boolean
  processed_at?: string | null
  storage_file?: MediaUploadStorageFile | null
  created_at?: string
  updated_at?: string
}

export interface UploadQueueStatus {
  id: number
  file_name: string
  status: string
  progress: number | null
  error_message: string | null
  media_upload_id: number | null
  created_at: string
}

export interface CreateFolderRequest {
  name: string
  parent_id?: number | null
}

export interface UpdateFolderRequest {
  name?: string
  parent_id?: number | null
}

export interface UpdateContentSettingsRequest {
  content_source_type?: 'prompt' | 'frames' | 'title'
  ai_prompt_template_id?: number | null
  custom_prompt?: string | null
  heading_length?: number
  heading_emoji?: boolean
  caption_length?: number
  hashtag_count?: number
  default_caption_template_id?: number | null
  default_loop_count?: number
  default_enable_reverse?: boolean
}

export interface CreateCaptionTemplateRequest {
  name: string
  font?: string
  font_size?: number
  font_weight?: string
  font_color?: string
  outline_color?: string
  outline_size?: number
  position?: 'top' | 'center' | 'bottom'
  position_offset?: number
  words_per_caption?: number
  word_highlighting?: boolean
  highlight_color?: string | null
  highlight_style?: 'text' | 'background'
  background_opacity?: number
  enable_alternating_loop?: boolean
  loop_count?: number
}

export interface UpdateCaptionTemplateRequest extends Partial<CreateCaptionTemplateRequest> {}

export interface UpdateMediaUploadRequest {
  youtube_heading?: string | null
  social_caption?: string | null
  hashtags?: string[] | null
}

export interface MediaUploadListParams {
  folder_id?: number
  status?: MediaUploadStatus
  per_page?: number
  page?: number
}

export const mediaUploadService = {
  async listFolders(parentId?: number | null): Promise<ApiResponse<MediaUploadFolder[]>> {
    const params = parentId !== undefined ? { parent_id: parentId } : undefined
    return apiClient.get('/v1/customer/media-upload/folders', { params })
  },

  async getFolder(id: number): Promise<ApiResponse<MediaUploadFolder>> {
    return apiClient.get(`/v1/customer/media-upload/folders/${id}`)
  },

  async createFolder(data: CreateFolderRequest): Promise<ApiResponse<MediaUploadFolder>> {
    return apiClient.post('/v1/customer/media-upload/folders', data, { skipToast: true })
  },

  async updateFolder(id: number, data: UpdateFolderRequest): Promise<ApiResponse<MediaUploadFolder>> {
    return apiClient.put(`/v1/customer/media-upload/folders/${id}`, data, { skipToast: true })
  },

  async deleteFolder(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/media-upload/folders/${id}`, { skipToast: true })
  },

  async getContentSettings(folderId: number): Promise<ApiResponse<MediaUploadContentSettings | null>> {
    return apiClient.get(`/v1/customer/media-upload/folders/${folderId}/content-settings`)
  },

  async updateContentSettings(
    folderId: number,
    data: UpdateContentSettingsRequest
  ): Promise<ApiResponse<MediaUploadContentSettings>> {
    return apiClient.put(
      `/v1/customer/media-upload/folders/${folderId}/content-settings`,
      data,
      { skipToast: true }
    )
  },

  async listCaptionTemplates(): Promise<ApiResponse<CaptionTemplate[]>> {
    return apiClient.get('/v1/customer/media-upload/caption-templates')
  },

  async createCaptionTemplate(
    data: CreateCaptionTemplateRequest
  ): Promise<ApiResponse<CaptionTemplate>> {
    return apiClient.post('/v1/customer/media-upload/caption-templates', data, { skipToast: true })
  },

  async updateCaptionTemplate(
    id: number,
    data: UpdateCaptionTemplateRequest
  ): Promise<ApiResponse<CaptionTemplate>> {
    return apiClient.put(`/v1/customer/media-upload/caption-templates/${id}`, data, {
      skipToast: true,
    })
  },

  async deleteCaptionTemplate(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/media-upload/caption-templates/${id}`, {
      skipToast: true,
    })
  },

  async bulkUpload(
    files: File[],
    folderId: number,
    captionConfig?: {
      enable_video_caption?: boolean
      font?: string
      font_size?: number
      font_weight?: string
      font_color?: string
      outline_color?: string
      outline_size?: number
      position?: string
      position_offset?: number
      words_per_caption?: number
      loop_count?: number
      enable_reverse?: boolean
    } | null
  ): Promise<ApiResponse<{ queued_items: UploadQueueStatus[]; count: number }>> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files[]', file)
    })
    formData.append('folder_id', String(folderId))
    if (captionConfig && Object.keys(captionConfig).length > 0) {
      formData.append('caption_config', JSON.stringify(captionConfig))
    }
    return apiClient.post('/v1/customer/media-upload/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000,
      skipToast: true,
    })
  },

  async listUploads(params?: MediaUploadListParams): Promise<ApiResponse<MediaUpload[]>> {
    return apiClient.get('/v1/customer/media-upload/uploads', { params })
  },

  async getUpload(id: number): Promise<ApiResponse<MediaUpload>> {
    return apiClient.get(`/v1/customer/media-upload/uploads/${id}`)
  },

  async updateUpload(
    id: number,
    data: UpdateMediaUploadRequest
  ): Promise<ApiResponse<MediaUpload>> {
    return apiClient.put(`/v1/customer/media-upload/uploads/${id}`, data, { skipToast: true })
  },

  async deleteUpload(id: number, skipToast = false): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/media-upload/uploads/${id}`, { skipToast })
  },

  async getQueueStatus(id: number): Promise<ApiResponse<UploadQueueStatus>> {
    return apiClient.get(`/v1/customer/media-upload/queue/${id}`)
  },

  async listQueue(params?: {
    folder_id?: number
    status?: string
    per_page?: number
    page?: number
  }): Promise<ApiResponse<UploadQueueStatus[]>> {
    return apiClient.get('/v1/customer/media-upload/queue', { params })
  },
}
