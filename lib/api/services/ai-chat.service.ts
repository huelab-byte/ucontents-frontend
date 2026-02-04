import { apiClient, type ApiResponse } from '../client'

export interface AiChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    imageUrl?: string
    responseTimeMs?: number
}

export interface AiChatResponse {
    message: string
    response_time_ms: number
}

export interface AiChatConnectionStatus {
    connected: boolean
    response_time_ms?: number
    error?: string
}

export const aiChatService = {
    /**
     * Send a text message to the AI
     */
    async sendMessage(message: string, maxTokens?: number): Promise<ApiResponse<AiChatResponse>> {
        return apiClient.post('/v1/customer/ai-chat', {
            message,
            max_tokens: maxTokens || 500,
        }, { skipToast: true })
    },

    /**
     * Send an image for analysis
     */
    async analyzeImage(image: File, message?: string): Promise<ApiResponse<AiChatResponse>> {
        const formData = new FormData()
        formData.append('image', image)
        if (message) {
            formData.append('message', message)
        }

        return apiClient.post('/v1/customer/ai-chat/analyze-image', formData, {
            skipToast: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },

    /**
     * Test the AI service connection
     */
    async testConnection(): Promise<ApiResponse<AiChatConnectionStatus>> {
        return apiClient.get('/v1/customer/ai-chat/test', { skipToast: true })
    },
}
