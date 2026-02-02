import { apiClient, ApiResponse } from '../client'

export type PlanSubscriptionType = 'weekly' | 'monthly' | 'yearly' | 'lifetime'

export interface Plan {
  id: number
  name: string
  slug: string
  description: string | null
  ai_usage_limit: number | null
  max_file_upload: number
  total_storage_bytes: number
  features: string[] | null
  max_connections: number
  monthly_post_limit: number | null
  subscription_type: PlanSubscriptionType
  price: number
  currency: string
  is_active: boolean
  sort_order: number
  featured: boolean
  is_free_plan: boolean
  trial_days: number | null
  is_lifetime: boolean
  is_recurring: boolean
  created_at: string
  updated_at: string
}

export interface CreatePlanRequest {
  name: string
  slug: string
  description?: string | null
  ai_usage_limit?: number | null
  max_file_upload?: number
  total_storage_bytes?: number
  features?: string[] | null
  max_connections?: number
  monthly_post_limit?: number | null
  subscription_type: PlanSubscriptionType
  price: number
  currency?: string
  is_active?: boolean
  sort_order?: number
  featured?: boolean
  is_free_plan?: boolean
  trial_days?: number | null
}

export interface UpdatePlanRequest {
  name?: string
  slug?: string
  description?: string | null
  ai_usage_limit?: number | null
  max_file_upload?: number
  total_storage_bytes?: number
  features?: string[] | null
  max_connections?: number
  monthly_post_limit?: number | null
  subscription_type?: PlanSubscriptionType
  price?: number
  currency?: string
  is_active?: boolean
  sort_order?: number
  featured?: boolean
  is_free_plan?: boolean
  trial_days?: number | null
}

export interface PlanListParams {
  page?: number
  per_page?: number
  is_active?: boolean
  subscription_type?: PlanSubscriptionType
  featured?: boolean
  is_free_plan?: boolean
}

export const planService = {
  /**
   * List plans (admin only)
   */
  async list(params?: PlanListParams): Promise<ApiResponse<Plan[]>> {
    return apiClient.get('/v1/admin/plans', { params })
  },

  /**
   * Get plan by ID (admin only)
   */
  async getById(id: number): Promise<ApiResponse<Plan>> {
    return apiClient.get(`/v1/admin/plans/${id}`)
  },

  /**
   * Create plan (admin only)
   */
  async create(data: CreatePlanRequest): Promise<ApiResponse<Plan>> {
    return apiClient.post('/v1/admin/plans', data, { skipToast: true })
  },

  /**
   * Update plan (admin only)
   */
  async update(id: number, data: UpdatePlanRequest): Promise<ApiResponse<Plan>> {
    return apiClient.put(`/v1/admin/plans/${id}`, data, { skipToast: true })
  },

  /**
   * Delete plan (admin only)
   */
  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/admin/plans/${id}`, { skipToast: true })
  },

  /**
   * Assign plan to a user (admin only). Creates subscription or invoice for the user.
   */
  async assignPlan(planId: number, userId: number): Promise<ApiResponse<{ subscription: unknown; invoice?: unknown; payment_required?: boolean }>> {
    return apiClient.post(`/v1/admin/plans/${planId}/assign`, { user_id: userId }, { skipToast: true })
  },
}
