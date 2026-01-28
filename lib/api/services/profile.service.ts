import { apiClient, ApiResponse } from '../client'
import type { User } from './user.service'

export interface UpdateProfileRequest {
  name?: string
  email?: string
  password?: string
}

export const profileService = {
  /**
   * Get current user's profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get('/v1/customer/profile')
  },

  /**
   * Update current user's profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return apiClient.put('/v1/customer/profile', data, { skipToast: true })
  },
}
