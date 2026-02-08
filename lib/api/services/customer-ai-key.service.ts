
import { apiClient, ApiResponse } from "@/lib/api/client"

export interface AiApiKey {
    id: number
    provider_id: number
    user_id: number | null
    name: string
    api_key: string // masked
    endpoint_url?: string | null
    organization_id?: string | null
    project_id?: string | null
    scopes?: string[]
    is_active: boolean
    priority: number
    rate_limit_per_minute: number | null
    rate_limit_per_day: number | null
    total_requests: number
    total_tokens: number
    last_used_at: string | null
    created_at: string
    metadata?: AiApiKeyMetadata
    provider?: {
        id: number
        name: string
        slug: string
        logo_url?: string
    }
}

export interface AiApiKeyMetadata {
    deployment_name?: string
    api_version?: string
    [key: string]: unknown
}

export interface CreateAiApiKeyDTO {
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

export interface UpdateAiApiKeyDTO {
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

export interface AiApiKeyTestResult {
    success: boolean
    message: string
    response_time_ms: number
    model?: string
    error?: string
}

export const customerAiKeyService = {
    // List API keys
    list: async (params?: { page?: number; per_page?: number; provider_id?: number; is_active?: boolean }): Promise<ApiResponse<AiApiKey[]>> => {
        return apiClient.get("/v1/customer/ai-api-keys", { params }) as unknown as Promise<ApiResponse<AiApiKey[]>>
    },

    // Get single API key
    get: async (id: number): Promise<ApiResponse<AiApiKey>> => {
        return apiClient.get(`/v1/customer/ai-api-keys/${id}`) as unknown as Promise<ApiResponse<AiApiKey>>
    },

    // Create API key
    create: async (data: CreateAiApiKeyDTO): Promise<ApiResponse<AiApiKey>> => {
        return apiClient.post("/v1/customer/ai-api-keys", data) as unknown as Promise<ApiResponse<AiApiKey>>
    },

    // Update API key
    update: async (id: number, data: UpdateAiApiKeyDTO): Promise<ApiResponse<AiApiKey>> => {
        return apiClient.put(`/v1/customer/ai-api-keys/${id}`, data) as unknown as Promise<ApiResponse<AiApiKey>>
    },

    // Delete API key
    delete: async (id: number): Promise<ApiResponse<null>> => {
        return apiClient.delete(`/v1/customer/ai-api-keys/${id}`) as unknown as Promise<ApiResponse<null>>
    },

    // Test API key
    test: async (id: number): Promise<ApiResponse<AiApiKeyTestResult>> => {
        return apiClient.post(`/v1/customer/ai-api-keys/${id}/test`) as unknown as Promise<ApiResponse<AiApiKeyTestResult>>
    },

    // Get available providers
    getProviders: async (): Promise<ApiResponse<any[]>> => {
        return apiClient.get("/v1/customer/ai-api-keys/providers") as unknown as Promise<ApiResponse<any[]>>
    },

    // Get available scopes
    getScopes: async (): Promise<ApiResponse<any[]>> => {
        return apiClient.get("/v1/customer/ai-api-keys/scopes") as unknown as Promise<ApiResponse<any[]>>
    },
}
