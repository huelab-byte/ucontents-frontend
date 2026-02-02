import { apiClient, ApiResponse } from '../client'
import type { User } from './user.service'
import type { Invoice, Payment, Subscription } from './payment-gateway.service'

export interface CustomerProfile {
  user: User
  invoices_count: number
  payments_count: number
  support_tickets_count: number
  active_subscriptions: Subscription[]
  last_invoices: Invoice[]
  last_payments: Payment[]
}

export interface CustomerListParams {
  search?: string
  status?: 'active' | 'suspended'
  per_page?: number
  page?: number
}

export const customerService = {
  /**
   * List customers (users with customer role) - admin only
   */
  async list(params?: CustomerListParams): Promise<ApiResponse<User[]>> {
    return apiClient.get('/v1/admin/customers', { params })
  },

  /**
   * Get customer profile with aggregates - admin only
   */
  async getProfile(id: number): Promise<ApiResponse<CustomerProfile>> {
    return apiClient.get(`/v1/admin/customers/${id}`)
  },
}
