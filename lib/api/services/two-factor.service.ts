import { apiClient, ApiResponse } from '../client'

export interface TwoFactorStatus {
  enabled: boolean
  required: boolean
  enabled_at?: string | null
}

export interface TwoFactorSetup {
  secret: string
  qr_code_url: string
}

export interface TwoFactorEnableResponse {
  enabled: boolean
  backup_codes: string[]
}

export interface TwoFactorBackupCodesResponse {
  backup_codes: string[]
}

export const twoFactorService = {
  /**
   * Get 2FA status for current user
   */
  async getStatus(): Promise<ApiResponse<TwoFactorStatus>> {
    return apiClient.get('/v1/auth/2fa/status')
  },

  /**
   * Generate secret and QR code for 2FA setup
   */
  async setup(): Promise<ApiResponse<TwoFactorSetup>> {
    return apiClient.post('/v1/auth/2fa/setup', {}, { skipToast: true })
  },

  /**
   * Enable 2FA for current user
   */
  async enable(secret: string, code: string): Promise<ApiResponse<TwoFactorEnableResponse>> {
    return apiClient.post('/v1/auth/2fa/enable', { secret, code }, { skipToast: true })
  },

  /**
   * Disable 2FA for current user
   */
  async disable(code: string): Promise<ApiResponse<{ enabled: boolean }>> {
    return apiClient.post('/v1/auth/2fa/disable', { code }, { skipToast: true })
  },

  /**
   * Verify 2FA code (for login)
   */
  async verify(code: string, email: string): Promise<ApiResponse<{ user: any; token: string }>> {
    return apiClient.post('/v1/auth/2fa/verify', { code, email }, { skipToast: true })
  },

  /**
   * Get backup codes for current user
   */
  async getBackupCodes(): Promise<ApiResponse<TwoFactorBackupCodesResponse>> {
    return apiClient.get('/v1/auth/2fa/backup-codes', { skipToast: true })
  },
}
