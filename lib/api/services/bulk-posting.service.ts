import { apiClient, ApiResponse, downloadFile } from '../client'

export type ContentSourceType = 'csv_file' | 'media_upload'
export type CampaignStatus = 'draft' | 'running' | 'completed' | 'paused' | 'failed'
export type ScheduleCondition = 'minute' | 'hourly' | 'daily' | 'weekly' | 'monthly'

export interface ConnectionSelection {
  channels: number[]
  groups: number[]
}

export interface BulkPostingCampaign {
  id: string
  brand: {
    name: string
    logo?: string | null
    projectName: string
  }
  connections: ConnectionSelection
  contentSourceType: ContentSourceType
  contentSource: string[]
  totalPost: number
  postedAmount: number
  remainingContent: number
  startedDate: string
  status: CampaignStatus
  scheduleCondition?: ScheduleCondition
  scheduleInterval?: number
  repostEnabled?: boolean
  repostCondition?: ScheduleCondition | null
  repostInterval?: number
  repostMaxCount?: number
  contentSourceConfig?: Record<string, unknown>
}

export interface CreateCampaignRequest {
  brand_name: string
  project_name: string
  brand_logo_storage_file_id?: number | null
  content_source_type: ContentSourceType
  content_source_config?: {
    folder_ids?: number[]
    csv_storage_file_id?: number
  }
  schedule_condition: ScheduleCondition
  schedule_interval: number
  repost_enabled?: boolean
  repost_condition?: ScheduleCondition | null
  repost_interval?: number
  repost_max_count?: number
  connections: ConnectionSelection
}

export interface UpdateCampaignRequest {
  brand_name?: string
  project_name?: string
  brand_logo_storage_file_id?: number | null
  content_source_type?: ContentSourceType
  content_source_config?: {
    folder_ids?: number[]
    csv_storage_file_id?: number
  }
  schedule_condition?: ScheduleCondition
  schedule_interval?: number
  repost_enabled?: boolean
  repost_condition?: ScheduleCondition | null
  repost_interval?: number
  repost_max_count?: number
  connections?: ConnectionSelection
}

export interface BulkPostingListParams {
  per_page?: number
  page?: number
}

export const bulkPostingService = {
  async list(params?: BulkPostingListParams): Promise<ApiResponse<BulkPostingCampaign[]>> {
    return apiClient.get('/v1/customer/bulk-posting/campaigns', { params })
  },

  async get(id: string): Promise<ApiResponse<BulkPostingCampaign>> {
    return apiClient.get(`/v1/customer/bulk-posting/campaigns/${id}`)
  },

  async create(data: CreateCampaignRequest): Promise<ApiResponse<BulkPostingCampaign>> {
    return apiClient.post('/v1/customer/bulk-posting/campaigns', data, { skipToast: true })
  },

  async update(id: string, data: UpdateCampaignRequest): Promise<ApiResponse<BulkPostingCampaign>> {
    return apiClient.put(`/v1/customer/bulk-posting/campaigns/${id}`, data, { skipToast: true })
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/bulk-posting/campaigns/${id}`, { skipToast: true })
  },

  async pause(id: string): Promise<ApiResponse<BulkPostingCampaign>> {
    return apiClient.post(`/v1/customer/bulk-posting/campaigns/${id}/pause`, {}, { skipToast: true })
  },

  async resume(id: string): Promise<ApiResponse<BulkPostingCampaign>> {
    return apiClient.post(`/v1/customer/bulk-posting/campaigns/${id}/resume`, {}, { skipToast: true })
  },

  async start(id: string): Promise<ApiResponse<BulkPostingCampaign>> {
    return apiClient.post(`/v1/customer/bulk-posting/campaigns/${id}/start`, {}, { skipToast: true })
  },

  async getContentItems(
    id: string,
    params?: { per_page?: number; page?: number }
  ): Promise<ApiResponse<ScheduledContent[]>> {
    return apiClient.get(`/v1/customer/bulk-posting/campaigns/${id}/content-items`, { params })
  },

  async sync(id: string): Promise<ApiResponse<{ added: number; skipped: number; total: number }>> {
    return apiClient.post(`/v1/customer/bulk-posting/campaigns/${id}/sync`, {}, { skipToast: true })
  },

  async downloadSampleCsv(): Promise<void> {
    await downloadFile('/v1/customer/bulk-posting/sample-csv', 'bulk-posting-sample.csv')
  },
}

export interface ScheduledContent {
  id: string
  date: string
  time: string
  title: string
  description: string
  type: string
  platforms: string[]
  status: 'scheduled' | 'published' | 'error'
  contentText?: string
}
