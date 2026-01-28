import { apiClient, ApiResponse } from '../client'

export type UserStatus = 'active' | 'suspended'

export interface User {
  id: number
  name: string
  email: string
  status: UserStatus
  is_system: boolean
  email_verified_at?: string
  last_login_at?: string
  role?: string
  roles?: Array<{
    id: number
    name: string
    slug: string
  }>
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password?: string
  password_confirmation?: string
  roles?: string[]
  status?: UserStatus
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  password?: string
  password_confirmation?: string
  roles?: string[]
  status?: UserStatus
}

export interface UserListParams {
  page?: number
  per_page?: number
  search?: string
  filter?: {
    status?: string
    role?: string
    verified?: boolean
  }
  sort?: string
  include?: string
}

export const userService = {
  /**
   * Get all users (admin only)
   */
  async getAll(params?: UserListParams): Promise<ApiResponse<User[]>> {
    return apiClient.get('/v1/admin/users', { params })
  },

  /**
   * Get user by ID (admin only)
   */
  async getById(id: number): Promise<ApiResponse<User>> {
    return apiClient.get(`/v1/admin/users/${id}`)
  },

  /**
   * Create new user (admin only)
   */
  async create(data: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.post('/v1/admin/users', data, { skipToast: true })
  },

  /**
   * Update user (admin only)
   */
  async update(id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.put(`/v1/admin/users/${id}`, data, { skipToast: true })
  },

  /**
   * Delete user (admin only)
   */
  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/admin/users/${id}`, { skipToast: true })
  },
}
