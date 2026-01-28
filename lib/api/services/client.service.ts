import { apiClient, ApiResponse } from '../client'

export interface ApiClient {
  id: number
  name: string
  description?: string
  environment?: 'production' | 'staging' | 'development'
  is_active: boolean
  allowed_endpoints?: string[]
  rate_limit?: {
    limit: number
    period: number
  }
  shops?: string[]
  api_keys?: ApiKey[] // Included when eager loaded from backend
  api_keys_count?: number // Count from withCount() when available
  created_at: string
  updated_at: string
}

export interface ApiKey {
  id: number
  api_client_id: number
  name: string
  public_key: string
  secret_key?: string
  last_used_at?: string
  expires_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateApiClientRequest {
  name: string
  description?: string
  environment?: 'production' | 'staging' | 'development'
  is_active?: boolean
  allowed_endpoints?: string[]
  rate_limit?: {
    limit: number
    period: number
  }
  shops?: string[]
}

export interface UpdateApiClientRequest {
  name?: string
  description?: string
  environment?: 'production' | 'staging' | 'development'
  is_active?: boolean
  allowed_endpoints?: string[]
  rate_limit?: {
    limit: number
    period: number
  }
  shops?: string[]
}

export interface CreateApiKeyRequest {
  name: string
  expires_at?: string
}

export interface ApiKeyActivity {
  id: number
  api_key_id: number
  action: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export const clientService = {
  /**
   * Get all API clients (admin only)
   */
  async getAll(): Promise<ApiResponse<ApiClient[]>> {
    return apiClient.get('/v1/admin/clients')
  },

  /**
   * Get API client by ID (admin only)
   */
  async getById(id: number): Promise<ApiResponse<ApiClient>> {
    return apiClient.get(`/v1/admin/clients/${id}`)
  },

  /**
   * Create new API client (admin only)
   */
  async create(data: CreateApiClientRequest): Promise<ApiResponse<ApiClient>> {
    return apiClient.post('/v1/admin/clients', data, { skipToast: true })
  },

  /**
   * Update API client (admin only)
   */
  async update(id: number, data: UpdateApiClientRequest): Promise<ApiResponse<ApiClient>> {
    return apiClient.put(`/v1/admin/clients/${id}`, data, { skipToast: true })
  },

  /**
   * Delete API client (admin only)
   */
  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/admin/clients/${id}`, { skipToast: true })
  },

  /**
   * Get all API keys for a client (admin only)
   */
  async getKeys(clientId: number): Promise<ApiResponse<ApiKey[]>> {
    return apiClient.get(`/v1/admin/clients/${clientId}/keys`)
  },

  /**
   * Get API key by ID (admin only)
   */
  async getKey(clientId: number, keyId: number): Promise<ApiResponse<ApiKey>> {
    return apiClient.get(`/v1/admin/clients/${clientId}/keys/${keyId}`)
  },

  /**
   * Create new API key (admin only)
   */
  async createKey(clientId: number, data: CreateApiKeyRequest): Promise<ApiResponse<ApiKey>> {
    return apiClient.post(`/v1/admin/clients/${clientId}/keys`, data, { skipToast: true })
  },

  /**
   * Revoke API key (admin only)
   */
  async revokeKey(clientId: number, keyId: number): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`/v1/admin/clients/${clientId}/keys/${keyId}/revoke`, {}, { skipToast: true })
  },

  /**
   * Rotate API key (admin only)
   */
  async rotateKey(clientId: number, keyId: number): Promise<ApiResponse<ApiKey>> {
    return apiClient.post(`/v1/admin/clients/${clientId}/keys/${keyId}/rotate`, {}, { skipToast: true })
  },

  /**
   * Get API key activity logs (admin only)
   */
  async getKeyActivity(clientId: number, keyId: number): Promise<ApiResponse<ApiKeyActivity[]>> {
    return apiClient.get(`/v1/admin/clients/${clientId}/keys/${keyId}/activity`)
  },
}
