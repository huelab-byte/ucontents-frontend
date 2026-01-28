import { apiClient, type ApiResponse } from '../client'

export interface BrandingSettings {
  site_name?: string
  site_description?: string
  logo?: string
  favicon?: string
  site_icon?: string
  primary_color_light?: string
  primary_color_dark?: string
}

export interface MetaSettings {
  title?: string
  description?: string
  keywords?: string
}

export interface SocialLinks {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
}

export interface GeneralSettings {
  branding: BrandingSettings
  meta: MetaSettings
  timezone: string
  contact_email: string
  support_email: string
  company_name: string
  company_address: string
  social_links: SocialLinks
  maintenance_mode: boolean
  terms_of_service_url: string
  privacy_policy_url: string
}

export interface PublicGeneralSettings {
  branding: BrandingSettings
  meta: MetaSettings
  social_links: SocialLinks
  maintenance_mode: boolean
  terms_of_service_url?: string
  privacy_policy_url?: string
}

export interface UpdateGeneralSettingsRequest {
  branding?: Partial<BrandingSettings>
  meta?: Partial<MetaSettings>
  timezone?: string
  contact_email?: string
  support_email?: string
  company_name?: string
  company_address?: string
  social_links?: Partial<SocialLinks>
  maintenance_mode?: boolean
  terms_of_service_url?: string
  privacy_policy_url?: string
}

export const generalSettingsService = {
  /**
   * Get current general settings (admin - requires auth)
   */
  async getSettings(): Promise<ApiResponse<GeneralSettings>> {
    return apiClient.get('/v1/admin/general-settings')
  },

  /**
   * Get public general settings (no auth required - for site metadata)
   */
  async getPublicSettings(): Promise<ApiResponse<PublicGeneralSettings>> {
    return apiClient.get('/v1/general-settings', {
      skipToast: true,
    })
  },

  /**
   * Update general settings (admin - requires auth)
   */
  async updateSettings(data: UpdateGeneralSettingsRequest): Promise<ApiResponse<GeneralSettings>> {
    return apiClient.put('/v1/admin/general-settings', data, {
      skipToast: true, // Skip automatic toast - we'll show a custom one in the component
    })
  },
}
