import { apiClient, type ApiResponse } from '../client'

export interface AuthFeatures {
  email_verification?: {
    enabled: boolean
    required: boolean
  }
  password_reset?: {
    enabled: boolean
    token_expiry: number
    rate_limit: number
  }
  magic_link?: {
    enabled: boolean
    token_expiry: number
    rate_limit: number
  }
  otp_2fa?: {
    enabled: boolean
    required_for_admin: boolean
    required_for_customer: boolean
  }
  social_auth?: {
    enabled: boolean
    providers: string[]
    provider_configs?: {
      google?: {
        client_id?: string
        client_secret?: string
        callback_url?: string
      }
      facebook?: {
        client_id?: string
        client_secret?: string
        callback_url?: string
      }
      tiktok?: {
        client_id?: string
        client_secret?: string
        callback_url?: string
        mode?: "sandbox" | "live"
      }
    }
  }
}

export interface AuthEndpoints {
  public?: {
    login?: { enabled: boolean }
    register?: { enabled: boolean }
    password_reset?: { enabled: boolean }
    email_verification?: { enabled: boolean }
    magic_link?: { enabled: boolean }
    otp?: { enabled: boolean }
    social_auth?: { enabled: boolean }
  }
  customer?: {
    logout?: { enabled: boolean }
    refresh_token?: { enabled: boolean }
  }
}

export interface PasswordSettings {
  min_length: number
  require_uppercase: boolean
  require_number: boolean
  require_special: boolean
}

export interface TokenSettings {
  sanctum_expiry: number
  jwt_expiry: number
  refresh_expiry: number
}

export interface RateLimitSettings {
  admin?: {
    limit: number
    period: number
  }
  customer?: {
    limit: number
    period: number
  }
  public?: {
    limit: number
    period: number
  }
  guest?: {
    limit: number
    period: number
  }
}

export interface AuthSettings {
  features: AuthFeatures
  endpoints: AuthEndpoints
  password: PasswordSettings
  token: TokenSettings
  rate_limits: RateLimitSettings
}

export interface UpdateAuthSettingsRequest {
  features?: Partial<AuthFeatures>
  endpoints?: Partial<AuthEndpoints>
  password?: Partial<PasswordSettings>
  token?: Partial<TokenSettings>
  rate_limits?: Partial<RateLimitSettings>
}

export const authSettingsService = {
  /**
   * Get current authentication settings
   */
  async getSettings(): Promise<ApiResponse<AuthSettings>> {
    return apiClient.get('/v1/admin/auth-settings')
  },

  /**
   * Update authentication settings
   */
  async updateSettings(data: UpdateAuthSettingsRequest): Promise<ApiResponse<AuthSettings>> {
    return apiClient.put('/v1/admin/auth-settings', data, {
      skipToast: true, // Skip automatic toast - we'll show a custom one in the component
    })
  },
}
