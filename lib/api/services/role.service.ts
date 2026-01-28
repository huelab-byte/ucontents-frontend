import { apiClient, ApiResponse } from '../client'

export interface Role {
  id: number
  name: string
  slug: string
  description?: string
  hierarchy: number
  is_system: boolean
  users_count?: number
  permissions?: Array<{
    id: number
    name: string
    slug: string
    description?: string
    module?: string
  }>
  created_at?: string
  updated_at?: string
}

export interface CreateRoleRequest {
  name: string
  slug: string
  description?: string
  hierarchy?: number
  permissions?: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  hierarchy?: number
  permissions?: string[]
}

export interface RoleListParams {
  page?: number
  per_page?: number
  search?: string
}

export const roleService = {
  /**
   * Get all roles (admin only)
   */
  async getAll(params?: RoleListParams): Promise<ApiResponse<Role[]>> {
    return apiClient.get('/v1/admin/roles', { params })
  },

  /**
   * Get role by ID (admin only)
   */
  async getById(id: number): Promise<ApiResponse<Role>> {
    return apiClient.get(`/v1/admin/roles/${id}`)
  },

  /**
   * Create new role (admin only)
   */
  async create(data: CreateRoleRequest): Promise<ApiResponse<Role>> {
    return apiClient.post('/v1/admin/roles', data, { skipToast: true })
  },

  /**
   * Update role (admin only)
   */
  async update(id: number, data: UpdateRoleRequest): Promise<ApiResponse<Role>> {
    return apiClient.put(`/v1/admin/roles/${id}`, data, { skipToast: true })
  },

  /**
   * Delete role (admin only)
   */
  async delete(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/admin/roles/${id}`, { skipToast: true })
  },

  /**
   * Get all permissions for role assignment
   */
  async getPermissions(): Promise<ApiResponse<Array<{
    id: number
    name: string
    slug: string
    description?: string
    module?: string
  }>>> {
    return apiClient.get('/v1/admin/roles/permissions/list')
  },
}
