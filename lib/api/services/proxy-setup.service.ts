import { apiClient, ApiResponse } from '../client'

export type ProxyType = 'http' | 'https' | 'socks4' | 'socks5'
export type ProxyCheckStatus = 'success' | 'failed' | 'pending'
export type ProxyFailureAction = 'stop_automation' | 'continue_without_proxy'

export interface Proxy {
  id: number
  name: string
  type: ProxyType
  host: string
  port: number
  has_auth: boolean
  is_enabled: boolean
  last_checked_at: string | null
  last_check_status: ProxyCheckStatus | null
  last_check_message: string | null
  channels_count?: number
  created_at: string
  updated_at: string
}

export interface ProxyChannel {
  id: number
  provider: string
  type: string
  name: string
  username: string | null
  avatar_url: string | null
  is_active: boolean
}

export interface ProxyWithChannels extends Proxy {
  channels: ProxyChannel[]
}

export interface ProxySettings {
  id: number
  use_random_proxy: boolean
  apply_to_all_channels: boolean
  on_proxy_failure: ProxyFailureAction
  created_at: string
  updated_at: string
}

export interface ProxyTestResult {
  success: boolean
  message: string
  response_time_ms: number | null
  ip: string | null
}

export interface CreateProxyRequest {
  name: string
  type: ProxyType
  host: string
  port: number
  username?: string | null
  password?: string | null
  is_enabled?: boolean
}

export interface UpdateProxyRequest {
  name?: string
  type?: ProxyType
  host?: string
  port?: number
  username?: string | null
  password?: string | null
  is_enabled?: boolean
}

export interface UpdateProxySettingsRequest {
  use_random_proxy?: boolean
  apply_to_all_channels?: boolean
  on_proxy_failure?: ProxyFailureAction
}

export interface AssignChannelsRequest {
  channel_ids: number[]
}

export const proxySetupService = {
  // Proxy CRUD
  async listProxies(): Promise<ApiResponse<Proxy[]>> {
    return apiClient.get('/v1/customer/proxy-setup/proxies')
  },

  async createProxy(data: CreateProxyRequest): Promise<ApiResponse<Proxy>> {
    return apiClient.post('/v1/customer/proxy-setup/proxies', data, { skipToast: true })
  },

  async getProxy(id: number): Promise<ApiResponse<ProxyWithChannels>> {
    return apiClient.get(`/v1/customer/proxy-setup/proxies/${id}`)
  },

  async updateProxy(id: number, data: UpdateProxyRequest): Promise<ApiResponse<Proxy>> {
    return apiClient.put(`/v1/customer/proxy-setup/proxies/${id}`, data, { skipToast: true })
  },

  async deleteProxy(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/customer/proxy-setup/proxies/${id}`, { skipToast: true })
  },

  // Enable/Disable
  async enableProxy(id: number): Promise<ApiResponse<Proxy>> {
    return apiClient.post(`/v1/customer/proxy-setup/proxies/${id}/enable`, {}, { skipToast: true })
  },

  async disableProxy(id: number): Promise<ApiResponse<Proxy>> {
    return apiClient.post(`/v1/customer/proxy-setup/proxies/${id}/disable`, {}, { skipToast: true })
  },

  // Test connection
  async testProxy(id: number): Promise<ApiResponse<ProxyTestResult>> {
    return apiClient.post(`/v1/customer/proxy-setup/proxies/${id}/test`, {}, { skipToast: true })
  },

  // Channel assignment
  async assignChannels(id: number, channelIds: number[]): Promise<ApiResponse<ProxyWithChannels>> {
    return apiClient.post(`/v1/customer/proxy-setup/proxies/${id}/assign-channels`, { channel_ids: channelIds }, { skipToast: true })
  },

  // Settings
  async getSettings(): Promise<ApiResponse<ProxySettings>> {
    return apiClient.get('/v1/customer/proxy-setup/settings')
  },

  async updateSettings(data: UpdateProxySettingsRequest): Promise<ApiResponse<ProxySettings>> {
    return apiClient.put('/v1/customer/proxy-setup/settings', data, { skipToast: true })
  },
}
