import { apiClient, ApiResponse } from '../client'

export type SocialProvider = 'meta' | 'google' | 'tiktok'
export type SocialChannelType = 'facebook_page' | 'facebook_profile' | 'instagram_business' | 'youtube_channel' | 'tiktok_profile'

export interface SocialProviderApp {
  id: number
  provider: SocialProvider
  enabled: boolean
  client_id: string | null
  has_client_secret: boolean
  scopes: string[]
  extra: Record<string, any>
}

export interface SocialChannel {
  id: number
  provider: SocialProvider
  type: SocialChannelType
  provider_channel_id: string
  name: string
  username?: string | null
  avatar_url?: string | null
  is_active: boolean
  group_id?: number | null
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export interface SocialConnectionGroup {
  id: number
  name: string
  user_id: number
  created_at?: string
  updated_at?: string
}

export interface UpdateSocialProviderAppRequest {
  enabled?: boolean
  client_id?: string | null
  client_secret?: string | null
  scopes?: string[] | null
  extra?: Record<string, any> | null
}

export const socialConnectionService = {
  // Admin endpoints
  async adminGetProviders(): Promise<ApiResponse<SocialProviderApp[]>> {
    return apiClient.get('/v1/admin/social-connection/providers')
  },

  async adminGetProvider(provider: SocialProvider): Promise<ApiResponse<SocialProviderApp>> {
    return apiClient.get(`/v1/admin/social-connection/providers/${provider}`)
  },

  async adminUpdateProvider(provider: SocialProvider, data: UpdateSocialProviderAppRequest): Promise<ApiResponse<SocialProviderApp>> {
    return apiClient.put(`/v1/admin/social-connection/providers/${provider}`, data, { skipToast: true })
  },

  async adminEnableProvider(provider: SocialProvider): Promise<ApiResponse<SocialProviderApp>> {
    return apiClient.post(`/v1/admin/social-connection/providers/${provider}/enable`, {}, { skipToast: true })
  },

  async adminDisableProvider(provider: SocialProvider): Promise<ApiResponse<SocialProviderApp>> {
    return apiClient.post(`/v1/admin/social-connection/providers/${provider}/disable`, {}, { skipToast: true })
  },

  // Customer endpoints
  async getEnabledProviders(): Promise<ApiResponse<Array<{ provider: SocialProvider; enabled: boolean }>>> {
    return apiClient.get('/v1/customer/social-connection/providers')
  },

  async getRedirectUrl(
    provider: SocialProvider,
    channelTypes?: string[]
  ): Promise<ApiResponse<{ redirect_url: string }>> {
    const params = channelTypes ? { channel_types: channelTypes } : undefined
    return apiClient.get(`/v1/customer/social-connection/${provider}/redirect`, {
      params,
      skipToast: true,
    })
  },

  async getChannels(params?: { page?: number; per_page?: number }): Promise<ApiResponse<SocialChannel[]>> {
    return apiClient.get('/v1/customer/social-connection/channels', { params })
  },

  async disconnectChannel(id: number): Promise<ApiResponse<SocialChannel>> {
    return apiClient.delete(`/v1/customer/social-connection/channels/${id}`, { skipToast: true })
  },

  async updateChannelStatus(id: number, isActive: boolean): Promise<ApiResponse<SocialChannel>> {
    return apiClient.patch(`/v1/customer/social-connection/channels/${id}/status`, { is_active: isActive }, { skipToast: true })
  },

  async deleteChannel(id: number): Promise<ApiResponse<unknown>> {
    return apiClient.delete(`/v1/customer/social-connection/channels/${id}/force`, { skipToast: true })
  },

  async getAvailableChannels(provider: SocialProvider, token: string): Promise<ApiResponse<Array<{
    key: string
    provider: string
    type: SocialChannelType
    provider_channel_id: string
    name: string
    username?: string | null
    avatar_url?: string | null
    metadata?: Record<string, any>
  }>>> {
    return apiClient.get(`/v1/customer/social-connection/${provider}/available-channels`, { params: { token } })
  },

  async saveSelectedChannels(
    provider: SocialProvider,
    token: string,
    selectedChannels: string[]
  ): Promise<ApiResponse<{ channels_upserted: number }>> {
    return apiClient.post(`/v1/customer/social-connection/${provider}/save-selected`, {
      token,
      selected_channels: selectedChannels,
    }, { skipToast: true })
  },

  // Groups
  async getGroups(): Promise<ApiResponse<SocialConnectionGroup[]>> {
    return apiClient.get('/v1/customer/social-connection/groups')
  },

  async createGroup(name: string): Promise<ApiResponse<SocialConnectionGroup>> {
    return apiClient.post('/v1/customer/social-connection/groups', { name }, { skipToast: true })
  },

  async updateGroup(id: number, name: string): Promise<ApiResponse<SocialConnectionGroup>> {
    return apiClient.patch(`/v1/customer/social-connection/groups/${id}`, { name }, { skipToast: true })
  },

  async deleteGroup(id: number): Promise<ApiResponse<unknown>> {
    return apiClient.delete(`/v1/customer/social-connection/groups/${id}`, { skipToast: true })
  },

  async bulkAssignGroup(channelIds: number[], groupId: number | null): Promise<ApiResponse<{ updated: number }>> {
    return apiClient.patch('/v1/customer/social-connection/channels/group', {
      channel_ids: channelIds,
      group_id: groupId,
    }, { skipToast: true })
  },
}

