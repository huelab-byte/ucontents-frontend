import { apiClient, ApiResponse } from '../client'

export interface Permission {
  id: number
  name: string
  slug: string
  description?: string
  module?: string
  roles_count?: number
  created_at?: string
  updated_at?: string
}

export interface CreatePermissionRequest {
  name: string
  slug: string
  description?: string
  module?: string
}

export interface UpdatePermissionRequest {
  name?: string
  slug?: string
  description?: string
  module?: string
}

export interface PermissionListParams {
  page?: number
  per_page?: number
  search?: string
  module?: string
  group_by_module?: boolean
}

export const permissionService = {
  /**
   * Get all permissions (admin only)
   */
  async getAll(params?: PermissionListParams): Promise<ApiResponse<Permission[] | Record<string, Permission[]>>> {
    return apiClient.get('/v1/admin/permissions', { params })
  },

  /**
   * Get permission by ID (admin only)
   */
  async getById(id: number): Promise<ApiResponse<Permission>> {
    return apiClient.get(`/v1/admin/permissions/${id}`)
  },

  /**
   * Create new permission (admin only)
   */
  async create(data: CreatePermissionRequest): Promise<ApiResponse<Permission>> {
    return apiClient.post('/v1/admin/permissions', data, { skipToast: true })
  },

  /**
   * Update permission (admin only)
   */
  async update(id: number, data: UpdatePermissionRequest): Promise<ApiResponse<Permission>> {
    return apiClient.put(`/v1/admin/permissions/${id}`, data, { skipToast: true })
  },

  /**
   * Delete permission (admin only)
   */
  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/admin/permissions/${id}`, { skipToast: true })
  },

  /**
   * Get all modules that have permissions
   */
  async getModules(): Promise<ApiResponse<string[]>> {
    return apiClient.get('/v1/admin/permissions/modules')
  },
}
