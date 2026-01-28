import { apiClient, ApiResponse } from '../client'
import type { AuthFeatures, PasswordSettings } from './auth-settings.service'

export interface LoginRequest {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginResponse {
  user: {
    id: number
    name: string
    email: string
    role?: string
    roles?: Array<{
      id: number
      name: string
      slug: string
      permissions?: Array<{
        id: number
        name: string
        slug: string
      }>
    }>
    email_verified_at?: string
    created_at: string
    updated_at: string
  }
  token: string
}

export interface RegisterResponse {
  id: number
  name: string
  email: string
  email_verified_at?: string
  created_at: string
  updated_at: string
}

/**
 * Public auth features response
 * Combines AuthFeatures with password requirements for public consumption
 */
export interface PublicAuthFeatures extends AuthFeatures {
  password?: PasswordSettings
}

export const authService = {
  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post('/v1/auth/login', data, { skipToast: true })
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return apiClient.post('/v1/auth/register', data, { skipToast: true })
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<null>> {
    return apiClient.post('/v1/auth/logout', {}, { skipToast: true })
  },

  /**
   * Request magic link
   */
  async requestMagicLink(email: string): Promise<ApiResponse<{ message: string; expires_at: string }>> {
    return apiClient.post('/v1/auth/magic-link/request', { email }, { skipToast: true })
  },

  /**
   * Verify magic link
   */
  async verifyMagicLink(token: string): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post('/v1/auth/magic-link/verify', { token }, { skipToast: true })
  },

  /**
   * Request OTP
   */
  async requestOTP(email: string, type?: 'login' | 'verification' | 'password_reset'): Promise<ApiResponse<{ message: string; expires_at: string }>> {
    return apiClient.post('/v1/auth/otp/request', { email, type }, { skipToast: true })
  },

  /**
   * Verify OTP
   */
  async verifyOTP(code: string, email?: string, userId?: number, type?: 'login' | 'verification' | 'password_reset'): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post('/v1/auth/otp/verify', { code, email, user_id: userId, type }, { skipToast: true })
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/v1/auth/password/reset/request', { email }, { skipToast: true })
  },

  /**
   * Reset password
   */
  async resetPassword(token: string, email: string, password: string, password_confirmation: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/v1/auth/password/reset', {
      token,
      email,
      password,
      password_confirmation,
    }, { skipToast: true })
  },

  /**
   * Verify email address
   */
  async verifyEmail(token: string, email: string): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post('/v1/auth/email/verify', { token, email }, { skipToast: true })
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/v1/auth/email/resend', { email }, { skipToast: true })
  },

  /**
   * Get authentication feature flags (public endpoint)
   * Used to check which auth features are enabled (magic link, social auth, etc.)
   */
  async getAuthFeatures(): Promise<ApiResponse<PublicAuthFeatures>> {
    return apiClient.get('/v1/auth/features', { skipToast: true })
  },
}
