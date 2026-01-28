import { apiClient, ApiResponse } from '../client'

// Invoice Template Types
export interface InvoiceTemplate {
  id: number
  name: string
  slug: string
  description?: string
  header_html?: string
  footer_html?: string
  settings?: Record<string, any>
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface CreateInvoiceTemplateRequest {
  name: string
  slug: string
  description?: string
  header_html?: string
  footer_html?: string
  settings?: Record<string, any>
  is_active?: boolean
  is_default?: boolean
}

export interface UpdateInvoiceTemplateRequest {
  name?: string
  slug?: string
  description?: string
  header_html?: string
  footer_html?: string
  settings?: Record<string, any>
  is_active?: boolean
  is_default?: boolean
}

export interface InvoiceTemplateListParams {
  is_active?: boolean
  is_default?: boolean
  search?: string
  per_page?: number
  page?: number
}

export const invoiceTemplateService = {
  async getTemplates(params?: InvoiceTemplateListParams): Promise<ApiResponse<InvoiceTemplate[]>> {
    return apiClient.get('/v1/admin/invoice-templates', { params })
  },

  async getTemplate(id: number): Promise<ApiResponse<InvoiceTemplate>> {
    return apiClient.get(`/v1/admin/invoice-templates/${id}`)
  },

  async createTemplate(data: CreateInvoiceTemplateRequest): Promise<ApiResponse<InvoiceTemplate>> {
    return apiClient.post('/v1/admin/invoice-templates', data, { skipToast: true })
  },

  async updateTemplate(id: number, data: UpdateInvoiceTemplateRequest): Promise<ApiResponse<InvoiceTemplate>> {
    return apiClient.put(`/v1/admin/invoice-templates/${id}`, data, { skipToast: true })
  },

  async deleteTemplate(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/v1/admin/invoice-templates/${id}`, { skipToast: true })
  },

  async setDefault(id: number): Promise<ApiResponse<InvoiceTemplate>> {
    return apiClient.post(`/v1/admin/invoice-templates/${id}/set-default`, {}, { skipToast: true })
  },
}
