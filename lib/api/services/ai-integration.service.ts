import { apiClient, type ApiResponse } from '../client'

export interface AiProvider {
  id: number
  slug: string
  name: string
  supported_models: string[]
  vision_models?: string[]
  embedding_models?: string[]
  base_url: string | null
  is_active: boolean
  has_active_keys: boolean
  active_keys_count: number
  created_at: string
  updated_at: string
}

export interface AiApiKeyScope {
  slug: string
  name: string
  description: string
  module: string | null
  requires_vision: boolean
  requires_embedding_model?: boolean
}

export interface AiApiKey {
  id: number
  provider_id: number
  provider?: AiProvider
  name: string
  api_key_preview?: string
  endpoint_url: string | null
  organization_id: string | null
  project_id: string | null
  is_active: boolean
  priority: number
  rate_limit_per_minute: number | null
  rate_limit_per_day: number | null
  scopes: string[]
  scope_names: string[]
  last_used_at: string | null
  total_requests: number
  total_tokens: number
  created_at: string
  updated_at: string
}

export interface TestApiKeyResult {
  success: boolean
  message: string
  response_time_ms?: number
  model?: string
  error?: string
}

export interface AiUsageLog {
  id: number
  api_key_id: number
  user_id: number | null
  provider_slug: string
  model: string
  prompt?: string
  response?: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost: number | null
  response_time_ms: number | null
  status: 'success' | 'error' | 'rate_limited'
  error_message: string | null
  module: string | null
  feature: string | null
  created_at: string
}

export interface AiUsageStatistics {
  total_requests: number
  total_tokens: number
  total_cost: number | null
  successful_requests: number
  failed_requests: number
  by_provider: Array<{
    provider_slug: string
    requests: number
    tokens: number
    cost: number | null
  }>
  by_model: Array<{
    model: string
    requests: number
    tokens: number
    cost: number | null
  }>
}

// Metadata for AI API keys (provider-specific configuration)
export interface AiApiKeyMetadata {
  region?: string
  deployment_name?: string
  api_version?: string
  custom_headers?: Record<string, string>
  [key: string]: unknown
}

// Settings for AI prompt templates
export interface AiPromptTemplateSettings {
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stop_sequences?: string[]
  [key: string]: unknown
}

export interface CreateAiApiKeyRequest {
  provider_id: number
  name: string
  api_key: string
  api_secret?: string
  endpoint_url?: string
  organization_id?: string
  project_id?: string
  is_active?: boolean
  priority?: number
  rate_limit_per_minute?: number
  rate_limit_per_day?: number
  metadata?: AiApiKeyMetadata
  scopes?: string[]
}

export interface UpdateAiApiKeyRequest {
  name?: string
  api_key?: string
  api_secret?: string
  endpoint_url?: string
  organization_id?: string
  project_id?: string
  is_active?: boolean
  priority?: number
  rate_limit_per_minute?: number
  rate_limit_per_day?: number
  metadata?: AiApiKeyMetadata
  scopes?: string[]
}

export interface UsageLogListParams {
  page?: number
  per_page?: number
  provider_slug?: string
  user_id?: number
  status?: string
  date_from?: string
  date_to?: string
}

export interface ApiKeyListParams {
  page?: number
  per_page?: number
  provider_id?: number
  is_active?: boolean
}

// Prompt Template Types
export interface AiPromptTemplate {
  id: number
  name: string
  description?: string
  category: string
  provider_slug?: string
  model?: string
  system_prompt?: string
  user_prompt_template: string
  variables: string[]
  is_active: boolean
  is_default: boolean
  settings?: AiPromptTemplateSettings
  created_at: string
  updated_at: string
}

export interface CreatePromptTemplateRequest {
  name: string
  description?: string
  category: string
  provider_slug?: string
  model?: string
  system_prompt?: string
  user_prompt_template: string
  variables?: string[]
  is_active?: boolean
  is_default?: boolean
  settings?: AiPromptTemplateSettings
}

export interface UpdatePromptTemplateRequest {
  name?: string
  description?: string
  category?: string
  provider_slug?: string
  model?: string
  system_prompt?: string
  user_prompt_template?: string
  variables?: string[]
  is_active?: boolean
  is_default?: boolean
  settings?: AiPromptTemplateSettings
}

export interface PromptTemplateListParams {
  page?: number
  per_page?: number
  category?: string
  provider_slug?: string
  is_active?: boolean
}

export interface RenderPromptRequest {
  variables: Record<string, string>
}

export const aiIntegrationService = {
  // Providers
  async getProviders(): Promise<ApiResponse<AiProvider[]>> {
    return apiClient.get('/v1/admin/ai-providers')
  },

  async getProvider(slug: string): Promise<ApiResponse<AiProvider>> {
    return apiClient.get(`/v1/admin/ai-providers/${slug}`)
  },

  async initializeProviders(): Promise<ApiResponse<void>> {
    return apiClient.post('/v1/admin/ai-providers/initialize', undefined, { skipToast: true })
  },

  // API Keys
  async getApiKeys(params?: ApiKeyListParams): Promise<ApiResponse<AiApiKey[]>> {
    return apiClient.get('/v1/admin/ai-api-keys', { params })
  },

  async getApiKey(id: number): Promise<ApiResponse<AiApiKey>> {
    return apiClient.get(`/v1/admin/ai-api-keys/${id}`)
  },

  async createApiKey(data: CreateAiApiKeyRequest): Promise<ApiResponse<AiApiKey>> {
    return apiClient.post('/v1/admin/ai-api-keys', data, { skipToast: true })
  },

  async updateApiKey(id: number, data: UpdateAiApiKeyRequest): Promise<ApiResponse<AiApiKey>> {
    return apiClient.put(`/v1/admin/ai-api-keys/${id}`, data, { skipToast: true })
  },

  async deleteApiKey(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/v1/admin/ai-api-keys/${id}`, { skipToast: true })
  },

  async enableApiKey(id: number): Promise<ApiResponse<AiApiKey>> {
    return apiClient.post(`/v1/admin/ai-api-keys/${id}/enable`, undefined, { skipToast: true })
  },

  async disableApiKey(id: number): Promise<ApiResponse<AiApiKey>> {
    return apiClient.post(`/v1/admin/ai-api-keys/${id}/disable`, undefined, { skipToast: true })
  },

  async getAvailableScopes(): Promise<ApiResponse<AiApiKeyScope[]>> {
    return apiClient.get('/v1/admin/ai-api-keys/scopes')
  },

  async testApiKey(id: number): Promise<ApiResponse<TestApiKeyResult>> {
    return apiClient.post(`/v1/admin/ai-api-keys/${id}/test`, undefined, { skipToast: true })
  },

  // Usage & Statistics
  async getUsageLogs(params?: UsageLogListParams): Promise<ApiResponse<AiUsageLog[]>> {
    return apiClient.get('/v1/admin/ai-usage', { params })
  },

  async getUsageStatistics(params?: { date_from?: string; date_to?: string }): Promise<ApiResponse<AiUsageStatistics>> {
    return apiClient.get('/v1/admin/ai-usage/statistics', { params })
  },

  // Prompt Templates (Admin)
  async getPromptTemplates(params?: PromptTemplateListParams): Promise<ApiResponse<AiPromptTemplate[]>> {
    return apiClient.get('/v1/admin/ai-prompt-templates', { params })
  },

  async getPromptTemplate(id: number): Promise<ApiResponse<AiPromptTemplate>> {
    return apiClient.get(`/v1/admin/ai-prompt-templates/${id}`)
  },

  async createPromptTemplate(data: CreatePromptTemplateRequest): Promise<ApiResponse<AiPromptTemplate>> {
    return apiClient.post('/v1/admin/ai-prompt-templates', data, { skipToast: true })
  },

  async updatePromptTemplate(id: number, data: UpdatePromptTemplateRequest): Promise<ApiResponse<AiPromptTemplate>> {
    return apiClient.put(`/v1/admin/ai-prompt-templates/${id}`, data, { skipToast: true })
  },

  async deletePromptTemplate(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/v1/admin/ai-prompt-templates/${id}`, { skipToast: true })
  },

  // Prompt Templates (Customer - read-only)
  async getCustomerPromptTemplates(params?: PromptTemplateListParams): Promise<ApiResponse<AiPromptTemplate[]>> {
    return apiClient.get('/v1/customer/ai-prompt-templates', { params })
  },

  async getCustomerPromptTemplate(id: number): Promise<ApiResponse<AiPromptTemplate>> {
    return apiClient.get(`/v1/customer/ai-prompt-templates/${id}`)
  },

  async renderPromptTemplate(id: number, data: RenderPromptRequest): Promise<ApiResponse<{ rendered_prompt: string }>> {
    return apiClient.post(`/v1/customer/ai-prompt-templates/${id}/render`, data, { skipToast: true })
  },

  // AI Call (Customer)
  async callAi(data: { prompt: string; provider_slug?: string; model?: string }): Promise<ApiResponse<{ response: string }>> {
    return apiClient.post('/v1/customer/ai/call', data, { skipToast: true })
  },
}
