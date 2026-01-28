import { apiClient, ApiResponse } from '../client'

export interface NotificationSettings {
  pusher_app_id: string
  pusher_key: string
  pusher_secret: string
  pusher_cluster: string
  pusher_enabled: boolean
}

export interface UpdateNotificationSettingsRequest {
  pusher_app_id?: string
  pusher_key?: string
  pusher_secret?: string
  pusher_cluster?: string
  pusher_enabled?: boolean
}

export const notificationSettingsService = {
  async getSettings(): Promise<ApiResponse<NotificationSettings>> {
    return apiClient.get('/v1/admin/notification-settings', { skipToast: true })
  },

  async updateSettings(data: UpdateNotificationSettingsRequest): Promise<ApiResponse<NotificationSettings>> {
    return apiClient.put('/v1/admin/notification-settings', data, { skipToast: true })
  },
}
