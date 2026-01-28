import { apiClient, ApiResponse, downloadFile } from '../client'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface SupportTicket {
  id: number
  ticket_number: string
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: string | null
  user?: {
    id: number
    name: string
    email: string
  }
  assigned_to?: {
    id: number
    name: string
    email: string
  }
  last_replied_at: string | null
  last_replied_by?: {
    id: number
    name: string
  }
  replies?: SupportTicketReply[]
  public_replies?: SupportTicketReply[]
  attachments?: Array<{
    id: number
    storage_file: {
      id: number
      url: string
      download_url: string
      original_name: string
      size: number
      mime_type: string
    }
  }>
  created_at: string
  updated_at: string
}

export interface SupportTicketReply {
  id: number
  message: string
  is_internal: boolean
  user?: {
    id: number
    name: string
    email: string
  }
  attachments?: Array<{
    id: number
    storage_file: {
      id: number
      url: string
      download_url: string
      original_name: string
      size: number
      mime_type: string
    }
  }>
  created_at: string
  updated_at: string
}

export interface CreateSupportTicketRequest {
  subject: string
  description: string
  priority?: TicketPriority
  category?: string
  attachments?: number[]
}

export interface ReplySupportTicketRequest {
  message: string
  attachments?: number[]
  is_internal?: boolean
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus
}

export interface AssignTicketRequest {
  assigned_to_user_id?: number | null
}

export interface UpdateTicketPriorityRequest {
  priority: TicketPriority
}

export interface SupportTicketListParams {
  page?: number
  per_page?: number
  status?: TicketStatus
  priority?: TicketPriority
  assigned_to?: number
  user_id?: number
  search?: string
}

export const supportService = {
  // Customer endpoints
  async getTickets(params?: SupportTicketListParams): Promise<ApiResponse<SupportTicket[]>> {
    return apiClient.get('/v1/customer/support/tickets', { params, skipToast: true })
  },

  async getTicket(id: number): Promise<ApiResponse<SupportTicket>> {
    return apiClient.get(`/v1/customer/support/tickets/${id}`, { skipToast: true })
  },

  async createTicket(data: CreateSupportTicketRequest): Promise<ApiResponse<SupportTicket>> {
    return apiClient.post('/v1/customer/support/tickets', data, { skipToast: true })
  },

  async replyToTicket(ticketId: number, data: ReplySupportTicketRequest): Promise<ApiResponse<SupportTicket>> {
    return apiClient.post(`/v1/customer/support/tickets/${ticketId}/replies`, data, { skipToast: true })
  },

  // Admin endpoints
  async getAllTickets(params?: SupportTicketListParams): Promise<ApiResponse<SupportTicket[]>> {
    return apiClient.get('/v1/admin/support/tickets', { params, skipToast: true })
  },

  async getTicketAdmin(id: number): Promise<ApiResponse<SupportTicket>> {
    return apiClient.get(`/v1/admin/support/tickets/${id}`, { skipToast: true })
  },

  async replyToTicketAdmin(ticketId: number, data: ReplySupportTicketRequest): Promise<ApiResponse<SupportTicket>> {
    return apiClient.post(`/v1/admin/support/tickets/${ticketId}/replies`, data, { skipToast: true })
  },

  async updateTicketStatus(ticketId: number, data: UpdateTicketStatusRequest): Promise<ApiResponse<SupportTicket>> {
    return apiClient.put(`/v1/admin/support/tickets/${ticketId}/status`, data, { skipToast: true })
  },

  async assignTicket(ticketId: number, data: AssignTicketRequest): Promise<ApiResponse<SupportTicket>> {
    return apiClient.put(`/v1/admin/support/tickets/${ticketId}/assign`, data, { skipToast: true })
  },

  async updateTicketPriority(ticketId: number, data: UpdateTicketPriorityRequest): Promise<ApiResponse<SupportTicket>> {
    return apiClient.put(`/v1/admin/support/tickets/${ticketId}/priority`, data, { skipToast: true })
  },

  /**
   * Download a file attachment via the API (with auth and access control).
   * Uses the download endpoint for proper security checks.
   * Falls back to direct link if API download fails.
   */
  async downloadAttachment(storageFileId: number, filename: string, isAdmin: boolean = false): Promise<void> {
    const endpoint = isAdmin 
      ? `/v1/admin/support/attachments/${storageFileId}/download`
      : `/v1/customer/support/attachments/${storageFileId}/download`
    return downloadFile(endpoint, filename, true)
  },

  /**
   * Download a file directly from URL (for public storage URLs).
   * Use downloadAttachment() for proper access control.
   */
  async downloadFile(url: string, filename: string): Promise<void> {
    return downloadFile(url, filename)
  },
}
