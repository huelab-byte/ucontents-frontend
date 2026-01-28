import axios, { CancelTokenSource } from 'axios'
import { apiClient, type ApiResponse, downloadFile } from '../client'

export type StorageDriver = 'local' | 'do_s3' | 'aws_s3' | 'contabo_s3' | 'cloudflare_r2' | 'backblaze_b2'

export interface StorageConfig {
  id?: number
  driver: StorageDriver
  is_active?: boolean
  key?: string
  secret?: string
  region?: string
  bucket?: string
  endpoint?: string
  url?: string
  use_path_style_endpoint?: boolean
  root_path?: string
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export interface StorageUsage {
  total_size: number
  file_count: number
  driver: string | null
  database_file_count?: number
  database_total_size?: number
  error?: string
}

export interface MigrationResult {
  migrated: number
  failed: number
  total: number
  errors: Array<{
    file_id: number
    path: string
    error: string
  }>
}

export interface CleanupResult {
  deleted: number
  failed: number
  total: number
  errors: Array<{
    file_id: number
    path: string
    error: string
  }>
}

export interface UploadedFile {
  id: number
  path: string
  url: string | null
  original_name: string
  size: number
}

export interface BulkUploadResult {
  uploaded: UploadedFile[]
  failed: Array<{
    original_name: string
    error: string
  }>
  total: number
  success_count: number
  failed_count: number
}

export const storageManagementService = {
  /**
   * Get current active storage configuration
   */
  async getCurrentConfig(): Promise<ApiResponse<StorageConfig>> {
    return apiClient.get('/v1/admin/storage/config')
  },

  /**
   * Get all storage configurations
   */
  async listConfigs(): Promise<ApiResponse<StorageConfig[]>> {
    return apiClient.get('/v1/admin/storage/configs')
  },

  /**
   * Create new storage configuration
   */
  async createConfig(data: Omit<StorageConfig, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<StorageConfig>> {
    return apiClient.post('/v1/admin/storage/config', data, { skipToast: true })
  },

  /**
   * Update storage configuration
   */
  async updateConfig(id: number, data: Partial<StorageConfig>): Promise<ApiResponse<StorageConfig>> {
    return apiClient.put(`/v1/admin/storage/config/${id}`, data, { skipToast: true })
  },

  /**
   * Test storage connection
   */
  async testConnection(data: Omit<StorageConfig, 'id' | 'is_active' | 'created_at' | 'updated_at'>): Promise<ApiResponse<{ connected: boolean }>> {
    return apiClient.post('/v1/admin/storage/config/test', data, { skipToast: true })
  },

  /**
   * Get storage usage statistics
   */
  async getUsage(): Promise<ApiResponse<StorageUsage>> {
    return apiClient.get('/v1/admin/storage/usage')
  },

  /**
   * Migrate storage from one configuration to another
   */
  async migrateStorage(sourceId: number, destinationId: number): Promise<ApiResponse<MigrationResult>> {
    return apiClient.post('/v1/admin/storage/migrate', {
      source_id: sourceId,
      destination_id: destinationId,
    }, { skipToast: true })
  },

  /**
   * Clean unused files
   */
  async cleanup(olderThanDays?: number): Promise<ApiResponse<CleanupResult>> {
    return apiClient.post('/v1/admin/storage/cleanup', {
      older_than_days: olderThanDays,
    }, { skipToast: true })
  },

  /**
   * Activate storage configuration
   */
  async activateConfig(id: number): Promise<ApiResponse<StorageConfig>> {
    return apiClient.post(`/v1/admin/storage/config/${id}/activate`, undefined, { skipToast: true })
  },

  /**
   * Delete storage configuration
   */
  async deleteConfig(id: number): Promise<ApiResponse<null>> {
    return apiClient.delete(`/v1/admin/storage/config/${id}`, { skipToast: true })
  },

  /**
   * Upload a single file (customer endpoint)
   */
  async uploadFile(file: File, path?: string): Promise<ApiResponse<UploadedFile>> {
    const formData = new FormData()
    formData.append('file', file)
    if (path) {
      formData.append('path', path)
    }
    return apiClient.post('/v1/customer/storage/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      skipToast: true,
    })
  },

  /**
   * Upload a single file with progress tracking (customer endpoint)
   * Uses apiClient with onUploadProgress for consistency
   */
  uploadFileWithProgress(
    file: File, 
    path: string | undefined,
    onProgress: (progress: number) => void,
    onComplete?: (response: ApiResponse<UploadedFile>) => void,
    onError?: (error: Error) => void
  ): { promise: Promise<ApiResponse<UploadedFile>>; abort: () => void } {
    const formData = new FormData()
    formData.append('file', file)
    if (path) {
      formData.append('path', path)
    }

    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source()
    
    const promise = apiClient.post<ApiResponse<UploadedFile>>(
      '/v1/customer/storage/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipToast: true,
        cancelToken: cancelTokenSource.token,
        onUploadProgress: (event) => {
          if (event.total) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            onProgress(percentComplete)
          }
        },
      }
    ).then((response) => {
      onComplete?.(response as unknown as ApiResponse<UploadedFile>)
      return response as unknown as ApiResponse<UploadedFile>
    }).catch((error) => {
      if (axios.isCancel(error)) {
        const cancelResponse: ApiResponse<UploadedFile> = { 
          success: false, 
          message: 'Upload cancelled', 
          data: undefined 
        }
        onComplete?.(cancelResponse)
        return cancelResponse
      }
      const errorResponse: ApiResponse<UploadedFile> = { 
        success: false, 
        message: error.message || 'Upload failed', 
        data: undefined 
      }
      onError?.(error)
      onComplete?.(errorResponse)
      return errorResponse
    })

    return {
      promise,
      abort: () => cancelTokenSource.cancel('Upload cancelled by user'),
    }
  },

  /**
   * Bulk upload files (customer endpoint)
   */
  async bulkUploadFiles(files: File[]): Promise<ApiResponse<BulkUploadResult>> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files[]', file)
    })
    return apiClient.post('/v1/customer/storage/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      skipToast: true,
    })
  },

  /**
   * Upload a single file with progress tracking (admin endpoint)
   * Uses apiClient with onUploadProgress for consistency
   */
  uploadFileWithProgressAdmin(
    file: File, 
    path: string | undefined,
    onProgress: (progress: number) => void,
    onComplete?: (response: ApiResponse<UploadedFile>) => void,
    onError?: (error: Error) => void
  ): { promise: Promise<ApiResponse<UploadedFile>>; abort: () => void } {
    const formData = new FormData()
    formData.append('file', file)
    if (path) {
      formData.append('path', path)
    }

    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source()
    
    const promise = apiClient.post<ApiResponse<UploadedFile>>(
      '/v1/admin/storage/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        skipToast: true,
        cancelToken: cancelTokenSource.token,
        onUploadProgress: (event) => {
          if (event.total) {
            const percentComplete = Math.round((event.loaded / event.total) * 100)
            onProgress(percentComplete)
          }
        },
      }
    ).then((response) => {
      onComplete?.(response as unknown as ApiResponse<UploadedFile>)
      return response as unknown as ApiResponse<UploadedFile>
    }).catch((error) => {
      if (axios.isCancel(error)) {
        const cancelResponse: ApiResponse<UploadedFile> = { 
          success: false, 
          message: 'Upload cancelled', 
          data: undefined 
        }
        onComplete?.(cancelResponse)
        return cancelResponse
      }
      const errorResponse: ApiResponse<UploadedFile> = { 
        success: false, 
        message: error.message || 'Upload failed', 
        data: undefined 
      }
      onError?.(error)
      onComplete?.(errorResponse)
      return errorResponse
    })

    return {
      promise,
      abort: () => cancelTokenSource.cancel('Upload cancelled by user'),
    }
  },

  /**
   * Download a file by ID (customer endpoint)
   * Uses the download API endpoint with auth
   */
  async downloadFile(fileId: number, filename: string): Promise<void> {
    return downloadFile(`/v1/customer/storage/files/${fileId}/download`, filename, true)
  },

  /**
   * Download a file by ID (admin endpoint)
   * Uses the download API endpoint with auth
   */
  async downloadFileAdmin(fileId: number, filename: string): Promise<void> {
    return downloadFile(`/v1/admin/storage/files/${fileId}/download`, filename, true)
  },
}
