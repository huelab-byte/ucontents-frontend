import { apiClient, ApiResponse } from '../client'

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: number
  type: string
  title: string
  body: string
  data: Record<string, any> | null
  severity: NotificationSeverity | null
  created_by_user_id: number | null
  created_at: string
  url: string | null
}

export interface NotificationRecipient {
  id: number
  notification_id: number
  user_id: number
  read_at: string | null
  delivered_email_at: string | null
  created_at: string
  notification: Notification
}

export interface CreateAnnouncementRequest {
  title: string
  body: string
  audience: 'all_admins' | 'specific_users'
  user_ids?: number[]
  send_in_app?: boolean
  send_email?: boolean
  severity?: NotificationSeverity
  data?: Record<string, any>
}

export interface CreateAnnouncementResponse {
  notification: Notification
  recipients_created: number
}

export interface NotificationListParams {
  page?: number
  per_page?: number
}

export interface PusherConfig {
  enabled: boolean
  key: string | null
  cluster: string | null
}

export const notificationService = {
  // Public Pusher config endpoint
  async getPusherConfig(): Promise<ApiResponse<PusherConfig>> {
    return apiClient.get('/v1/pusher/config', { skipToast: true })
  },

  // Customer endpoints
  async getNotifications(params?: NotificationListParams): Promise<ApiResponse<NotificationRecipient[]>> {
    return apiClient.get('/v1/customer/notifications', { params, skipToast: true })
  },

  async getUnreadCount(): Promise<ApiResponse<{ unread_count: number }>> {
    return apiClient.get('/v1/customer/notifications/unread-count', { skipToast: true })
  },

  async markAsRead(recipientId: number): Promise<ApiResponse<NotificationRecipient>> {
    return apiClient.post(`/v1/customer/notifications/${recipientId}/read`, {}, { skipToast: true })
  },

  async markAllAsRead(): Promise<ApiResponse<{ marked_count: number }>> {
    return apiClient.post('/v1/customer/notifications/mark-all-read', {}, { skipToast: true })
  },

  async clearAll(): Promise<ApiResponse<{ deleted_count: number }>> {
    return apiClient.delete('/v1/customer/notifications', { skipToast: true })
  },

  async getPusherAuth(socketId: string, channelName: string): Promise<ApiResponse<{ auth: string }>> {
    return apiClient.post('/v1/customer/notifications/pusher/auth', {
      socket_id: socketId,
      channel_name: channelName,
    }, { skipToast: true })
  },

  // Admin endpoints
  async getAnnouncements(params?: NotificationListParams): Promise<ApiResponse<Notification[]>> {
    return apiClient.get('/v1/admin/announcements', { params, skipToast: true })
  },

  async createAnnouncement(data: CreateAnnouncementRequest): Promise<ApiResponse<CreateAnnouncementResponse>> {
    return apiClient.post('/v1/admin/announcements', data, { skipToast: true })
  },

  async getAdminPusherAuth(socketId: string, channelName: string): Promise<ApiResponse<{ auth: string }>> {
    return apiClient.post('/v1/admin/notifications/pusher/auth', {
      socket_id: socketId,
      channel_name: channelName,
    }, { skipToast: true })
  },
}
