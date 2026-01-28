import { apiClient, type ApiResponse } from '../client'

export interface SmtpConfiguration {
  id: number
  name: string
  host: string
  port: number
  encryption: string
  username: string
  from_address: string
  from_name?: string
  is_active: boolean
  is_default: boolean
  options?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreateSmtpConfigurationRequest {
  name: string
  host: string
  port: number
  encryption?: string
  username: string
  password: string
  from_address: string
  from_name?: string
  is_active?: boolean
  is_default?: boolean
  options?: Record<string, any>
}

export interface UpdateSmtpConfigurationRequest {
  name: string
  host: string
  port: number
  encryption?: string
  username: string
  password?: string
  from_address: string
  from_name?: string
  is_active?: boolean
  is_default?: boolean
  options?: Record<string, any>
}

export interface EmailTemplate {
  id: number
  name: string
  slug: string
  subject: string
  body_html: string
  body_text?: string
  variables?: string[]
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateEmailTemplateRequest {
  name: string
  slug?: string
  subject: string
  body_html: string
  body_text?: string
  variables?: string[]
  category?: string
  is_active?: boolean
}

export interface UpdateEmailTemplateRequest {
  name: string
  slug?: string
  subject: string
  body_html: string
  body_text?: string
  variables?: string[]
  category?: string
  is_active?: boolean
}

export interface SendTestEmailRequest {
  to: string
  subject: string
  body: string
  smtp_configuration_id?: number
}

export interface EmailLog {
  id: number
  smtp_configuration_id?: number
  email_template_id?: number
  to: string
  cc?: string
  bcc?: string
  subject: string
  status: 'pending' | 'sent' | 'failed' | 'bounced'
  error_message?: string
  sent_at?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface EmailListParams {
  page?: number
  per_page?: number
}

export const emailService = {
  /**
   * Get all SMTP configurations
   */
  async getSmtpConfigurations(params?: EmailListParams): Promise<ApiResponse<SmtpConfiguration[]>> {
    return apiClient.get('/v1/admin/email-management/smtp-configurations', { params })
  },

  /**
   * Get a specific SMTP configuration
   */
  async getSmtpConfiguration(id: number): Promise<ApiResponse<SmtpConfiguration>> {
    return apiClient.get(`/v1/admin/email-management/smtp-configurations/${id}`)
  },

  /**
   * Create a new SMTP configuration
   */
  async createSmtpConfiguration(
    data: CreateSmtpConfigurationRequest
  ): Promise<ApiResponse<SmtpConfiguration>> {
    return apiClient.post('/v1/admin/email-management/smtp-configurations', data, { skipToast: true })
  },

  /**
   * Update an SMTP configuration
   */
  async updateSmtpConfiguration(
    id: number,
    data: UpdateSmtpConfigurationRequest
  ): Promise<ApiResponse<SmtpConfiguration>> {
    return apiClient.put(`/v1/admin/email-management/smtp-configurations/${id}`, data, { skipToast: true })
  },

  /**
   * Delete an SMTP configuration
   */
  async deleteSmtpConfiguration(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/admin/email-management/smtp-configurations/${id}`, { skipToast: true })
  },

  /**
   * Set an SMTP configuration as default
   */
  async setDefaultSmtpConfiguration(id: number): Promise<ApiResponse<SmtpConfiguration>> {
    return apiClient.post(`/v1/admin/email-management/smtp-configurations/${id}/set-default`, undefined, { skipToast: true })
  },

  /**
   * Get all email templates
   */
  async getEmailTemplates(params?: EmailListParams): Promise<ApiResponse<EmailTemplate[]>> {
    return apiClient.get('/v1/admin/email-management/email-templates', { params })
  },

  /**
   * Get a specific email template
   */
  async getEmailTemplate(id: number): Promise<ApiResponse<EmailTemplate>> {
    return apiClient.get(`/v1/admin/email-management/email-templates/${id}`)
  },

  /**
   * Create a new email template
   */
  async createEmailTemplate(
    data: CreateEmailTemplateRequest
  ): Promise<ApiResponse<EmailTemplate>> {
    return apiClient.post('/v1/admin/email-management/email-templates', data, { skipToast: true })
  },

  /**
   * Update an email template
   */
  async updateEmailTemplate(
    id: number,
    data: UpdateEmailTemplateRequest
  ): Promise<ApiResponse<EmailTemplate>> {
    return apiClient.put(`/v1/admin/email-management/email-templates/${id}`, data, { skipToast: true })
  },

  /**
   * Delete an email template
   */
  async deleteEmailTemplate(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/admin/email-management/email-templates/${id}`, { skipToast: true })
  },

  /**
   * Send a test email
   */
  async sendTestEmail(data: SendTestEmailRequest): Promise<ApiResponse<EmailLog>> {
    return apiClient.post('/v1/admin/email-management/test-email', data, { skipToast: true })
  },
}
